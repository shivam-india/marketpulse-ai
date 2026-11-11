import { EconomicEvent, ImportanceLevel } from "@/types/market";
import { IEconomicCalendarProvider } from "./types";

export class EconomicCalendarProvider implements IEconomicCalendarProvider {
  private lastFetchedAt: number = 0;
  private cachedEvents: EconomicEvent[] = [];

  async getUpcomingEvents(daysAhead = 7): Promise<EconomicEvent[]> {
    // Cache for 5 minutes to avoid spamming the endpoint
    const now = Date.now();
    if (this.cachedEvents.length > 0 && now - this.lastFetchedAt < 300000) {
      return this.cachedEvents;
    }

    try {
      // Official Fair Economy / Forex Factory real live calendar feed
      const res = await fetch("https://nfs.faireconomy.media/ff_calendar_thisweek.json", {
        headers: { "User-Agent": "MarketPulseAI/1.0" },
        next: { revalidate: 300 },
      });

      if (res.ok) {
        const rawEvents: any[] = await res.json();
        if (Array.isArray(rawEvents) && rawEvents.length > 0) {
          const parsed: EconomicEvent[] = rawEvents.map((item, idx) => {
            const rawImpact = (item.impact || "Low").toLowerCase();
            let importance: ImportanceLevel = "low";
            let expectedVolatility: "low" | "medium" | "high" | "extreme" = "low";

            if (rawImpact === "high") {
              importance = "critical";
              expectedVolatility = "extreme";
            } else if (rawImpact === "medium") {
              importance = "high";
              expectedVolatility = "high";
            } else if (rawImpact === "holiday") {
              importance = "medium";
              expectedVolatility = "low";
            } else {
              importance = "medium";
              expectedVolatility = "medium";
            }

            const eventTime = item.date ? new Date(item.date) : new Date();
            const currency = item.country || "USD";

            return {
              id: `ff-event-${idx}`,
              title: item.title || "Economic Release",
              country: currency,
              currency: currency,
              importance,
              date: item.date ? item.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
              time: item.date ? item.date.slice(11, 16) + " UTC" : "Scheduled",
              timestamp: Math.floor(eventTime.getTime() / 1000),
              previous: item.previous || "-",
              forecast: item.forecast || "-",
              actual: item.actual || undefined,
              expectedVolatility,
              affectedAssets: this.getAffectedAssets(currency),
              macroSignificance: `Official ${currency} sovereign economic calendar print: ${item.title}.`,
            };
          });

          this.cachedEvents = parsed;
          this.lastFetchedAt = now;
          return parsed;
        }
      }
    } catch (err) {
      console.warn("Failed to fetch live economic calendar feed:", err);
    }

    // Do NOT return fake events if provider fails
    return [];
  }

  async getEventsForCurrency(currency: string): Promise<EconomicEvent[]> {
    const all = await this.getUpcomingEvents();
    return all.filter((e) => e.currency.toUpperCase() === currency.toUpperCase());
  }

  private getAffectedAssets(currency: string): string[] {
    const curr = currency.toUpperCase();
    if (curr === "USD") return ["EUR/USD", "GBP/USD", "USD/JPY", "XAU/USD", "S&P 500", "NASDAQ 100", "US30", "BTC/USD"];
    if (curr === "EUR") return ["EUR/USD", "EUR/GBP", "EUR/JPY", "DAX"];
    if (curr === "GBP") return ["GBP/USD", "EUR/GBP", "GBP/JPY", "FTSE 100"];
    if (curr === "JPY") return ["USD/JPY", "EUR/JPY", "GBP/JPY", "Nikkei 225"];
    if (curr === "CAD") return ["USD/CAD", "WTI Crude"];
    if (curr === "AUD") return ["AUD/USD", "XAU/USD"];
    return [curr + "/USD"];
  }
}

export const economicCalendarProvider = new EconomicCalendarProvider();
