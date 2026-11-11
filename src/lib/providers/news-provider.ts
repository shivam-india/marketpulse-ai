import { MarketNewsItem, BiasDirection } from "@/types/market";
import { INewsProvider } from "./types";

export class NewsProvider implements INewsProvider {
  private finnhubKey?: string;
  private newsApiKey?: string;
  private cachedNews: MarketNewsItem[] = [];
  private lastFetchedAt: number = 0;

  constructor() {
    this.finnhubKey = process.env.FINNHUB_API_KEY;
    this.newsApiKey = process.env.NEWS_API_KEY;
  }

  async getTopMarketNews(limit = 15): Promise<MarketNewsItem[]> {
    const now = Date.now();
    // Cache for 3 minutes to avoid burning API rate limits
    if (this.cachedNews.length > 0 && now - this.lastFetchedAt < 180000) {
      return this.cachedNews.slice(0, limit);
    }

    const collected: MarketNewsItem[] = [];

    // 1. Fetch Real Live Finnhub Market News
    if (this.finnhubKey) {
      try {
        const res = await fetch(
          `https://finnhub.io/api/v1/news?category=general&token=${this.finnhubKey}`,
          { next: { revalidate: 180 } }
        );
        if (res.ok) {
          const rawItems: any[] = await res.json();
          if (Array.isArray(rawItems) && rawItems.length > 0) {
            for (const item of rawItems.slice(0, 20)) {
              const text = `${item.headline} ${item.summary || ""}`.toLowerCase();
              let bias: BiasDirection = "neutral";
              let score = 0;

              if (
                text.includes("surge") ||
                text.includes("rebound") ||
                text.includes("rally") ||
                text.includes("gain") ||
                text.includes("record high") ||
                text.includes("rate cut") ||
                text.includes("boost")
              ) {
                bias = "bullish";
                score = 0.58;
              } else if (
                text.includes("drop") ||
                text.includes("plunge") ||
                text.includes("slump") ||
                text.includes("inflation surge") ||
                text.includes("recession") ||
                text.includes("decline") ||
                text.includes("war")
              ) {
                bias = "bearish";
                score = -0.58;
              }

              // Detect related assets from real headline text
              const relatedAssets: string[] = [];
              if (text.includes("oil") || text.includes("crude") || text.includes("energy")) relatedAssets.push("WTI Crude", "Brent Crude");
              if (text.includes("gold") || text.includes("bullion") || text.includes("metals")) relatedAssets.push("XAU/USD", "XAG/USD");
              if (text.includes("dollar") || text.includes("fed") || text.includes("treasury") || text.includes("yield")) relatedAssets.push("EUR/USD", "USD/JPY", "S&P 500");
              if (text.includes("bitcoin") || text.includes("crypto") || text.includes("btc")) relatedAssets.push("BTC/USD", "ETH/USD");
              if (text.includes("stock") || text.includes("nasdaq") || text.includes("tech") || text.includes("s&p")) relatedAssets.push("S&P 500", "NASDAQ 100");
              if (relatedAssets.length === 0) relatedAssets.push("S&P 500", "EUR/USD");

              collected.push({
                id: `finnhub-${item.id}`,
                headline: item.headline,
                summary: item.summary || item.headline,
                source: item.source || "Reuters / Finnhub Live Wire",
                url: item.url,
                publishedAt: new Date((item.datetime || Date.now() / 1000) * 1000).toISOString(),
                timestamp: item.datetime || Math.floor(Date.now() / 1000),
                sentiment: {
                  bias,
                  score,
                  confidence: 85,
                },
                affectedCurrencies: text.includes("euro") ? ["EUR", "USD"] : text.includes("yen") ? ["JPY", "USD"] : ["USD"],
                affectedAssets: relatedAssets,
                expectedImpact: {
                  shortTerm: bias === "bullish" ? "Constructive risk momentum for affected assets." : bias === "bearish" ? "Risk-off caution / overhead supply pressure." : "Neutral consolidation pending confirmation.",
                  mediumTerm: "Subject to broader macroeconomic rate expectations and sovereign monetary policy.",
                  context: "Live market news wire verified from Finnhub institutional stream.",
                },
              });
            }
          }
        }
      } catch (err) {
        console.warn("Finnhub live news fetch error:", err);
      }
    }

    // 2. Fetch Real Live NewsAPI Business News
    if (this.newsApiKey && collected.length < limit) {
      try {
        const res = await fetch(
          `https://newsapi.org/v2/top-headlines?category=business&language=en&apiKey=${this.newsApiKey}`,
          {
            headers: { "User-Agent": "MarketPulseAI/1.0" },
            next: { revalidate: 180 },
          }
        );
        if (res.ok) {
          const raw = await res.json();
          if (raw.status === "ok" && Array.isArray(raw.articles)) {
            for (const art of raw.articles.slice(0, 15)) {
              if (!art.title || collected.some((c) => c.headline === art.title)) continue;
              const text = `${art.title} ${art.description || ""}`.toLowerCase();
              let bias: BiasDirection = "neutral";
              let score = 0;

              if (text.includes("growth") || text.includes("record") || text.includes("profit") || text.includes("jump")) {
                bias = "bullish";
                score = 0.52;
              } else if (text.includes("layoff") || text.includes("drop") || text.includes("warning") || text.includes("crisis")) {
                bias = "bearish";
                score = -0.52;
              }

              collected.push({
                id: `newsapi-${Date.now()}-${Math.random().toString(36).substring(7)}`,
                headline: art.title,
                summary: art.description || art.title,
                source: art.source?.name || "NewsAPI Business Wire",
                url: art.url,
                publishedAt: art.publishedAt || new Date().toISOString(),
                timestamp: Math.floor(new Date(art.publishedAt || Date.now()).getTime() / 1000),
                sentiment: { bias, score, confidence: 80 },
                affectedCurrencies: ["USD"],
                affectedAssets: ["S&P 500", "NASDAQ 100", "EUR/USD"],
                expectedImpact: {
                  shortTerm: "Intraday news sentiment catalyst influencing asset flows.",
                  mediumTerm: "Corporate earnings and economic output trajectory.",
                  context: "Live global news aggregation via NewsAPI.",
                },
              });
            }
          }
        }
      } catch (err) {
        console.warn("NewsAPI live news fetch error:", err);
      }
    }

    if (collected.length > 0) {
      this.cachedNews = collected;
      this.lastFetchedAt = now;
      return collected.slice(0, limit);
    }

    // Do NOT return fake news if providers fail
    return [];
  }

  async getNewsForAsset(symbol: string, limit = 5): Promise<MarketNewsItem[]> {
    const all = await this.getTopMarketNews(25);
    const normalized = symbol.toUpperCase().replace(/\s+/g, "");

    const matched = all.filter((item) =>
      item.affectedAssets.some(
        (a) => a.toUpperCase().replace(/\s+/g, "") === normalized
      )
    );

    return (matched.length > 0 ? matched : all).slice(0, limit);
  }
}

export const newsProvider = new NewsProvider();
