import { MarketNewsItem, BiasDirection } from "@/types/market";
import { INewsProvider } from "./types";

export class NewsProvider implements INewsProvider {
  private finnhubKey?: string;
  private newsApiKey?: string;
  private cachedNews: MarketNewsItem[] = [];
  private lastFetchedAt = 0;
  private readonly CACHE_TTL_MS = 60 * 1000; // 1 minute in-memory cache

  constructor() {
    this.finnhubKey = process.env.FINNHUB_API_KEY;
    this.newsApiKey = process.env.NEWS_API_KEY;
  }

  async getTopMarketNews(limit = 10): Promise<MarketNewsItem[]> {
    const now = Date.now();
    if (this.cachedNews.length > 0 && now - this.lastFetchedAt < this.CACHE_TTL_MS) {
      return this.cachedNews.slice(0, limit);
    }

    const collected: MarketNewsItem[] = [];

    // 1. Fetch Real Live Finnhub Market News (if key is present)
    if (this.finnhubKey) {
      try {
        const res = await fetch(
          `https://finnhub.io/api/v1/news?category=general&minId=0&token=${this.finnhubKey}`,
          { next: { revalidate: 60 }, signal: AbortSignal.timeout(3000) }
        );
        if (res.ok) {
          const raw = await res.json();
          if (Array.isArray(raw)) {
            for (const item of raw.slice(0, 20)) {
              if (!item.headline || collected.some((c) => c.headline === item.headline)) continue;

              const text = `${item.headline} ${item.summary || ""}`.toLowerCase();
              let bias: BiasDirection = "neutral";
              let score = 0;

              if (text.includes("surge") || text.includes("rally") || text.includes("high") || text.includes("gain") || text.includes("bull")) {
                bias = "bullish";
                score = 0.65;
              } else if (text.includes("fall") || text.includes("drop") || text.includes("slump") || text.includes("plunge") || text.includes("loss") || text.includes("bear") || text.includes("inflation")) {
                bias = "bearish";
                score = -0.65;
              }

              const relatedAssets: string[] = [];
              if (text.includes("gold") || text.includes("metal")) relatedAssets.push("XAU/USD");
              if (text.includes("oil") || text.includes("crude") || text.includes("opec")) relatedAssets.push("WTI Crude");
              if (text.includes("dollar") || text.includes("fed") || text.includes("rate")) relatedAssets.push("EUR/USD");
              if (text.includes("bitcoin") || text.includes("crypto") || text.includes("btc")) relatedAssets.push("BTC/USD");
              if (text.includes("stock") || text.includes("nasdaq") || text.includes("s&p")) relatedAssets.push("S&P 500");

              collected.push({
                id: `finnhub-${item.id || Date.now()}-${Math.random().toString(36).substring(7)}`,
                headline: item.headline,
                summary: item.summary || item.headline,
                source: item.source || "Finnhub Financial Wire",
                url: item.url,
                publishedAt: item.datetime ? new Date(item.datetime * 1000).toISOString() : new Date().toISOString(),
                timestamp: item.datetime || Math.floor(Date.now() / 1000),
                sentiment: {
                  bias,
                  score,
                  confidence: 85,
                },
                affectedCurrencies: text.includes("euro") ? ["EUR", "USD"] : text.includes("yen") ? ["JPY", "USD"] : ["USD"],
                affectedAssets: relatedAssets.length > 0 ? relatedAssets : ["S&P 500", "EUR/USD"],
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

    // 2. Fetch Real Live NewsAPI Business News (if key is present)
    if (this.newsApiKey && collected.length < limit) {
      try {
        const res = await fetch(
          `https://newsapi.org/v2/top-headlines?category=business&language=en&apiKey=${this.newsApiKey}`,
          {
            headers: { "User-Agent": "MarketPulseAI/1.0" },
            next: { revalidate: 180 },
            signal: AbortSignal.timeout(3000),
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

    // 3. Fallback to public live financial news wire (CNBC Markets RSS - no API key required)
    if (collected.length < limit) {
      try {
        const res = await fetch("https://www.cnbc.com/id/10000664/device/rss/rss.html", {
          headers: { "User-Agent": "MarketPulseAI/1.0" },
          next: { revalidate: 120 },
          signal: AbortSignal.timeout(4000),
        });
        if (res.ok) {
          const xml = await res.text();
          const items = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
          for (const rawItem of items.slice(0, 20)) {
            const titleMatch = rawItem.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || rawItem.match(/<title>(.*?)<\/title>/);
            const linkMatch = rawItem.match(/<link>(.*?)<\/link>/);
            const descMatch = rawItem.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/) || rawItem.match(/<description>(.*?)<\/description>/);
            const pubMatch = rawItem.match(/<pubDate>(.*?)<\/pubDate>/);

            const title = titleMatch?.[1]?.replace(/&apos;/g, "'")?.replace(/&amp;/g, "&")?.trim();
            if (!title || collected.some((c) => c.headline === title)) continue;

            const summary = descMatch?.[1]?.replace(/<[^>]+>/g, "")?.trim() || title;
            const text = `${title} ${summary}`.toLowerCase();
            let bias: BiasDirection = "neutral";
            let score = 0;

            if (text.includes("surge") || text.includes("jump") || text.includes("gain") || text.includes("rally") || text.includes("record")) {
              bias = "bullish";
              score = 0.6;
            } else if (text.includes("slump") || text.includes("drop") || text.includes("fall") || text.includes("plunge") || text.includes("fear") || text.includes("inflation")) {
              bias = "bearish";
              score = -0.6;
            }

            collected.push({
              id: `cnbc-${Date.now()}-${Math.random().toString(36).substring(7)}`,
              headline: title,
              summary,
              source: "CNBC Live Markets Wire",
              url: linkMatch?.[1] || "https://www.cnbc.com/markets/",
              publishedAt: pubMatch?.[1] ? new Date(pubMatch[1]).toISOString() : new Date().toISOString(),
              timestamp: pubMatch?.[1] ? Math.floor(new Date(pubMatch[1]).getTime() / 1000) : Math.floor(Date.now() / 1000),
              sentiment: { bias, score, confidence: 85 },
              affectedCurrencies: text.includes("dollar") ? ["USD"] : text.includes("euro") ? ["EUR", "USD"] : ["USD"],
              affectedAssets: ["S&P 500", "NASDAQ 100", "US30", "XAU/USD"],
              expectedImpact: {
                shortTerm: bias === "bullish" ? "Constructive risk momentum for equities." : bias === "bearish" ? "Risk-off sentiment pressure." : "Consolidation pending fresh catalyst.",
                mediumTerm: "Subject to broader macro interest rate environment.",
                context: "Live public market wire verified from CNBC Markets RSS feed.",
              },
            });
          }
        }
      } catch (err) {
        console.warn("CNBC RSS live news fetch error:", err);
      }
    }

    if (collected.length > 0) {
      this.cachedNews = collected;
      this.lastFetchedAt = now;
      return collected.slice(0, limit);
    }

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
