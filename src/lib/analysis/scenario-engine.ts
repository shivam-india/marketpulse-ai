import {
  AssetInfo,
  TechnicalAnalysisSummary,
  ConfluenceAssessment,
  ScenarioDefinition,
  Timeframe,
} from "@/types/market";

export function generateMarketScenarios(
  asset: AssetInfo,
  tech: TechnicalAnalysisSummary,
  confluence: ConfluenceAssessment,
  timeframe: Timeframe
): {
  baseCase: ScenarioDefinition;
  alternative: ScenarioDefinition;
  highVolatility: ScenarioDefinition;
} {
  const currentPrice = asset.currentPrice;
  const isBullish = confluence.overallBias === "bullish";
  const sup = tech.marketStructure.supportLevels[0]?.price || currentPrice * 0.99;
  const res = tech.marketStructure.resistanceLevels[0]?.price || currentPrice * 1.01;
  const invLevel = isBullish ? sup * 0.997 : res * 1.003;

  // Base Case
  const baseProb = confluence.calibratedConfidence;
  const altProb = Math.round((100 - baseProb) * 0.7);
  const volProb = 100 - baseProb - altProb;

  const baseCase: ScenarioDefinition = {
    id: "base",
    title: isBullish
      ? `Base Case: Bullish Continuation Toward Overhead Liquidity`
      : `Base Case: Bearish Distribution Toward Sell-Side Liquidity`,
    probability: baseProb,
    direction: confluence.overallBias,
    targetArea: isBullish
      ? `${res.toFixed(asset.decimals)} - ${(res * 1.005).toFixed(asset.decimals)}`
      : `${sup.toFixed(asset.decimals)} - ${(sup * 0.995).toFixed(asset.decimals)}`,
    timeHorizon: `Next 4 - 12 hours (${timeframe} continuation)`,
    supportingEvidence: isBullish
      ? [
          `Higher low structure maintained above ${sup.toFixed(asset.decimals)} key support`,
          `EMA 20/50 alignment demonstrating positive momentum continuation`,
          `Cumulative volume delta shows active limit absorption on pullbacks`,
          `Supportive macro backdrop with cross-market confirmation`,
        ]
      : [
          `Lower high distribution below ${res.toFixed(asset.decimals)} resistance`,
          `EMA alignment sloping downward with negative momentum`,
          `Sellers absorbing buyer rallies at premium order blocks`,
          `Macro headwinds and dollar strength capping upside`,
        ],
    invalidationTrigger: isBullish
      ? `A sustained 15M candle close below ${invLevel.toFixed(asset.decimals)} with volume expansion`
      : `A sustained 15M candle close above ${invLevel.toFixed(asset.decimals)} with volume expansion`,
    catalystRisk: `Upcoming central bank speeches or tier-1 macroeconomic prints.`,
  };

  // Alternative Case (Essential rule: never leave out the opposing thesis)
  const alternative: ScenarioDefinition = {
    id: "alternative",
    title: isBullish
      ? `Alternative: Support Failure & Structural CHoCH Reversal`
      : `Alternative: Short Squeeze & Bullish Reclaim Breakout`,
    probability: altProb,
    direction: isBullish ? "bearish" : "bullish",
    targetArea: isBullish
      ? `${(sup * 0.988).toFixed(asset.decimals)} - ${(sup * 0.98).toFixed(asset.decimals)}`
      : `${(res * 1.012).toFixed(asset.decimals)} - ${(res * 1.02).toFixed(asset.decimals)}`,
    timeHorizon: `Triggered upon structural invalidation`,
    supportingEvidence: isBullish
      ? [
          `Bearish divergence emerging on higher timeframe oscillators`,
          `Exhaustion of aggressive buying volume into local resistance`,
          `Liquidity sweep of prior highs without immediate continuation`,
        ]
      : [
          `Heavy limit bidding clustered near structural discount levels`,
          `Oversold RSI momentum generating bullish divergence`,
          `Short squeeze triggering cascading stop-loss buy stops above resistance`,
        ],
    invalidationTrigger: isBullish
      ? `Re-acceptance and high-volume surge above ${res.toFixed(asset.decimals)}`
      : `Decisive structural break below ${sup.toFixed(asset.decimals)}`,
    catalystRisk: `Sudden headline risk or unexpected geopolitical / policy shift.`,
  };

  // High Volatility / Event Risk Case
  const highVolatility: ScenarioDefinition = {
    id: "high_volatility",
    title: `Scenario C: Bi-Directional Liquidity Sweep (High-Impact Event)`,
    probability: volProb,
    direction: "neutral",
    targetArea: `Expanded range: ${sup.toFixed(asset.decimals)} ↔ ${res.toFixed(asset.decimals)}`,
    timeHorizon: `Intra-event release window (15-45 minutes)`,
    supportingEvidence: [
      `Elevated options implied volatility prior to scheduled data release`,
      `Order book thinning creating high slippage susceptibility`,
      `Equal highs & equal lows both remaining unmitigated liquidity targets`,
    ],
    invalidationTrigger: `Calm market conditions post-release establishing clear directional drift`,
    catalystRisk: `Scheduled economic calendar release (e.g. CPI, NFP, FOMC, Rate Decision).`,
  };

  return { baseCase, alternative, highVolatility };
}

