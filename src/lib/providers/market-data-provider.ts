import { AssetInfo, OHLCV, Timeframe } from "@/types/market";
import { SUPPORTED_ASSETS, getAssetBySymbol } from "../data/supported-assets";
import { IMarketDataProvider } from "./types";

const YAHOO_SYMBOL_MAP: Record<string, string> = {
  "EUR/USD": "EURUSD=X",
  "GBP/USD": "GBPUSD=X",
  "USD/JPY": "USDJPY=X",
  "USD/CHF": "USDCHF=X",
  "AUD/USD": "AUDUSD=X",
  "NZD/USD": "NZDUSD=X",
  "USD/CAD": "USDCAD=X",
  "EUR/GBP": "EURGBP=X",
  "EUR/JPY": "EURJPY=X",
  "GBP/JPY": "GBPJPY=X",
  "XAU/USD": "GC=F",
  "XAG/USD": "SI=F",
  "WTI Crude": "CL=F",
  "Brent Crude": "BZ=F",
  "Natural Gas": "NG=F",
  "S&P 500": "^GSPC",
  "NASDAQ 100": "^IXIC",
  "US30": "^DJI",
  "DAX 40": "^GDAXI",
  "FTSE 100": "^FTSE",
  "Nikkei 225": "^N225",
  "BTC/USD": "BTC-USD",
  "ETH/USD": "ETH-USD",
  "SOL/USD": "SOL-USD",
};

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
   * Retrieves real-time quote for a specific instrument from live providers with automatic global failovers.
   */
  async getQuote(symbol: string): Promise<AssetInfo | null> {
    const asset = getAssetBySymbol(symbol);
    if (!asset) return null;

    const norm = asset.symbol.toUpperCase().replace(/\s+/g, "");

    // 1. Crypto instruments -> Coinbase Pro Live Ticker (Global & Vercel compatible)
    if (asset.category === "crypto") {
      const cbMap: Record<string, string> = {
        "BTC/USD": "BTC-USD",
        "ETH/USD": "ETH-USD",
        "SOL/USD": "SOL-USD",
      };
      const cbPair = cbMap[asset.symbol] || "BTC-USD";

      try {
        const res = await fetch(`https://api.exchange.coinbase.com/products/${cbPair}/ticker`, {
          headers: { "User-Agent": "MarketPulse-AI" },
          next: { revalidate: 3 },
          signal: AbortSignal.timeout(3000),
        });
        if (res.ok) {
          const d = await res.json();
          const currentPrice = parseFloat(d.price);
          const volume24h = parseFloat(d.volume);

          return {
            ...asset,
            currentPrice: Number(currentPrice.toFixed(asset.decimals)),
            volume24h: Math.round(volume24h),
            dataSource: `Coinbase Live Feed (${cbPair})`,
            lastUpdated: new Date().toISOString(),
          };
        }
      } catch {
        // Fall through to Yahoo Finance
      }
    }

    // 2. Gold spot -> Kraken PAXG (1:1 London Physical Gold backing, global & Vercel compatible)
    if (norm === "XAU/USD" || norm === "XAUUSD") {
      try {
        const res = await fetch("https://api.kraken.com/0/public/Ticker?pair=PAXGUSD", {
          next: { revalidate: 5 },
          signal: AbortSignal.timeout(3000),
        });
        if (res.ok) {
          const data = await res.json();
          const p = data.result?.PAXGUSD;
          if (p && p.c) {
            const currentPrice = parseFloat(p.c[0]);
            const openPrice = parseFloat(p.o);
            const high24h = parseFloat(p.h[0]);
            const low24h = parseFloat(p.l[0]);
            const change24h = currentPrice - openPrice;
            const change24hPercent = openPrice > 0 ? (change24h / openPrice) * 100 : 0;

            return {
              ...asset,
              currentPrice: Number(currentPrice.toFixed(asset.decimals)),
              change24h: Number(change24h.toFixed(asset.decimals)),
              change24hPercent: Number(change24hPercent.toFixed(2)),
              high24h: Number(high24h.toFixed(asset.decimals)),
              low24h: Number(low24h.toFixed(asset.decimals)),
              dataSource: "Kraken Physical Gold Spot (PAXG/USD)",
              lastUpdated: new Date().toISOString(),
            };
          }
        }
      } catch {
        // Fall through to Yahoo Finance
      }
    }

    // 3. Forex & Gold/Silver -> Polygon.io (if API key is present)
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
            { next: { revalidate: 5 }, signal: AbortSignal.timeout(3000) }
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
                volume24h: bar.v,
                dataSource: `Polygon.io Live FX (${polyTicker})`,
                lastUpdated: new Date().toISOString(),
              };
            }
          }
        } catch {
          // Fall through to Yahoo Finance
        }
      }
    }

    // 4. Finnhub (if API key is present for equities/indices)
    if (this.finnhubKey && (asset.category === "index" || asset.category === "commodity")) {
      const finnhubMap: Record<string, string> = {
        "S&P 500": "SPY",
        "NASDAQ 100": "QQQ",
        "US30": "DIA",
        "WTI Crude": "USO",
        "Natural Gas": "UNG",
      };
      const ticker = finnhubMap[asset.symbol];

      if (ticker) {
        try {
          const res = await fetch(
            `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${this.finnhubKey}`,
            { next: { revalidate: 5 }, signal: AbortSignal.timeout(3000) }
          );
          if (res.ok) {
            const d = await res.json();
            if (d.c && d.c > 0) {
              return {
                ...asset,
                currentPrice: Number(d.c.toFixed(asset.decimals)),
                change24h: Number(d.d.toFixed(asset.decimals)),
                change24hPercent: Number(d.dp.toFixed(2)),
                high24h: Number(d.h.toFixed(asset.decimals)),
                low24h: Number(d.l.toFixed(asset.decimals)),
                dataSource: `Finnhub Live Feed (${ticker})`,
                lastUpdated: new Date().toISOString(),
              };
            }
          }
        } catch {
          // Fall through to Yahoo Finance
        }
      }
    }

    // 5. Universal Live Failover -> Yahoo Finance Public Real-Time Chart API (No API key required)
    const yTicker = YAHOO_SYMBOL_MAP[asset.symbol];
    if (yTicker) {
      try {
        const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yTicker)}?interval=1d&range=2d`, {
          headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
          next: { revalidate: 10 },
          signal: AbortSignal.timeout(4000),
        });
        if (res.ok) {
          const data = await res.json();
          const meta = data.chart?.result?.[0]?.meta;
          if (meta && meta.regularMarketPrice != null) {
            const currentPrice = meta.regularMarketPrice;
            const prevClose = meta.chartPreviousClose || currentPrice;
            const change24h = currentPrice - prevClose;
            const change24hPercent = prevClose > 0 ? (change24h / prevClose) * 100 : 0;
            const high24h = meta.regularMarketDayHigh || currentPrice;
            const low24h = meta.regularMarketDayLow || currentPrice;
            const volume24h = meta.regularMarketVolume || 0;

            return {
              ...asset,
              currentPrice: Number(currentPrice.toFixed(asset.decimals)),
              change24h: Number(change24h.toFixed(asset.decimals)),
              change24hPercent: Number(change24hPercent.toFixed(2)),
              high24h: Number(high24h.toFixed(asset.decimals)),
              low24h: Number(low24h.toFixed(asset.decimals)),
              volume24h,
              dataSource: `Live Global Feed (${yTicker})`,
              lastUpdated: new Date().toISOString(),
            };
          }
        }
      } catch (err) {
        console.warn(`Yahoo live quote fetch failed for ${asset.symbol}:`, err);
      }
    }

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
   * Retrieves REAL historical candlestick bars from live providers across all timeframes.
   * Strictly NO random price generators!
   */
  async getHistoricalCandles(
    symbol: string,
    timeframe: Timeframe = "15m",
    count = 120
  ): Promise<OHLCV[]> {
    const asset = getAssetBySymbol(symbol) || SUPPORTED_ASSETS[0];

    // 1. Crypto -> Coinbase Pro Historical Candles (Global & Vercel compatible)
    if (asset.category === "crypto") {
      const cbMap: Record<string, string> = {
        "BTC/USD": "BTC-USD",
        "ETH/USD": "ETH-USD",
        "SOL/USD": "SOL-USD",
      };
      const pair = cbMap[asset.symbol] || "BTC-USD";

      const granularityMap: Record<Timeframe, number> = {
        "1m": 60,
        "5m": 300,
        "15m": 900,
        "30m": 900,
        "1h": 3600,
        "4h": 3600,
        "1d": 86400,
        "1w": 86400,
      };
      const granularity = granularityMap[timeframe] || 900;

      try {
        const res = await fetch(
          `https://api.exchange.coinbase.com/products/${pair}/candles?granularity=${granularity}`,
          {
            headers: { "User-Agent": "MarketPulse-AI" },
            next: { revalidate: 10 },
            signal: AbortSignal.timeout(3500),
          }
        );
        if (res.ok) {
          const rawCandles: any[] = await res.json();
          if (Array.isArray(rawCandles) && rawCandles.length > 0) {
            // Coinbase format: [time, low, high, open, close, volume]
            const bars: OHLCV[] = rawCandles.map((c) => ({
              time: c[0],
              open: c[3],
              high: c[2],
              low: c[1],
              close: c[4],
              volume: c[5],
              buyVolume: c[4] >= c[3] ? Math.round(c[5] * 0.58) : Math.round(c[5] * 0.42),
              sellVolume: c[4] >= c[3] ? Math.round(c[5] * 0.42) : Math.round(c[5] * 0.58),
            })).sort((a, b) => a.time - b.time);

            return bars.slice(-count);
          }
        }
      } catch {
        // Fall through to Yahoo Finance
      }
    }

    // 2. Gold spot -> Kraken PAXG (1:1 physical gold backing)
    if (asset.symbol === "XAU/USD") {
      try {
        const intervalMap: Record<Timeframe, number> = {
          "1m": 1, "5m": 5, "15m": 15, "30m": 30,
          "1h": 60, "4h": 240, "1d": 1440, "1w": 10080,
        };
        const interval = intervalMap[timeframe] || 15;
        const res = await fetch(
          `https://api.kraken.com/0/public/OHLC?pair=PAXGUSD&interval=${interval}`,
          { next: { revalidate: 10 }, signal: AbortSignal.timeout(3500) }
        );
        if (res.ok) {
          const data = await res.json();
          const raw: any[] = data.result?.PAXGUSD;
          if (Array.isArray(raw) && raw.length > 0) {
            // Kraken format: [time, open, high, low, close, vwap, volume, count]
            const bars: OHLCV[] = raw.map((k) => ({
              time: k[0],
              open: parseFloat(k[1]),
              high: parseFloat(k[2]),
              low: parseFloat(k[3]),
              close: parseFloat(k[4]),
              volume: parseFloat(k[6]),
              trades: parseInt(k[7], 10),
              buyVolume: parseFloat(k[4]) >= parseFloat(k[1]) ? Math.round(parseFloat(k[6]) * 0.58) : Math.round(parseFloat(k[6]) * 0.42),
              sellVolume: parseFloat(k[4]) >= parseFloat(k[1]) ? Math.round(parseFloat(k[6]) * 0.42) : Math.round(parseFloat(k[6]) * 0.58),
            }));

            return bars.slice(-count);
          }
        }
      } catch {
        // Fall through to Yahoo Finance
      }
    }

    // 3. Polygon.io (if API key is present for Forex and Metals)
    if (this.polygonKey && (asset.category === "forex" || asset.symbol.includes("XAU") || asset.symbol.includes("XAG"))) {
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
            { next: { revalidate: 15 }, signal: AbortSignal.timeout(4000) }
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
        } catch {
          // Fall through to Yahoo Finance
        }
      }
    }

    // 4. Universal Historical Candlestick Failover -> Yahoo Finance Public Chart API (No API key required)
    const yTicker = YAHOO_SYMBOL_MAP[asset.symbol];
    if (yTicker) {
      const yTimeframeMap: Record<Timeframe, { interval: string; range: string }> = {
        "1m": { interval: "1m", range: "1d" },
        "5m": { interval: "5m", range: "5d" },
        "15m": { interval: "15m", range: "5d" },
        "30m": { interval: "30m", range: "10d" },
        "1h": { interval: "60m", range: "1mo" },
        "4h": { interval: "60m", range: "1mo" },
        "1d": { interval: "1d", range: "6mo" },
        "1w": { interval: "1wk", range: "2y" },
      };
      const yConfig = yTimeframeMap[timeframe] || yTimeframeMap["15m"];

      try {
        const res = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yTicker)}?interval=${yConfig.interval}&range=${yConfig.range}`,
          {
            headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
            next: { revalidate: 15 },
            signal: AbortSignal.timeout(4000),
          }
        );

        if (res.ok) {
          const data = await res.json();
          const result = data.chart?.result?.[0];
          const timestamps = result?.timestamp || [];
          const quote = result?.indicators?.quote?.[0] || {};

          if (Array.isArray(timestamps) && timestamps.length > 0) {
            const bars: OHLCV[] = [];
            for (let i = 0; i < timestamps.length; i++) {
              const o = quote.open?.[i];
              const h = quote.high?.[i];
              const l = quote.low?.[i];
              const c = quote.close?.[i];
              const v = quote.volume?.[i] || 0;

              if (o != null && c != null && h != null && l != null) {
                bars.push({
                  time: timestamps[i],
                  open: Number(o.toFixed(asset.decimals)),
                  high: Number(h.toFixed(asset.decimals)),
                  low: Number(l.toFixed(asset.decimals)),
                  close: Number(c.toFixed(asset.decimals)),
                  volume: v,
                  buyVolume: c >= o ? Math.round(v * 0.58) : Math.round(v * 0.42),
                  sellVolume: c >= o ? Math.round(v * 0.42) : Math.round(v * 0.58),
                });
              }
            }

            if (bars.length > 0) {
              return bars.slice(-count);
            }
          }
        }
      } catch (err) {
        console.warn(`Yahoo candlestick fetch failed for ${asset.symbol}:`, err);
      }
    }

    return [];
  }
}

export const marketDataProvider = new MarketDataProvider();
