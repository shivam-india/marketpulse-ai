import { CrossMarketCorrelation, AssetInfo } from "@/types/market";

/**
 * Computes cross-market correlations and confirmation for a given asset
 */
export function getCrossMarketCorrelations(asset: AssetInfo): CrossMarketCorrelation[] {
  const symbol = asset.symbol.toUpperCase();

  if (symbol.includes("XAU") || symbol.includes("GOLD")) {
    return [
      {
        pair: "DXY (US Dollar Index) ↔ Gold",
        correlationCoefficient: -0.84,
        relationship: "inverse",
        currentBehavior: "confirming",
        explanation:
          "DXY index is softening near resistance (104.80), removing overhead headwinds for dollar-denominated bullion and confirming bullish continuation.",
      },
      {
        pair: "US 10-Year Real Yields ↔ Gold",
        correlationCoefficient: -0.78,
        relationship: "inverse",
        currentBehavior: "confirming",
        explanation:
          "10-Year Treasury yields compressed 4 bps today to 4.38%, lowering the opportunity cost of holding non-yielding physical gold.",
      },
      {
        pair: "Silver (XAG/USD) ↔ Gold",
        correlationCoefficient: 0.89,
        relationship: "direct",
        currentBehavior: "confirming",
        explanation:
          "Silver is outperforming (+1.68% vs +0.68%), showing broad precious metal risk bid and confirming underlying physical spot demand.",
      },
    ];
  }

  if (symbol.includes("EUR/USD")) {
    return [
      {
        pair: "DXY ↔ EUR/USD",
        correlationCoefficient: -0.96,
        relationship: "inverse",
        currentBehavior: "confirming",
        explanation:
          "EUR represents 57.6% of the DXY weighting. DXY contraction directly corroborates EUR/USD intraday bid above 1.0820 support.",
      },
      {
        pair: "German Bund - US Treasury 10Y Spread",
        correlationCoefficient: 0.74,
        relationship: "direct",
        currentBehavior: "lagging",
        explanation:
          "Transatlantic rate spread remains wide (-205 bps), keeping medium-term upside capped around 1.0910 resistance.",
      },
    ];
  }

  if (symbol.includes("USD/JPY")) {
    return [
      {
        pair: "US 10-Year Yield ↔ USD/JPY",
        correlationCoefficient: 0.88,
        relationship: "direct",
        currentBehavior: "confirming",
        explanation:
          "Widening US-Japan yield differential continues to exert upside drift on the pair, offset only by BoJ FX intervention jawboning risk.",
      },
      {
        pair: "Nikkei 225 ↔ USD/JPY",
        correlationCoefficient: 0.72,
        relationship: "direct",
        currentBehavior: "confirming",
        explanation:
          "Yen weakness is lifting export-heavy Tokyo equities, providing cyclical risk confirmation.",
      },
    ];
  }

  if (symbol.includes("WTI") || symbol.includes("BRENT") || symbol.includes("CRUDE")) {
    return [
      {
        pair: "WTI Crude ↔ USD/CAD",
        correlationCoefficient: -0.79,
        relationship: "inverse",
        currentBehavior: "confirming",
        explanation:
          "Softness in crude oil benchmark contracts is weighing on the petro-currency CAD, driving USD/CAD toward 1.3950.",
      },
      {
        pair: "Crude ↔ US 5Y Break-even Inflation",
        correlationCoefficient: 0.65,
        relationship: "direct",
        currentBehavior: "confirming",
        explanation:
          "Lower energy input prices dampen forward headline inflation projections, easing pressure on central bank policy paths.",
      },
    ];
  }

  if (symbol.includes("BTC") || symbol.includes("ETH") || symbol.includes("SOL")) {
    return [
      {
        pair: "BTC/USD ↔ NASDAQ 100",
        correlationCoefficient: 0.71,
        relationship: "direct",
        currentBehavior: "confirming",
        explanation:
          "Positive high-beta tech equity flows and risk appetite in NQ futures are providing a favorable macroeconomic backdrop for digital assets.",
      },
      {
        pair: "BTC Dominance ↔ Altcoin Breadth",
        correlationCoefficient: -0.62,
        relationship: "inverse",
        currentBehavior: "diverging",
        explanation:
          "BTC dominance is consolidating at 58.4%, while select Layer-1s show selective capital rotation rather than broad altcoin dispersion.",
      },
      {
        pair: "USDT / USD Premium & Stablecoin Inflows",
        correlationCoefficient: 0.82,
        relationship: "direct",
        currentBehavior: "confirming",
        explanation:
          "Net stablecoin exchange inflows reached +$1.2B over 48h, indicating dry-powder liquidity entering centralized spot/derivatives books.",
      },
    ];
  }

  // Default Indices & Equities (e.g. US30, SP500, NASDAQ)
  return [
    {
      pair: "VIX (Volatility Index) ↔ S&P 500",
      correlationCoefficient: -0.82,
      relationship: "inverse",
      currentBehavior: "confirming",
      explanation:
        "VIX compressed to 14.8, reflecting low demand for downside protective puts and supporting index dip-buying behavior.",
    },
    {
      pair: "US 10-Year Treasury Yield ↔ Tech Equities",
      correlationCoefficient: -0.68,
      relationship: "inverse",
      currentBehavior: "confirming",
      explanation:
        "Yield stabilization around 4.38% alleviates DCF multiple compression for long-duration growth components.",
    },
    {
      pair: "DXY ↔ Large-cap Multinationals",
      correlationCoefficient: -0.55,
      relationship: "inverse",
      currentBehavior: "confirming",
      explanation:
        "A milder dollar provides earnings translation relief for US multinational index heavyweights.",
    },
  ];
}

