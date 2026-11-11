import {
  AssetInfo,
  OHLCV,
  Timeframe,
  MarketNewsItem,
  EconomicEvent,
  AIReasoningOutput,
  ChartVisionDetection,
} from "@/types/market";

export interface IMarketDataProvider {
  getAssetQuotes(): Promise<AssetInfo[]>;
  getAssetQuote(symbol: string): Promise<AssetInfo | null>;
  getHistoricalCandles(symbol: string, timeframe: Timeframe, count?: number): Promise<OHLCV[]>;
}

export interface INewsProvider {
  getTopMarketNews(limit?: number): Promise<MarketNewsItem[]>;
  getNewsForAsset(symbol: string, limit?: number): Promise<MarketNewsItem[]>;
}

export interface IEconomicCalendarProvider {
  getUpcomingEvents(daysAhead?: number): Promise<EconomicEvent[]>;
  getEventsForCurrency(currency: string): Promise<EconomicEvent[]>;
}

export interface IAIReasoningProvider {
  generateMarketOutlook(
    asset: AssetInfo,
    timeframe: Timeframe,
    bars: OHLCV[],
    news: MarketNewsItem[],
    events: EconomicEvent[]
  ): Promise<AIReasoningOutput>;
}

export interface IChartVisionProvider {
  analyzeChartImage(base64Image: string, assetSymbol?: string): Promise<ChartVisionDetection>;
}

export interface ProviderStatus {
  name: string;
  category: "Market Data" | "News" | "Calendar" | "AI Reasoning" | "Order Flow";
  status: "connected" | "configured" | "fallback_active" | "error";
  latencyMs: number;
  apiKeySet: boolean;
  notes: string;
}

