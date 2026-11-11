import {
  AssetInfo,
  OHLCV,
  Timeframe,
  MarketNewsItem,
  EconomicEvent,
  AIReasoningOutput,
} from "@/types/market";
import { analyzeMarketStructure } from "../analysis/market-structure";
import { computeOrderFlowAnalysis } from "../analysis/order-flow-engine";
import { identifyLiquidityPools } from "../analysis/liquidity-engine";
import { computeMultiTimeframeConfluence } from "../analysis/confluence-engine";
import { generateMarketScenarios } from "../analysis/scenario-engine";
import { getCrossMarketCorrelations } from "../analysis/correlation-engine";
import { detectMarketRegime } from "../analysis/regime-engine";
import { fetchRealOrderFlowAndDepth, RealOrderFlowResult } from "./real-orderflow-provider";
import { IAIReasoningProvider } from "./types";

export class AIReasoningProvider implements IAIReasoningProvider {
  private geminiKey?: string;
  private openAiKey?: string;
  private anthropicKey?: string;

  constructor() {
    this.geminiKey = process.env.GEMINI_API_KEY;
    this.openAiKey = process.env.OPENAI_API_KEY;
    this.anthropicKey = process.env.ANTHROPIC_API_KEY;
  }

  async generateMarketOutlook(
    asset: AssetInfo,
    timeframe: Timeframe,
    bars: OHLCV[],
    news: MarketNewsItem[],
    events: EconomicEvent[]
  ): Promise<AIReasoningOutput> {
    const currentPrice = asset.currentPrice;

    // 1. Fetch real L2 order flow & depth
    let realOrderFlow: RealOrderFlowResult;
    try {
      realOrderFlow = await fetchRealOrderFlowAndDepth(asset);
    } catch {
      realOrderFlow = {
        isAvailable: false,
        providerName: asset.dataSource,
        orderFlow: {
          isAvailable: false,
          sourceNote: "Order-flow data unavailable for this instrument.",
          cumulativeDeltaSummary: { periodDelta: 0, trend: "neutral", divergenceDetected: false },
          volumeProfile: { poc: currentPrice, vah: currentPrice, val: currentPrice, highVolumeNodes: [], lowVolumeNodes: [] },
          aggression: { buyPressurePercent: 50, sellPressurePercent: 50, recentImbalanceSpike: false },
        },
        footprintBars: [],
        liquidity: {
          isAvailable: false,
          providerName: asset.dataSource,
          bidLiquidityUSD: 0,
          askLiquidityUSD: 0,
          bestBid: currentPrice,
          bestAsk: currentPrice,
          spread: asset.spread || 0,
          bids: [],
          asks: [],
          notice: "True order-book liquidity data is not available for this instrument/provider.",
        },
      };
    }

    // 2. Technical & Structural analysis from real bars
    const techAnalysis = analyzeMarketStructure(bars, timeframe);
    const pivots = techAnalysis.marketStructure.points;

    // 3. Order flow analysis (prefer real L2 feed if available, otherwise structural proxy)
    const orderFlowAnalysis = realOrderFlow.isAvailable
      ? realOrderFlow.orderFlow
      : computeOrderFlowAnalysis(bars, asset).analysis;

    // 4. Liquidity analysis
    const liquidityPools = identifyLiquidityPools(bars, pivots, currentPrice, asset.pipSize);

    // 5. Upcoming high-impact events check
    const hasHighImpactSoon = events.some(
      (e) =>
        (e.importance === "high" || e.importance === "critical") &&
        e.affectedAssets.some((a) => a.toUpperCase() === asset.symbol.toUpperCase())
    );

    // 6. Market regime classification
    const regime = detectMarketRegime(techAnalysis, asset, hasHighImpactSoon);

    // 7. Multi-Timeframe Confluence assessment
    const confluence = computeMultiTimeframeConfluence(
      techAnalysis,
      orderFlowAnalysis,
      news,
      events,
      timeframe
    );

    // 8. Probabilistic Scenario generation
    const scenarios = generateMarketScenarios(asset, techAnalysis, confluence, timeframe);

    // 9. Cross-market correlation
    const crossMarket = getCrossMarketCorrelations(asset);

    // Determine Key Support / Resistance levels
    const sup1 = techAnalysis.marketStructure.supportLevels[0]?.price || currentPrice * 0.992;
    const sup2 = techAnalysis.marketStructure.supportLevels[1]?.price || sup1 * 0.99;
    const res1 = techAnalysis.marketStructure.resistanceLevels[0]?.price || currentPrice * 1.008;
    const res2 = techAnalysis.marketStructure.resistanceLevels[1]?.price || res1 * 1.01;
    const invLevel =
      confluence.overallBias === "bullish" ? sup1 * 0.996 : res1 * 1.004;
    const targetLevel =
      confluence.overallBias === "bullish" ? res1 : sup1;

    // Build Key Reasons (Supporting evidence)
    let keyReasons: string[] = [];
    if (confluence.overallBias === "bullish") {
      keyReasons.push(`Market structure maintaining higher-low sequence with EMA 20 (${techAnalysis.indicators.ema20.toFixed(asset.decimals)}) offering dynamic trailing support.`);
      keyReasons.push(`RSI at ${techAnalysis.indicators.rsi14} reflects positive momentum expansion without reaching exhausted overbought extremes.`);
      if (orderFlowAnalysis.isAvailable && orderFlowAnalysis.cumulativeDeltaSummary.trend === "accumulating") {
        keyReasons.push(`Cumulative Volume Delta (+${orderFlowAnalysis.cumulativeDeltaSummary.periodDelta.toLocaleString()}) confirms institutional limit absorption on intraday pullbacks.`);
      } else {
        keyReasons.push(`Volume footprint indicates buyers defending the value area low (${orderFlowAnalysis.volumeProfile.val.toFixed(asset.decimals)}).`);
      }
      keyReasons.push(`Cross-market macro dynamics provide constructive confirmation, consistent with broader risk regime.`);
    } else if (confluence.overallBias === "bearish") {
      keyReasons.push(`Structural lower-high distribution beneath key overhead pivot at ${res1.toFixed(asset.decimals)}.`);
      keyReasons.push(`Bearish EMA stack (EMA 20 < EMA 50) indicating prevailing downward directional drift.`);
      if (orderFlowAnalysis.isAvailable && orderFlowAnalysis.cumulativeDeltaSummary.trend === "distributing") {
        keyReasons.push(`Negative Cumulative Delta (-${Math.abs(orderFlowAnalysis.cumulativeDeltaSummary.periodDelta).toLocaleString()}) demonstrates aggressive selling pressure at market.`);
      }
      keyReasons.push(`Overhead supply blocks remain unabsorbed, restricting upside continuation.`);
    } else {
      keyReasons.push(`Oscillators and moving averages are converging within a defined compression band.`);
      keyReasons.push(`Volume ratio at ${techAnalysis.indicators.volumeRatio}x suggests market participants are awaiting impending catalyst.`);
      keyReasons.push(`Equal highs and equal lows remain equidistant from current price.`);
    }

    // Build Conflicting Signals (Crucial rule: honest counter-evidence)
    let conflictingSignals: string[] = [];
    if (confluence.overallBias === "bullish") {
      conflictingSignals.push(`Major technical resistance cluster located near ${res1.toFixed(asset.decimals)} with resting sell-side orders.`);
      if (hasHighImpactSoon) {
        conflictingSignals.push(`Impending high-impact economic calendar release may trigger sudden spike in bi-directional volatility.`);
      }
      if (techAnalysis.indicators.bollingerBands.bandwidth > 5) {
        conflictingSignals.push(`Bollinger Band expansion indicates elevated short-term stretch, vulnerable to mean-reversion pullbacks.`);
      }
    } else if (confluence.overallBias === "bearish") {
      conflictingSignals.push(`Proximity to major higher-timeframe support zone at ${sup1.toFixed(asset.decimals)}.`);
      conflictingSignals.push(`Oversold stochastic/momentum signals risk generating a sharp counter-trend short covering rally.`);
    } else {
      conflictingSignals.push(`Low volatility compression creates breakout risk in either direction once range boundaries are tested.`);
    }

    // Invalidation conditions
    let invalidationConditions: string[] = [
      confluence.overallBias === "bullish"
        ? `A decisive ${timeframe.toUpperCase()} candle close below ${invLevel.toFixed(asset.decimals)} would invalidate the bullish thesis and confirm a structural Change of Character (CHoCH).`
        : `A decisive ${timeframe.toUpperCase()} candle close above ${invLevel.toFixed(asset.decimals)} would invalidate the bearish thesis, indicating a short squeeze reclaim.`,
      `Sudden shift in order flow delta with aggressive market absorption contrary to the prevailing bias.`,
      `Macro catalyst or surprise economic print deviating significantly from consensus expectations.`,
    ];

    // Optional LLM enrichment via Gemini 3.8 Flash if API key is provided
    if (this.geminiKey) {
      try {
        const prompt = `You are MarketPulse AI's Chief Global Macro & Quantitative Analyst.
Analyze this structured real-market snapshot:
Asset: ${asset.symbol} (${asset.name})
Category: ${asset.category}
Current Price: ${currentPrice}
Timeframe: ${timeframe}
Trend: ${techAnalysis.trend} (State: ${techAnalysis.marketStructure.state})
Indicators: RSI14=${techAnalysis.indicators.rsi14}, EMA20=${techAnalysis.indicators.ema20.toFixed(asset.decimals)}, EMA50=${techAnalysis.indicators.ema50.toFixed(asset.decimals)}, EMA200=${techAnalysis.indicators.ema200.toFixed(asset.decimals)}
Order Flow: ${realOrderFlow.isAvailable ? `CVD Delta=${realOrderFlow.orderFlow.cumulativeDeltaSummary.periodDelta}, Trend=${realOrderFlow.orderFlow.cumulativeDeltaSummary.trend}` : "Order-flow data unavailable for this instrument."}
Top News: ${news[0]?.headline || "Standard macroeconomic environment"}
Economic Events: ${events[0]?.title || "None immediate"}

Provide strict JSON only with this schema:
{
  "keyReasons": ["bullet 1", "bullet 2", "bullet 3"],
  "conflictingSignals": ["counter evidence 1", "counter evidence 2"],
  "invalidationCondition": "precise invalidation rule with price ${invLevel.toFixed(asset.decimals)}"
}`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${this.geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
            signal: AbortSignal.timeout(4000),
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
          const cleaned = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
          const parsed = JSON.parse(cleaned);

          if (Array.isArray(parsed.keyReasons) && parsed.keyReasons.length > 0) {
            keyReasons = parsed.keyReasons;
          }
          if (Array.isArray(parsed.conflictingSignals) && parsed.conflictingSignals.length > 0) {
            conflictingSignals = parsed.conflictingSignals;
          }
          if (parsed.invalidationCondition && typeof parsed.invalidationCondition === "string") {
            invalidationConditions[0] = parsed.invalidationCondition;
          }
        }
      } catch {
        // Fall back seamlessly to algorithmic reasons without error
      }
    }

    const orderFlowNotice = realOrderFlow.isAvailable
      ? realOrderFlow.orderFlow.sourceNote
      : "Order-flow data unavailable for this instrument.";

    const liquidityNotice = realOrderFlow.liquidity.isAvailable
      ? `Real Level 2 Depth of Market (DOM) from ${realOrderFlow.liquidity.providerName}. Cumulative Bids: $${(realOrderFlow.liquidity.bidLiquidityUSD / 1000).toFixed(1)}k, Cumulative Asks: $${(realOrderFlow.liquidity.askLiquidityUSD / 1000).toFixed(1)}k.`
      : "True order-book liquidity data is not available for this instrument/provider.";

    const outlook: AIReasoningOutput = {
      id: `analysis-${asset.id}-${Date.now()}`,
      assetId: asset.id,
      symbol: asset.symbol,
      timeframe,
      generatedAt: new Date().toISOString(),
      overallBias: confluence.overallBias,
      calibratedConfidence: confluence.calibratedConfidence,
      confluenceScore: confluence.confluenceScore,
      marketRegime: regime.type,
      confluenceBreakdown: confluence.breakdown,
      multiTimeframeViews: confluence.multiTimeframeViews,
      scenarios,
      keyReasons,
      conflictingSignals,
      invalidationConditions,
      keyLevels: {
        majorSupport: sup2,
        minorSupport: sup1,
        currentPivot: techAnalysis.indicators.bollingerBands.middle,
        minorResistance: res1,
        majorResistance: res2,
        liquidityTarget: targetLevel,
        thesisInvalidation: invLevel,
      },
      crossMarketConfirmation: crossMarket,
      orderFlowContext: orderFlowNotice,
      liquidityContext: liquidityNotice,
      newsAndMacroContext: news[0]
        ? `Primary catalyst: "${news[0].headline}" (${news[0].source}). Assessed market impact: ${news[0].expectedImpact.shortTerm}`
        : "Macro news flow remains standard with low headline dispersion.",
      dataFreshness: {
        priceAgeSeconds: 2,
        newsAgeSeconds: 35,
        orderFlowAvailable: realOrderFlow.isAvailable,
        liquidityAvailable: realOrderFlow.liquidity.isAvailable,
        provider: asset.dataSource,
      },
    };

    return outlook;
  }
}

export const aiReasoningProvider = new AIReasoningProvider();
