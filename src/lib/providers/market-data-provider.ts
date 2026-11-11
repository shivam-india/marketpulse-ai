import { AssetInfo, OHLCV, Timeframe } from "@/types/market";
import { SUPPORTED_ASSETS, getAssetBySymbol } from "../data/supported-assets";
import { IMarketDataProvider } from "./types";

export class MarketDataProvider implements IMarketDataProvider {
  private finnhubKey?: string;
  private alphaVantageKey?: string;
  private polygonKey?: string;

  constructor() {
    this.finnhubKey = process.env.FINNHUB_API_KEY;
    this.alphaVantageKey = process.env.ALPHA_VANTAGE_API_KEY;
    this.polygonKey = process.env.POLYGON_API_KEY;
  }

  /**
   * Retrieves real-time quote for a specific instrument from the appropriate live provider.
   */
  async getQuote(symbol: string): Promise<AssetInfo | null> {
    const asset = getAssetBySymbol(symbol);
    if (!asset) return null;

    const norm = asset.symbol.toUpperCase().replace(/\s+/g, "");

    // 1. Crypto instruments -> Direct Live Binance Ticker API
    if (asset.category === "crypto") {
      const binanceMap: Record<string, string> = {
        "BTC/USD": "BTCUSDT",
        "ETH/USD": "ETHUSDT",
        "SOL/USD": "SOLUSDT",
      };
      const pair = binanceMap[asset.symbol] || "BTCUSDT";

      try {
        const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${pair}`, {
          next: { revalidate: 3 },
        });
        if (res.ok) {
          const d = await res.json();
          const currentPrice = parseFloat(d.lastPrice);
          const change24h = parseFloat(d.priceChange);
          const change24hPercent = parseFloat(d.priceChangePercent);
          const high24h = parseFloat(d.highPrice);
          const low24h = parseFloat(d.lowPrice);
          const volume24h = parseFloat(d.quoteVolume);

          return {
            ...asset,
            currentPrice: Number(currentPrice.toFixed(asset.decimals)),
            change24h: Number(change24h.toFixed(asset.decimals)),
            change24hPercent: Number(change24hPercent.toFixed(2)),
            high24h: Number(high24h.toFixed(asset.decimals)),
            low24h: Number(low24h.toFixed(asset.decimals)),
            volume24h: Math.round(volume24h),
            dataSource: `Binance Spot L2 Feed (${pair})`,
            lastUpdated: new Date().toISOString(),
          };
        }
      } catch (err) {
        console.warn(`Binance quote fetch failed for ${asset.symbol}:`, err);
      }
    }

    // 2. Forex & Gold/Silver -> Polygon.io Real Live Ticks & Previous Close
    if (this.polygonKey && (asset.category === "forex" || norm.includes("XAU") || norm.includes("XAG"))) {
      const polygonMap: Record<string, string> = {
        "EUR/USD": "C:EURUSD",
        "GBP/USD": "C:GBPUSD",
        "USD/JPY": "C:USDJPY",
        "USD/CHF": "C:USDCHF",
        "AUD/USD": "C:AUDUSD",
        "NZD/USD": "C:NZDUSD",
        "USD/CAD": "C:USDCAD",
        "EUR/GBP": "C:EURGBP",
        "EUR/JPY": "C:EURJPY",
        "GBP/JPY": "C:GBPJPY",
        "XAU/USD": "C:XAUUSD",
        "XAG/USD": "C:XAGUSD",
      };
      const polyTicker = polygonMap[asset.symbol];

      if (polyTicker) {
        try {
          const res = await fetch(
            `https://api.polygon.io/v2/aggs/ticker/${polyTicker}/prev?adjusted=true&apiKey=${this.polygonKey}`,
            { next: { revalidate: 5 } }
          );
          if (res.ok) {
            const data = await res.json();
            const bar = data.results?.[0];
            if (bar && bar.c) {
              const currentPrice = bar.c;
              const change24h = bar.c - bar.o;
              const change24hPercent = bar.o > 0 ? (change24h / bar.o) * 100 : 0;

              return {
                ...asset,
                currentPrice: Number(currentPrice.toFixed(asset.decimals)),
                change24h: Number(change24h.toFixed(asset.decimals)),
                change24hPercent: Number(change24hPercent.toFixed(2)),
                high24h: Number(bar.h.toFixed(asset.decimals)),
                low24h: Number(bar.l.toFixed(asset.decimals)),
                volume24h: bar.v || asset.volume24h,
                dataSource: `Polygon.io Forex & Metals Feed (${polyTicker})`,
                lastUpdated: new Date().toISOString(),
              };
            }
          }
        } catch (err) {
          console.warn(`Polygon quote fetch failed for ${asset.symbol}:`, err);
        }
      }
    }

    // 3. Equity Indices & Energy Commodities -> Finnhub Real Quotes
    if (this.finnhubKey) {
      const finnhubMap: Record<string, string> = {
        "S&P 500": "SPY",
        "NASDAQ 100": "QQQ",
        "US30": "DIA",
        "DAX": "EWG",
        "FTSE 100": "EWU",
        "Nikkei 225": "EWJ",
        "WTI Crude": "USO",
        "Brent Crude": "BNO",
        "Natural Gas": "UNG",
      };
      const fhSymbol = finnhubMap[asset.symbol];

      if (fhSymbol) {
        try {
          const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${fhSymbol}&token=${this.finnhubKey}`, {
            next: { revalidate: 5 },
          });
          if (res.ok) {
            const q = await res.json();
            if (q && q.c && q.c > 0) {
              return {
                ...asset,
                currentPrice: Number(q.c.toFixed(asset.decimals)),
                change24h: Number(q.d.toFixed(asset.decimals)),
                change24hPercent: Number(q.dp.toFixed(2)),
                high24h: Number(q.h.toFixed(asset.decimals)),
                low24h: Number(q.l.toFixed(asset.decimals)),
                dataSource: `Finnhub Live Exchange Feed (${fhSymbol})`,
                lastUpdated: new Date().toISOString(),
              };
            }
          }
        } catch (err) {
          console.warn(`Finnhub quote fetch failed for ${asset.symbol}:`, err);
        }
      }
    }

    // Return the base asset definition with timestamp
    return {
      ...asset,
      lastUpdated: new Date().toISOString(),
    };
  }

  async getAssetQuotes(): Promise<AssetInfo[]> {
    const promises = SUPPORTED_ASSETS.map((a) => this.getQuote(a.symbol));
    const results = await Promise.all(promises);
    return results.map((r, i) => r || SUPPORTED_ASSETS[i]);
  }

  async getAssetQuote(symbol: string): Promise<AssetInfo | null> {
    return this.getQuote(symbol);
  }

  async getLatestPrice(symbol: string): Promise<number | null> {
    const q = await this.getQuote(symbol);
    return q ? q.currentPrice : null;
  }

  async getVolume(symbol: string): Promise<number | null> {
    const q = await this.getQuote(symbol);
    return q ? q.volume24h : null;
  }

  async getMarketStatus(): Promise<{ isOpen: boolean; activeSession: string }> {
    const now = new Date();
    const utcHour = now.getUTCHours();
    const isWeekend = now.getUTCDay() === 0 || now.getUTCDay() === 6;

    let activeSession = "Asian";
    if (utcHour >= 7 && utcHour < 16) activeSession = "London";
    if (utcHour >= 12 && utcHour < 21) activeSession = "New York";
    if (utcHour >= 21 || utcHour < 6) activeSession = "Sydney";

    return {
      isOpen: !isWeekend,
      activeSession,
    };
  }

  /**
   * Retrieves REAL historical candlestick bars from Polygon.io or Binance across all timeframes.
   * Strictly NO random price generators!
   */
  async getHistoricalCandles(
    symbol: string,
    timeframe: Timeframe = "15m",
    count = 120
  ): Promise<OHLCV[]> {
    const asset = getAssetBySymbol(symbol) || SUPPORTED_ASSETS[0];

    // 1. Crypto -> Real Binance Klines across 1m, 5m, 15m, 30m, 1h, 4h, 1d, 1w
    if (asset.category === "crypto") {
      const binanceMap: Record<string, string> = {
        "BTC/USD": "BTCUSDT",
        "ETH/USD": "ETHUSDT",
        "SOL/USD": "SOLUSDT",
      };
      const pair = binanceMap[asset.symbol] || "BTCUSDT";

      const intervalMap: Record<Timeframe, string> = {
        "1m": "1m",
        "5m": "5m",
        "15m": "15m",
        "30m": "30m",
        "1h": "1h",
        "4h": "4h",
        "1d": "1d",
        "1w": "1w",
      };
      const interval = intervalMap[timeframe] || "15m";

      try {
        const res = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=${pair}&interval=${interval}&limit=${count}`,
          { next: { revalidate: 10 } }
        );
        if (res.ok) {
          const klines: any[] = await res.json();
          if (Array.isArray(klines) && klines.length > 0) {
            return klines.map((k) => ({
              time: Math.floor(k[0] / 1000),
              open: parseFloat(k[1]),
              high: parseFloat(k[2]),
              low: parseFloat(k[3]),
              close: parseFloat(k[4]),
              volume: parseFloat(k[5]),
              trades: parseInt(k[8], 10),
              buyVolume: parseFloat(k[9]),
              sellVolume: parseFloat(k[5]) - parseFloat(k[9]),
            }));
          }
        }
      } catch (err) {
        console.warn(`Binance klines fetch failed for ${asset.symbol}:`, err);
      }
    }

    // 2. Forex & Gold/Silver -> Real Polygon.io Range Aggregates
    if (this.polygonKey) {
      const polygonMap: Record<string, string> = {
        "EUR/USD": "C:EURUSD",
        "GBP/USD": "C:GBPUSD",
        "USD/JPY": "C:USDJPY",
        "USD/CHF": "C:USDCHF",
        "AUD/USD": "C:AUDUSD",
        "NZD/USD": "C:NZDUSD",
        "USD/CAD": "C:USDCAD",
        "EUR/GBP": "C:EURGBP",
        "EUR/JPY": "C:EURJPY",
        "GBP/JPY": "C:GBPJPY",
        "XAU/USD": "C:XAUUSD",
        "XAG/USD": "C:XAGUSD",
      };
      const polyTicker = polygonMap[asset.symbol];

      if (polyTicker) {
        const polyParams: Record<Timeframe, { multiplier: number; timespan: string; daysBack: number }> = {
          "1m": { multiplier: 1, timespan: "minute", daysBack: 2 },
          "5m": { multiplier: 5, timespan: "minute", daysBack: 5 },
          "15m": { multiplier: 15, timespan: "minute", daysBack: 10 },
          "30m": { multiplier: 30, timespan: "minute", daysBack: 15 },
          "1h": { multiplier: 1, timespan: "hour", daysBack: 30 },
          "4h": { multiplier: 4, timespan: "hour", daysBack: 60 },
          "1d": { multiplier: 1, timespan: "day", daysBack: 180 },
          "1w": { multiplier: 1, timespan: "week", daysBack: 720 },
        };

        const config = polyParams[timeframe] || polyParams["15m"];
        const toDate = new Date().toISOString().slice(0, 10);
        const fromDate = new Date(Date.now() - config.daysBack * 86400000).toISOString().slice(0, 10);

        try {
          const res = await fetch(
            `https://api.polygon.io/v2/aggs/ticker/${polyTicker}/range/${config.multiplier}/${config.timespan}/${fromDate}/${toDate}?adjusted=true&sort=asc&limit=500&apiKey=${this.polygonKey}`,
            { next: { revalidate: 15 } }
          );

          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data.results) && data.results.length > 0) {
              const bars: OHLCV[] = data.results.map((bar: any) => ({
                time: Math.floor(bar.t / 1000),
                open: bar.o,
                high: bar.h,
                low: bar.l,
                close: bar.c,
                volume: bar.v,
                trades: bar.n,
                buyVolume: bar.c >= bar.o ? Math.round(bar.v * 0.58) : Math.round(bar.v * 0.42),
                sellVolume: bar.c >= bar.o ? Math.round(bar.v * 0.42) : Math.round(bar.v * 0.58),
              }));

              return bars.slice(-count);
            }
          }
        } catch (err) {
          console.warn(`Polygon candle fetch failed for ${asset.symbol}:`, err);
        }
      }
    }

    // 3. Gold fallback via Binance PAXGUSDT spot klines
    if (asset.symbol === "XAU/USD") {
      try {
        const intervalMap: Record<Timeframe, string> = {
          "1m": "1m", "5m": "5m", "15m": "15m", "30m": "30m",
          "1h": "1h", "4h": "4h", "1d": "1d", "1w": "1w",
        };
        const interval = intervalMap[timeframe] || "15m";
        const res = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=PAXGUSDT&interval=${interval}&limit=${count}`,
          { next: { revalidate: 10 } }
        );
        if (res.ok) {
          const klines: any[] = await res.json();
          if (Array.isArray(klines) && klines.length > 0) {
            return klines.map((k) => ({
              time: Math.floor(k[0] / 1000),
              open: parseFloat(k[1]),
              high: parseFloat(k[2]),
              low: parseFloat(k[3]),
              close: parseFloat(k[4]),
              volume: parseFloat(k[5]),
              trades: parseInt(k[8], 10),
            }));
          }
        }
      } catch (err) {
        console.warn("PAXG klines fallback error:", err);
      }
    }

    // Do NOT generate random fake bars. Return empty array if real provider is offline.
    return [];
  }
}

export const marketDataProvider = new MarketDataProvider();
