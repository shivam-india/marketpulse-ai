import { AssetInfo, OrderFlowAnalysis, OrderFlowFootprintBar, LiquidityPool } from "@/types/market";

export interface RealOrderFlowResult {
  isAvailable: boolean;
  providerName: string;
  orderFlow: OrderFlowAnalysis;
  footprintBars: OrderFlowFootprintBar[];
  liquidity: {
    isAvailable: boolean;
    providerName: string;
    bidLiquidityUSD: number;
    askLiquidityUSD: number;
    bestBid: number;
    bestAsk: number;
    spread: number;
    bids: { price: number; quantity: number; totalUSD: number }[];
    asks: { price: number; quantity: number; totalUSD: number }[];
    notice: string;
  };
}

export async function fetchRealOrderFlowAndDepth(asset: AssetInfo): Promise<RealOrderFlowResult> {
  const symbol = asset.symbol.toUpperCase().replace(/\s+/g, "");

  // Crypto pairs supported via Binance Level 2 DOM & Trade Flow
  const binanceMap: Record<string, string> = {
    "BTC/USD": "BTCUSDT",
    "BTCUSD": "BTCUSDT",
    "ETH/USD": "ETHUSDT",
    "ETHUSD": "ETHUSDT",
    "SOL/USD": "SOLUSDT",
    "SOLUSD": "SOLUSDT",
  };

  const binancePair = binanceMap[symbol];

  if (binancePair) {
    try {
      const [depthRes, tradesRes] = await Promise.all([
        fetch(`https://api.binance.com/api/v3/depth?symbol=${binancePair}&limit=50`, { next: { revalidate: 3 } }),
        fetch(`https://api.binance.com/api/v3/aggTrades?symbol=${binancePair}&limit=100`, { next: { revalidate: 3 } }),
      ]);

      if (depthRes.ok && tradesRes.ok) {
        const depth = await depthRes.json();
        const trades: any[] = await tradesRes.json();

        // 1. Calculate Real L2 Liquidity & Order Book DOM
        let bidLiquidityUSD = 0;
        const bids = (depth.bids || []).slice(0, 15).map(([p, q]: [string, string]) => {
          const price = parseFloat(p);
          const quantity = parseFloat(q);
          const totalUSD = price * quantity;
          bidLiquidityUSD += totalUSD;
          return { price, quantity, totalUSD };
        });

        let askLiquidityUSD = 0;
        const asks = (depth.asks || []).slice(0, 15).map(([p, q]: [string, string]) => {
          const price = parseFloat(p);
          const quantity = parseFloat(q);
          const totalUSD = price * quantity;
          askLiquidityUSD += totalUSD;
          return { price, quantity, totalUSD };
        });

        const bestBid = bids[0]?.price || asset.currentPrice;
        const bestAsk = asks[0]?.price || asset.currentPrice;
        const spread = Number((bestAsk - bestBid).toFixed(asset.decimals));

        // 2. Calculate Real Aggressive Trade Order Flow & Delta
        let buyQty = 0;
        let sellQty = 0;
        const priceBuckets = new Map<number, { buy: number; sell: number; total: number }>();

        for (const t of trades) {
          const price = parseFloat(t.p);
          const qty = parseFloat(t.q);
          const isSell = t.m; // buyer was maker = aggressive market sell hitting bid
          const isBuy = !t.m; // buyer was taker = aggressive market buy lifting ask

          if (isBuy) buyQty += qty;
          if (isSell) sellQty += qty;

          // Round to nearest price bucket for footprint
          const bucketPrice = Number(price.toFixed(asset.decimals <= 2 ? 1 : 2));
          const existing = priceBuckets.get(bucketPrice) || { buy: 0, sell: 0, total: 0 };
          if (isBuy) existing.buy += qty;
          if (isSell) existing.sell += qty;
          existing.total += qty;
          priceBuckets.set(bucketPrice, existing);
        }

        const netDelta = buyQty - sellQty;
        const totalVol = buyQty + sellQty;
        const buyPressurePercent = totalVol > 0 ? Math.round((buyQty / totalVol) * 100) : 50;
        const sellPressurePercent = 100 - buyPressurePercent;

        // Volume Profile POC from real trades
        const sortedBuckets = Array.from(priceBuckets.entries()).sort((a, b) => b[1].total - a[1].total);
        const poc = sortedBuckets[0] ? sortedBuckets[0][0] : asset.currentPrice;
        const highVolumeNodes = sortedBuckets.slice(0, 3).map(([p]) => p);
        const lowVolumeNodes = sortedBuckets.slice(-3).map(([p]) => p);

        // Real footprint bar generated from actual transaction delta
        const footprintLevels = sortedBuckets.slice(0, 8).map(([price, data]) => ({
          price,
          bidVolume: Number(data.sell.toFixed(3)),
          askVolume: Number(data.buy.toFixed(3)),
          totalVolume: Number(data.total.toFixed(3)),
          delta: Number((data.buy - data.sell).toFixed(3)),
          imbalanceBuy: data.buy > data.sell * 2.5 && data.buy > 1.0,
          imbalanceSell: data.sell > data.buy * 2.5 && data.sell > 1.0,
        }));

        const nowSec = Math.floor(Date.now() / 1000);
        const footprintBars: OrderFlowFootprintBar[] = [
          {
            time: nowSec,
            priceLevels: footprintLevels,
            totalBid: Number(sellQty.toFixed(3)),
            totalAsk: Number(buyQty.toFixed(3)),
            barDelta: Number(netDelta.toFixed(3)),
            cumulativeDelta: Number(netDelta.toFixed(3)),
            pocPrice: poc,
            valueAreaHigh: Math.max(...highVolumeNodes, poc),
            valueAreaLow: Math.min(...highVolumeNodes, poc),
          },
        ];

        return {
          isAvailable: true,
          providerName: "Binance Live L2 DOM & Aggregated Trades",
          orderFlow: {
            isAvailable: true,
            sourceNote: `Live Level 2 DOM and Aggregated Trades verified directly from Binance spot order book for ${asset.symbol}.`,
            cumulativeDeltaSummary: {
              periodDelta: Number(netDelta.toFixed(4)),
              trend: netDelta > 0 ? "accumulating" : netDelta < 0 ? "distributing" : "neutral",
              divergenceDetected: false,
            },
            volumeProfile: {
              poc,
              vah: Math.max(...highVolumeNodes, poc),
              val: Math.min(...highVolumeNodes, poc),
              highVolumeNodes,
              lowVolumeNodes,
            },
            aggression: {
              buyPressurePercent,
              sellPressurePercent,
              recentImbalanceSpike: Math.abs(netDelta) > totalVol * 0.35,
            },
          },
          footprintBars,
          liquidity: {
            isAvailable: true,
            providerName: "Binance L2 Depth Stream",
            bidLiquidityUSD: Math.round(bidLiquidityUSD),
            askLiquidityUSD: Math.round(askLiquidityUSD),
            bestBid,
            bestAsk,
            spread,
            bids,
            asks,
            notice: "Real-time Level 2 order book depth of market (DOM).",
          },
        };
      }
    } catch (err) {
      console.warn("Binance live order flow error:", err);
    }
  }

  // Strictly return UNAVAILABLE for instruments where the provider doesn't expose real L2 DOM
  return {
    isAvailable: false,
    providerName: asset.dataSource || "Broker Benchmark",
    orderFlow: {
      isAvailable: false,
      sourceNote: "Order-flow data unavailable for this instrument.",
      cumulativeDeltaSummary: {
        periodDelta: 0,
        trend: "neutral",
        divergenceDetected: false,
      },
      volumeProfile: {
        poc: asset.currentPrice,
        vah: asset.currentPrice,
        val: asset.currentPrice,
        highVolumeNodes: [],
        lowVolumeNodes: [],
      },
      aggression: {
        buyPressurePercent: 50,
        sellPressurePercent: 50,
        recentImbalanceSpike: false,
      },
    },
    footprintBars: [],
    liquidity: {
      isAvailable: false,
      providerName: asset.dataSource || "Interbank Benchmark",
      bidLiquidityUSD: 0,
      askLiquidityUSD: 0,
      bestBid: asset.currentPrice,
      bestAsk: asset.currentPrice,
      spread: asset.spread || 0,
      bids: [],
      asks: [],
      notice: "True order-book liquidity data is not available for this instrument/provider.",
    },
  };
}

