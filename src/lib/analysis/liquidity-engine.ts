import {
  OHLCV,
  LiquidityPool,
  MarketStructurePoint,
  TradingSession,
} from "@/types/market";

/**
 * Detects liquidity pools and resting order concentrations
 */
export function identifyLiquidityPools(
  bars: OHLCV[],
  pivots: MarketStructurePoint[],
  currentPrice: number,
  pipSize = 0.0001,
  tolerancePercent = 0.0015
): LiquidityPool[] {
  const pools: LiquidityPool[] = [];
  const highPivots = pivots.filter((p) => p.type === "HH" || p.type === "LH");
  const lowPivots = pivots.filter((p) => p.type === "HL" || p.type === "LL");

  // 1. Equal Highs (EQH)
  for (let i = 0; i < highPivots.length; i++) {
    for (let j = i + 1; j < highPivots.length; j++) {
      const p1 = highPivots[i];
      const p2 = highPivots[j];
      const diff = Math.abs(p1.price - p2.price) / p1.price;

      if (diff < tolerancePercent) {
        const poolPrice = (p1.price + p2.price) / 2;
        // Check if swept by subsequent price
        const highestSince = Math.max(
          ...bars.filter((b) => b.time > p2.time).map((b) => b.high),
          0
        );
        const swept = highestSince > poolPrice;

        const distancePips = Number(((poolPrice - currentPrice) / pipSize).toFixed(1));
        const distancePercent = Number((((poolPrice - currentPrice) / currentPrice) * 100).toFixed(2));

        pools.push({
          id: `eqh-${p1.index}-${p2.index}`,
          priceLevel: Number(poolPrice.toFixed(4)),
          type: "equal_highs",
          estimatedVolumeUSD: 24500000,
          strengthScore: swept ? 25 : 85,
          swept,
          distancePips,
          distancePercent,
        });
      }
    }
  }

  // 2. Equal Lows (EQL)
  for (let i = 0; i < lowPivots.length; i++) {
    for (let j = i + 1; j < lowPivots.length; j++) {
      const p1 = lowPivots[i];
      const p2 = lowPivots[j];
      const diff = Math.abs(p1.price - p2.price) / p1.price;

      if (diff < tolerancePercent) {
        const poolPrice = (p1.price + p2.price) / 2;
        const lowestSince = Math.min(
          ...bars.filter((b) => b.time > p2.time).map((b) => b.low),
          Infinity
        );
        const swept = lowestSince < poolPrice;

        const distancePips = Number(((currentPrice - poolPrice) / pipSize).toFixed(1));
        const distancePercent = Number((((currentPrice - poolPrice) / currentPrice) * 100).toFixed(2));

        pools.push({
          id: `eql-${p1.index}-${p2.index}`,
          priceLevel: Number(poolPrice.toFixed(4)),
          type: "equal_lows",
          estimatedVolumeUSD: 28900000,
          strengthScore: swept ? 25 : 88,
          swept,
          distancePips,
          distancePercent,
        });
      }
    }
  }

  // 3. Major Swing Extremes (Resting Buy-Side / Sell-Side Liquidity)
  const recentHighs = highPivots.slice(-3);
  for (const h of recentHighs) {
    if (!pools.some((p) => Math.abs(p.priceLevel - h.price) / h.price < 0.001)) {
      const distancePips = Number(((h.price - currentPrice) / pipSize).toFixed(1));
      const distancePercent = Number((((h.price - currentPrice) / currentPrice) * 100).toFixed(2));
      const swept = bars.some((b) => b.time > h.time && b.high > h.price);

      pools.push({
        id: `swing-high-${h.index}`,
        priceLevel: h.price,
        type: "swing_high_pool",
        estimatedVolumeUSD: 16500000,
        strengthScore: swept ? 30 : 78,
        swept,
        distancePips,
        distancePercent,
      });
    }
  }

  const recentLows = lowPivots.slice(-3);
  for (const l of recentLows) {
    if (!pools.some((p) => Math.abs(p.priceLevel - l.price) / l.price < 0.001)) {
      const distancePips = Number(((currentPrice - l.price) / pipSize).toFixed(1));
      const distancePercent = Number((((currentPrice - l.price) / currentPrice) * 100).toFixed(2));
      const swept = bars.some((b) => b.time > l.time && b.low < l.price);

      pools.push({
        id: `swing-low-${l.index}`,
        priceLevel: l.price,
        type: "swing_low_pool",
        estimatedVolumeUSD: 19200000,
        strengthScore: swept ? 30 : 80,
        swept,
        distancePips,
        distancePercent,
      });
    }
  }

  // Sort by proximity to current price
  return pools.sort((a, b) => Math.abs(a.distancePercent) - Math.abs(b.distancePercent));
}

