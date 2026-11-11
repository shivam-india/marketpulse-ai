// ==========================================
// MarketPulse AI - Domain & System Types
// ==========================================

export type AssetClass = "forex" | "commodity" | "index" | "crypto";

export type Timeframe = "1m" | "5m" | "15m" | "30m" | "1h" | "4h" | "1d" | "1w";

export type BiasDirection = "bullish" | "bearish" | "neutral";

export type MarketRegimeType = 
  | "trending_bullish"
  | "trending_bearish"
  | "ranging_tight"
  | "ranging_wide"
  | "breakout_expansion"
  | "high_volatility"
  | "low_volatility"
  | "risk_on"
  | "risk_off"
  | "news_driven"
  | "liquidity_sweep";

export type TradingSession = "sydney" | "tokyo" | "london" | "new_york";

export type ImportanceLevel = "low" | "medium" | "high" | "critical";

export interface AssetInfo {
  id: string;
  symbol: string;
  name: string;
  category: AssetClass;
  baseCurrency?: string;
  quoteCurrency?: string;
  pipSize: number;
  decimals: number;
  currentPrice: number;
  change24h: number;
  change24hPercent: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  spread?: number;
  supportedOrderFlow: boolean;
  supportedLiquidityDepth: boolean;
  dataSource: string;
  lastUpdated: string;
}

export interface OHLCV {
  time: number; // Unix timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  trades?: number;
  buyVolume?: number;
  sellVolume?: number;
}

export interface MarketStructurePoint {
  index: number;
  time: number;
  type: "HH" | "HL" | "LH" | "LL";
  price: number;
  confirmed: boolean;
}

export interface BreakOfStructure {
  time: number;
  type: "BOS_BULL" | "BOS_BEAR" | "CHOCH_BULL" | "CHOCH_BEAR";
  brokenLevel: number;
  pivotIndex: number;
  description: string;
}

export interface FairValueGap {
  top: number;
  bottom: number;
  startTime: number;
  endTime?: number;
  type: "bullish" | "bearish";
  mitigated: boolean;
}

export interface SupportResistanceLevel {
  price: number;
  type: "support" | "resistance" | "pivot" | "liquidity_pool";
  strength: number; // 1-10
  touches: number;
  timeframe: Timeframe;
  lastTested: number;
}

export interface TechnicalIndicators {
  ema20: number;
  ema50: number;
  ema100: number;
  ema200: number;
  rsi14: number;
  macd: {
    macdLine: number;
    signalLine: number;
    histogram: number;
  };
  atr14: number;
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
    bandwidth: number;
  };
  vwap?: number;
  adx14: number;
  volume20SMA: number;
  volumeRatio: number; // current volume / 20SMA
}

export interface TechnicalAnalysisSummary {
  trend: "strong_bullish" | "bullish" | "ranging" | "bearish" | "strong_bearish";
  marketStructure: {
    state: "bullish_continuation" | "bearish_continuation" | "bullish_reversal_choch" | "bearish_reversal_choch" | "consolidation";
    points: MarketStructurePoint[];
    breaks: BreakOfStructure[];
    fvgList: FairValueGap[];
    supportLevels: SupportResistanceLevel[];
    resistanceLevels: SupportResistanceLevel[];
  };
  indicators: TechnicalIndicators;
  signals: {
    emaAlignment: BiasDirection;
    rsiStatus: "oversold" | "bullish_momentum" | "neutral" | "bearish_momentum" | "overbought";
    macdStatus: "bullish_cross" | "bullish_continuation" | "bearish_cross" | "bearish_continuation" | "neutral";
    volatilityStatus: "contracting" | "normal" | "expanding" | "extreme";
  };
}

export interface LiquidityPool {
  id: string;
  priceLevel: number;
  type: "equal_highs" | "equal_lows" | "session_high" | "session_low" | "swing_high_pool" | "swing_low_pool" | "stop_cluster_proxy";
  estimatedVolumeUSD: number;
  strengthScore: number; // 0-100
  swept: boolean;
  distancePips: number;
  distancePercent: number;
}

export interface OrderFlowFootprintBar {
  time: number;
  priceLevels: {
    price: number;
    bidVolume: number;
    askVolume: number;
    totalVolume: number;
    delta: number;
    imbalanceBuy: boolean;
    imbalanceSell: boolean;
  }[];
  totalBid: number;
  totalAsk: number;
  barDelta: number;
  cumulativeDelta: number;
  pocPrice: number; // Point of Control
  valueAreaHigh: number;
  valueAreaLow: number;
}

export interface OrderFlowAnalysis {
  isAvailable: boolean;
  sourceNote: string;
  cumulativeDeltaSummary: {
    periodDelta: number;
    trend: "accumulating" | "distributing" | "neutral";
    divergenceDetected: boolean;
    divergenceType?: "bullish_absorption" | "bearish_absorption" | "none";
  };
  volumeProfile: {
    poc: number;
    vah: number;
    val: number;
    highVolumeNodes: number[];
    lowVolumeNodes: number[];
  };
  aggression: {
    buyPressurePercent: number;
    sellPressurePercent: number;
    recentImbalanceSpike: boolean;
  };
  fundingRate?: number;
  openInterestChange?: number;
}

export interface EconomicEvent {
  id: string;
  title: string;
  country: string;
  currency: string;
  importance: ImportanceLevel;
  date: string; // ISO date
  time: string; // HH:mm
  timestamp: number;
  previous?: string | number;
  forecast?: string | number;
  actual?: string | number;
  revised?: string | number;
  expectedVolatility: "low" | "medium" | "high" | "extreme";
  affectedAssets: string[];
  macroSignificance: string;
}

export interface MarketNewsItem {
  id: string;
  headline: string;
  summary: string;
  source: string;
  url?: string;
  publishedAt: string;
  timestamp: number;
  sentiment: {
    bias: BiasDirection;
    score: number; // -1.0 to +1.0
    confidence: number; // 0 to 100%
  };
  affectedCurrencies: string[];
  affectedAssets: string[];
  expectedImpact: {
    shortTerm: string;
    mediumTerm: string;
    context: string;
  };
}

export interface CrossMarketCorrelation {
  pair: string; // e.g. "DXY ↔ Gold", "US10Y ↔ USD/JPY"
  correlationCoefficient: number; // -1.0 to 1.0
  relationship: "direct" | "inverse";
  currentBehavior: "confirming" | "diverging" | "lagging";
  explanation: string;
}

export interface SessionInfo {
  session: TradingSession;
  isOpen: boolean;
  opensAtUTC: string;
  closesAtUTC: string;
  high: number;
  low: number;
  rangePips: number;
  volatilityRelative: "low" | "average" | "elevated";
}

export interface ConfluenceBreakdown {
  marketStructure: number;
  momentum: number;
  macro: number;
  news: number;
  liquidity: number;
  orderFlow: number;
}

export interface ConfluenceAssessment {
  overallBias: BiasDirection;
  calibratedConfidence: number;
  confluenceScore: number;
  breakdown: ConfluenceBreakdown;
  multiTimeframeViews: MultiTimeframePerspective[];
}

export interface MultiTimeframePerspective {
  timeframe: Timeframe;
  bias: BiasDirection;
  confidence: number;
  structure: string;
  momentum: string;
  keyLevel: string;
}

export interface ScenarioDefinition {
  id: "base" | "alternative" | "high_volatility";
  title: string;
  probability: number; // e.g. 62%
  direction: BiasDirection;
  targetArea: string;
  timeHorizon: string;
  supportingEvidence: string[];
  invalidationTrigger: string;
  catalystRisk: string;
}

export interface AIReasoningOutput {
  id: string;
  assetId: string;
  symbol: string;
  timeframe: Timeframe;
  generatedAt: string;
  overallBias: BiasDirection;
  calibratedConfidence: number; // 0-100%
  confluenceScore: number; // 0-100
  marketRegime: MarketRegimeType;
  
  confluenceBreakdown: {
    marketStructure: number;
    momentum: number;
    macro: number;
    news: number;
    liquidity: number;
    orderFlow: number;
  };

  multiTimeframeViews: MultiTimeframePerspective[];

  scenarios: {
    baseCase: ScenarioDefinition;
    alternative: ScenarioDefinition;
    highVolatility: ScenarioDefinition;
  };

  keyReasons: string[];
  conflictingSignals: string[];
  invalidationConditions: string[];

  keyLevels: {
    majorSupport: number;
    minorSupport: number;
    currentPivot: number;
    minorResistance: number;
    majorResistance: number;
    liquidityTarget: number;
    thesisInvalidation: number;
  };

  crossMarketConfirmation: CrossMarketCorrelation[];
  orderFlowContext: string;
  liquidityContext: string;
  newsAndMacroContext: string;
  
  dataFreshness: {
    priceAgeSeconds: number;
    newsAgeSeconds: number;
    orderFlowAvailable: boolean;
    liquidityAvailable: boolean;
    provider: string;
  };
}

export interface ChartVisionDetection {
  trendDetected: "bullish" | "bearish" | "ranging";
  supportZones: { priceApprox: number; description: string }[];
  resistanceZones: { priceApprox: number; description: string }[];
  swingPivots: { type: "swing_high" | "swing_low"; description: string }[];
  structureBreak: string | null;
  patternsIdentified: string[];
  candlestickObservations: string[];
  visibleVolumeAssessment: string;
  liquidityImbalances: string[];
  confidenceScore: number;
  honestLimitationsNotice: string;
}

export interface HistoricalPredictionRecord {
  id: string;
  timestamp: string;
  assetSymbol: string;
  timeframe: Timeframe;
  predictedBias: BiasDirection;
  predictedConfidence: number;
  entryPrice: number;
  evaluationPriceAfterHorizon?: number;
  actualOutcome?: "success" | "invalidated" | "neutral";
  pnlPipsOrPercent?: number;
  evaluatedAt?: string;
  reasoningSnippet: string;
}

export interface BacktestResult {
  strategyName: string;
  assetSymbol: string;
  timeframe: Timeframe;
  totalTrades: number;
  winCount: number;
  lossCount: number;
  neutralCount: number;
  winRatePercent: number;
  profitFactor: number;
  maxDrawdownPercent: number;
  sharpeRatio: number;
  expectancyPips: number;
  falseSignalRatePercent: number;
  testedBarsCount: number;
  periodStart: string;
  periodEnd: string;
  tradesList: {
    id: string;
    entryTime: string;
    exitTime: string;
    direction: "long" | "short";
    entryPrice: number;
    exitPrice: number;
    pips: number;
    returnPercent: number;
    outcome: "win" | "loss";
    confluenceScore: number;
  }[];
}

export interface UserAlert {
  id: string;
  assetSymbol: string;
  type: "price_cross" | "confidence_threshold" | "economic_event" | "liquidity_sweep" | "bos_detected";
  targetValue: number | string;
  timeframe?: Timeframe;
  isActive: boolean;
  createdAt: string;
  lastTriggered?: string;
  notifyBrowser: boolean;
  message: string;
}
