import {
  OHLCV,
  MarketStructurePoint,
  BreakOfStructure,
  FairValueGap,
  SupportResistanceLevel,
  TechnicalAnalysisSummary,
  Timeframe,
  BiasDirection,
} from "@/types/market";
import { computeTechnicalIndicators } from "./technical-indicators";

/**
 * Identifies Swing Highs and Swing Lows using fractal pivot window (left/right bars)
 */
export function identifySwingPivots(
  bars: OHLCV[],
  leftBars = 3,
  rightBars = 3
): MarketStructurePoint[] {
  const points: MarketStructurePoint[] = [];

  for (let i = leftBars; i < bars.length - rightBars; i++) {
    const currentHigh = bars[i].high;
    const currentLow = bars[i].low;

    let isSwingHigh = true;
    let isSwingLow = true;

    for (let j = i - leftBars; j <= i + rightBars; j++) {
      if (j === i) continue;
      if (bars[j].high >= currentHigh) isSwingHigh = false;
      if (bars[j].low <= currentLow) isSwingLow = false;
    }

    if (isSwingHigh) {
      const prevHigh = points.slice().reverse().find((p) => p.type === "HH" || p.type === "LH");
      const type = !prevHigh || currentHigh >= prevHigh.price ? "HH" : "LH";
      points.push({
        index: i,
        time: bars[i].time,
        type,
        price: currentHigh,
        confirmed: true,
      });
    } else if (isSwingLow) {
      const prevLow = points.slice().reverse().find((p) => p.type === "HL" || p.type === "LL");
      const type = !prevLow || currentLow <= prevLow.price ? "LL" : "HL";
      points.push({
        index: i,
        time: bars[i].time,
        type,
        price: currentLow,
        confirmed: true,
      });
    }
  }

  return points;
}

/**
 * Identifies Break of Structure (BOS) and Change of Character (CHoCH)
 */
export function identifyBOSandCHoCH(
  bars: OHLCV[],
  pivots: MarketStructurePoint[]
): BreakOfStructure[] {
  const breaks: BreakOfStructure[] = [];
  let currentTrend: "bullish" | "bearish" | "ranging" = "ranging";

  for (let i = 0; i < bars.length; i++) {
    const bar = bars[i];

    // Find preceding confirmed swing high that hasn't been breached
    const precedingHighs = pivots.filter(
      (p) => p.index < i && (p.type === "HH" || p.type === "LH")
    );
    const precedingLows = pivots.filter(
      (p) => p.index < i && (p.type === "HL" || p.type === "LL")
    );

    const latestHigh = precedingHighs[precedingHighs.length - 1];
    const latestLow = precedingLows[precedingLows.length - 1];

    if (latestHigh && bar.close > latestHigh.price && !breaks.some(b => b.brokenLevel === latestHigh.price)) {
      const isChoch = currentTrend === "bearish";
      currentTrend = "bullish";
      breaks.push({
        time: bar.time,
        type: isChoch ? "CHOCH_BULL" : "BOS_BULL",
        brokenLevel: latestHigh.price,
        pivotIndex: latestHigh.index,
        description: isChoch
          ? `Bullish Change of Character: Price reclaimed prior lower high at ${latestHigh.price.toFixed(2)}`
          : `Bullish Break of Structure: Bullish continuation breaking ${latestHigh.price.toFixed(2)}`,
      });
    } else if (latestLow && bar.close < latestLow.price && !breaks.some(b => b.brokenLevel === latestLow.price)) {
      const isChoch = currentTrend === "bullish";
      currentTrend = "bearish";
      breaks.push({
        time: bar.time,
        type: isChoch ? "CHOCH_BEAR" : "BOS_BEAR",
        brokenLevel: latestLow.price,
        pivotIndex: latestLow.index,
        description: isChoch
          ? `Bearish Change of Character: Price lost structural higher low at ${latestLow.price.toFixed(2)}`
          : `Bearish Break of Structure: Bearish continuation breaking ${latestLow.price.toFixed(2)}`,
      });
    }
  }

  return breaks;
}

/**
 * Detects Fair Value Gaps (FVG) / 3-bar Imbalances
 */
export function detectFairValueGaps(bars: OHLCV[]): FairValueGap[] {
  const fvgs: FairValueGap[] = [];

  for (let i = 2; i < bars.length; i++) {
    const bar0 = bars[i - 2];
    const bar2 = bars[i];

    // Bullish FVG: Bar 2's Low is strictly above Bar 0's High
    if (bar2.low > bar0.high) {
      const gapTop = bar2.low;
      const gapBottom = bar0.high;
      
      // Check if subsequent bars mitigated it
      let mitigated = false;
      for (let j = i + 1; j < bars.length; j++) {
        if (bars[j].low <= gapBottom) {
          mitigated = true;
          break;
        }
      }

      fvgs.push({
        top: Number(gapTop.toFixed(4)),
        bottom: Number(gapBottom.toFixed(4)),
        startTime: bars[i - 1].time,
        type: "bullish",
        mitigated,
      });
    }

    // Bearish FVG: Bar 2's High is strictly below Bar 0's Low
    if (bar2.high < bar0.low) {
      const gapTop = bar0.low;
      const gapBottom = bar2.high;

      let mitigated = false;
      for (let j = i + 1; j < bars.length; j++) {
        if (bars[j].high >= gapTop) {
          mitigated = true;
          break;
        }
      }

      fvgs.push({
        top: Number(gapTop.toFixed(4)),
        bottom: Number(gapBottom.toFixed(4)),
        startTime: bars[i - 1].time,
        type: "bearish",
        mitigated,
      });
    }
  }

  return fvgs.slice(-10); // Return most recent 10 FVGs
}

/**
 * Groups swing levels into dynamic Support & Resistance clusters
 */
export function calculateSupportResistanceClusters(
  bars: OHLCV[],
  pivots: MarketStructurePoint[],
  timeframe: Timeframe,
  tolerancePercent = 0.003
): { support: SupportResistanceLevel[]; resistance: SupportResistanceLevel[] } {
  const currentPrice = bars[bars.length - 1].close;
  const highPivots = pivots.filter((p) => p.type === "HH" || p.type === "LH");
  const lowPivots = pivots.filter((p) => p.type === "HL" || p.type === "LL");

  const clusterLevels = (
    candidates: MarketStructurePoint[],
    type: "support" | "resistance"
  ): SupportResistanceLevel[] => {
    const clusters: { prices: number[]; count: number; lastTime: number }[] = [];

    for (const cand of candidates) {
      const existing = clusters.find(
        (c) => Math.abs(c.prices[0] - cand.price) / c.prices[0] < tolerancePercent
      );
      if (existing) {
        existing.prices.push(cand.price);
        existing.count += 1;
        existing.lastTime = Math.max(existing.lastTime, cand.time);
      } else {
        clusters.push({
          prices: [cand.price],
          count: 1,
          lastTime: cand.time,
        });
      }
    }

    return clusters.map((c) => {
      const avgPrice = c.prices.reduce((a, b) => a + b, 0) / c.prices.length;
      return {
        price: Number(avgPrice.toFixed(4)),
        type,
        strength: Math.min(10, c.count * 2 + 2),
        touches: c.count,
        timeframe,
        lastTested: c.lastTime,
      };
    });
  };

  const resistance = clusterLevels(highPivots, "resistance")
    .filter((l) => l.price > currentPrice)
    .sort((a, b) => a.price - b.price)
    .slice(0, 4);

  const support = clusterLevels(lowPivots, "support")
    .filter((l) => l.price < currentPrice)
    .sort((a, b) => b.price - a.price)
    .slice(0, 4);

  return { support, resistance };
}

/**
 * Evaluates the full technical market structure and indicator confluence
 */
export function analyzeMarketStructure(
  bars: OHLCV[],
  timeframe: Timeframe = "15m"
): TechnicalAnalysisSummary {
  const currentPrice = bars[bars.length - 1].close;
  const indicators = computeTechnicalIndicators(bars);
  const pivots = identifySwingPivots(bars);
  const breaks = identifyBOSandCHoCH(bars, pivots);
  const fvgList = detectFairValueGaps(bars);
  const { support, resistance } = calculateSupportResistanceClusters(bars, pivots, timeframe);

  // Determine structural state
  const lastBreaks = breaks.slice(-3);
  const lastBreak = lastBreaks[lastBreaks.length - 1];

  let state: TechnicalAnalysisSummary["marketStructure"]["state"] = "consolidation";
  if (lastBreak?.type === "CHOCH_BULL") state = "bullish_reversal_choch";
  else if (lastBreak?.type === "CHOCH_BEAR") state = "bearish_reversal_choch";
  else if (lastBreak?.type === "BOS_BULL") state = "bullish_continuation";
  else if (lastBreak?.type === "BOS_BEAR") state = "bearish_continuation";
  else {
    const recentPivots = pivots.slice(-4);
    const highs = recentPivots.filter((p) => p.type === "HH" || p.type === "LH");
    const lows = recentPivots.filter((p) => p.type === "HL" || p.type === "LL");
    if (highs.length && highs[highs.length - 1].type === "HH") state = "bullish_continuation";
    else if (lows.length && lows[lows.length - 1].type === "LL") state = "bearish_continuation";
  }

  // EMA Alignment
  let emaAlignment: BiasDirection = "neutral";
  if (currentPrice > indicators.ema20 && indicators.ema20 > indicators.ema50 && indicators.ema50 > indicators.ema200) {
    emaAlignment = "bullish";
  } else if (currentPrice < indicators.ema20 && indicators.ema20 < indicators.ema50 && indicators.ema50 < indicators.ema200) {
    emaAlignment = "bearish";
  }

  // RSI status
  let rsiStatus: TechnicalAnalysisSummary["signals"]["rsiStatus"] = "neutral";
  if (indicators.rsi14 >= 70) rsiStatus = "overbought";
  else if (indicators.rsi14 > 55) rsiStatus = "bullish_momentum";
  else if (indicators.rsi14 <= 30) rsiStatus = "oversold";
  else if (indicators.rsi14 < 45) rsiStatus = "bearish_momentum";

  // MACD status
  let macdStatus: TechnicalAnalysisSummary["signals"]["macdStatus"] = "neutral";
  if (indicators.macd.histogram > 0) {
    macdStatus = indicators.macd.macdLine > indicators.macd.signalLine ? "bullish_continuation" : "bullish_cross";
  } else if (indicators.macd.histogram < 0) {
    macdStatus = indicators.macd.macdLine < indicators.macd.signalLine ? "bearish_continuation" : "bearish_cross";
  }

  // Volatility
  let volatilityStatus: TechnicalAnalysisSummary["signals"]["volatilityStatus"] = "normal";
  if (indicators.bollingerBands.bandwidth < 1.5) volatilityStatus = "contracting";
  else if (indicators.bollingerBands.bandwidth > 6.0) volatilityStatus = "extreme";
  else if (indicators.volumeRatio > 1.8) volatilityStatus = "expanding";

  // Overall Trend classification
  let trend: TechnicalAnalysisSummary["trend"] = "ranging";
  if (emaAlignment === "bullish" && state === "bullish_continuation") trend = "strong_bullish";
  else if (emaAlignment === "bullish" || state === "bullish_continuation" || state === "bullish_reversal_choch") trend = "bullish";
  else if (emaAlignment === "bearish" && state === "bearish_continuation") trend = "strong_bearish";
  else if (emaAlignment === "bearish" || state === "bearish_continuation" || state === "bearish_reversal_choch") trend = "bearish";

  return {
    trend,
    marketStructure: {
      state,
      points: pivots,
      breaks,
      fvgList,
      supportLevels: support,
      resistanceLevels: resistance,
    },
    indicators,
    signals: {
      emaAlignment,
      rsiStatus,
      macdStatus,
      volatilityStatus,
    },
  };
}

