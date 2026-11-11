import { MarketRegimeType, TechnicalAnalysisSummary, AssetInfo } from "@/types/market";

export interface RegimeAnalysis {
  type: MarketRegimeType;
  title: string;
  description: string;
  volatilityEnv: "low" | "normal" | "elevated" | "extreme";
  strategyAdjustment: string;
}

export function detectMarketRegime(
  tech: TechnicalAnalysisSummary,
  asset: AssetInfo,
  hasUpcomingHighImpactNews: boolean
): RegimeAnalysis {
  const { indicators, signals, trend } = tech;
  const adx = indicators.adx14;
  const bandwidth = indicators.bollingerBands.bandwidth;
  const volRatio = indicators.volumeRatio;

  // News-driven regime check
  if (hasUpcomingHighImpactNews) {
    return {
      type: "news_driven",
      title: "News-Driven / High Event Risk",
      description:
        "High-impact macroeconomic data release is impending. Standard technical support/resistance levels are subject to slippage and violent spread widening.",
      volatilityEnv: "elevated",
      strategyAdjustment:
        "Reduce position size, widen invalidation buffers, and avoid placing aggressive breakout orders directly prior to official prints.",
    };
  }

  // Breakout expansion
  if (volRatio > 1.8 && (trend === "strong_bullish" || trend === "strong_bearish")) {
    return {
      type: "breakout_expansion",
      title: "Breakout & Volatility Expansion",
      description:
        "Volume is significantly above the 20-period moving average with sustained price expansion beyond structural bands.",
      volatilityEnv: "elevated",
      strategyAdjustment:
        "Favor momentum continuation and pullback retests of the broken pivot level rather than counter-trend mean reversion.",
    };
  }

  // Strong trending bullish
  if (adx > 25 && trend === "strong_bullish" || trend === "bullish") {
    return {
      type: "trending_bullish",
      title: "Structural Bullish Trend",
      description:
        "Consistent sequence of Higher Highs and Higher Lows with price holding above rising EMA 20/50 bands.",
      volatilityEnv: "normal",
      strategyAdjustment:
        "Focus on discount Fair Value Gaps (FVG) and order block retests for long confluence; ignore premature overbought oscillator signals.",
    };
  }

  // Strong trending bearish
  if (adx > 25 && (trend === "strong_bearish" || trend === "bearish")) {
    return {
      type: "trending_bearish",
      title: "Structural Bearish Trend",
      description:
        "Consistent sequence of Lower Highs and Lower Lows with downward sloping moving averages.",
      volatilityEnv: "normal",
      strategyAdjustment:
        "Target premium liquidity sweeps and supply zone mitigation for short continuation; do not attempt blind bottom-fishing.",
    };
  }

  // Tight range / compression
  if (bandwidth < 1.8 || adx < 18) {
    return {
      type: "ranging_tight",
      title: "Compression / Low-Volatility Consolidation",
      description:
        "Bollinger bandwidth has compressed significantly with low directional index. Market is building energy for an upcoming directional expansion.",
      volatilityEnv: "low",
      strategyAdjustment:
        "Do not trade false breakouts inside the range. Wait for clear structural break of the range boundary and subsequent candle close.",
    };
  }

  // Default wide range
  return {
    type: "ranging_wide",
    title: "Wide Range Rotation",
    description:
      "Price is rotating between defined support and resistance boundaries without clear multi-day directional momentum.",
    volatilityEnv: "normal",
    strategyAdjustment:
      "Focus on boundary rejections, fade range extremes, and take partial profits at the range midline (VWAP / EQ).",
  };
}

