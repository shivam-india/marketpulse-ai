import { OHLCV, TechnicalIndicators } from "@/types/market";

/**
 * Calculates Exponential Moving Average (EMA)
 */
export function calculateEMA(values: number[], period: number): number[] {
  if (values.length < period) return new Array(values.length).fill(values[values.length - 1] || 0);

  const k = 2 / (period + 1);
  const emaArray: number[] = new Array(values.length);

  // Initialize first EMA with Simple Moving Average (SMA)
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += values[i];
  }
  emaArray[period - 1] = sum / period;

  // Fill preceding with the initial SMA
  for (let i = 0; i < period - 1; i++) {
    emaArray[i] = emaArray[period - 1];
  }

  // Calculate subsequent EMAs
  for (let i = period; i < values.length; i++) {
    emaArray[i] = values[i] * k + emaArray[i - 1] * (1 - k);
  }

  return emaArray;
}

/**
 * Calculates Wilder's RSI (14)
 */
export function calculateRSI(closes: number[], period: number = 14): number[] {
  const rsi: number[] = new Array(closes.length).fill(50);
  if (closes.length <= period) return rsi;

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff;
    else losses += Math.abs(diff);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  rsi[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);

  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? Math.abs(diff) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    if (avgLoss === 0) {
      rsi[i] = 100;
    } else {
      const rs = avgGain / avgLoss;
      rsi[i] = 100 - 100 / (1 + rs);
    }
  }

  return rsi;
}

/**
 * Calculates MACD (12, 26, 9)
 */
export function calculateMACD(
  closes: number[],
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9
) {
  const fastEMA = calculateEMA(closes, fastPeriod);
  const slowEMA = calculateEMA(closes, slowPeriod);

  const macdLine: number[] = new Array(closes.length).fill(0);
  for (let i = 0; i < closes.length; i++) {
    macdLine[i] = fastEMA[i] - slowEMA[i];
  }

  const signalLine = calculateEMA(macdLine, signalPeriod);
  const histogram: number[] = new Array(closes.length).fill(0);
  for (let i = 0; i < closes.length; i++) {
    histogram[i] = macdLine[i] - signalLine[i];
  }

  return { macdLine, signalLine, histogram };
}

/**
 * Calculates Average True Range (ATR 14)
 */
export function calculateATR(bars: OHLCV[], period = 14): number[] {
  const atr: number[] = new Array(bars.length).fill(0);
  if (bars.length < 2) return atr;

  const tr: number[] = new Array(bars.length).fill(0);
  tr[0] = bars[0].high - bars[0].low;

  for (let i = 1; i < bars.length; i++) {
    const high = bars[i].high;
    const low = bars[i].low;
    const prevClose = bars[i - 1].close;

    tr[i] = Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose)
    );
  }

  // Smooth TR with RMA / EMA period
  let trSum = 0;
  for (let i = 0; i < Math.min(period, tr.length); i++) {
    trSum += tr[i];
  }
  let currentATR = trSum / Math.min(period, tr.length);
  atr[period - 1] = currentATR;

  for (let i = period; i < bars.length; i++) {
    currentATR = (currentATR * (period - 1) + tr[i]) / period;
    atr[i] = currentATR;
  }

  return atr;
}

/**
 * Calculates Bollinger Bands (20, 2)
 */
export function calculateBollingerBands(closes: number[], period = 20, multiplier = 2) {
  const upper: number[] = new Array(closes.length).fill(0);
  const middle: number[] = new Array(closes.length).fill(0);
  const lower: number[] = new Array(closes.length).fill(0);
  const bandwidth: number[] = new Array(closes.length).fill(0);

  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) {
      middle[i] = closes[i];
      upper[i] = closes[i] * 1.01;
      lower[i] = closes[i] * 0.99;
      bandwidth[i] = 2;
      continue;
    }

    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      sum += closes[j];
    }
    const sma = sum / period;
    middle[i] = sma;

    let varianceSum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      varianceSum += Math.pow(closes[j] - sma, 2);
    }
    const stdDev = Math.sqrt(varianceSum / period);

    upper[i] = sma + multiplier * stdDev;
    lower[i] = sma - multiplier * stdDev;
    bandwidth[i] = sma !== 0 ? ((upper[i] - lower[i]) / sma) * 100 : 0;
  }

  return { upper, middle, lower, bandwidth };
}

/**
 * Calculates Intraday VWAP
 */
export function calculateVWAP(bars: OHLCV[]): number[] {
  const vwap: number[] = new Array(bars.length).fill(0);
  let cumulativeTypicalVol = 0;
  let cumulativeVol = 0;

  for (let i = 0; i < bars.length; i++) {
    const typicalPrice = (bars[i].high + bars[i].low + bars[i].close) / 3;
    const vol = Math.max(bars[i].volume, 1);

    cumulativeTypicalVol += typicalPrice * vol;
    cumulativeVol += vol;

    vwap[i] = cumulativeTypicalVol / cumulativeVol;
  }

  return vwap;
}

/**
 * Calculates Average Directional Index (ADX 14)
 */
export function calculateADX(bars: OHLCV[], period = 14): number[] {
  const adx: number[] = new Array(bars.length).fill(20);
  if (bars.length < period * 2) return adx;

  const plusDM: number[] = new Array(bars.length).fill(0);
  const minusDM: number[] = new Array(bars.length).fill(0);
  const tr: number[] = new Array(bars.length).fill(0);

  for (let i = 1; i < bars.length; i++) {
    const upMove = bars[i].high - bars[i - 1].high;
    const downMove = bars[i - 1].low - bars[i].low;

    if (upMove > downMove && upMove > 0) plusDM[i] = upMove;
    if (downMove > upMove && downMove > 0) minusDM[i] = downMove;

    tr[i] = Math.max(
      bars[i].high - bars[i].low,
      Math.abs(bars[i].high - bars[i - 1].close),
      Math.abs(bars[i].low - bars[i - 1].close)
    );
  }

  const smoothTR = calculateEMA(tr, period);
  const smoothPlusDM = calculateEMA(plusDM, period);
  const smoothMinusDM = calculateEMA(minusDM, period);

  const dx: number[] = new Array(bars.length).fill(0);
  for (let i = period; i < bars.length; i++) {
    const str = Math.max(smoothTR[i], 0.00001);
    const plusDI = (smoothPlusDM[i] / str) * 100;
    const minusDI = (smoothMinusDM[i] / str) * 100;
    const diSum = plusDI + minusDI;
    dx[i] = diSum === 0 ? 0 : (Math.abs(plusDI - minusDI) / diSum) * 100;
  }

  return calculateEMA(dx, period);
}

/**
 * Computes all technical indicators for the latest bar
 */
export function computeTechnicalIndicators(bars: OHLCV[]): TechnicalIndicators {
  const closes = bars.map((b) => b.close);
  const volumes = bars.map((b) => b.volume);
  const lastIndex = bars.length - 1;

  const ema20Arr = calculateEMA(closes, 20);
  const ema50Arr = calculateEMA(closes, 50);
  const ema100Arr = calculateEMA(closes, 100);
  const ema200Arr = calculateEMA(closes, 200);

  const rsiArr = calculateRSI(closes, 14);
  const macdObj = calculateMACD(closes, 12, 26, 9);
  const atrArr = calculateATR(bars, 14);
  const bbObj = calculateBollingerBands(closes, 20, 2);
  const vwapArr = calculateVWAP(bars);
  const adxArr = calculateADX(bars, 14);

  // Volume 20 SMA
  let volSum = 0;
  const volPeriod = Math.min(20, volumes.length);
  for (let i = volumes.length - volPeriod; i < volumes.length; i++) {
    volSum += volumes[i];
  }
  const volume20SMA = volSum / volPeriod;
  const currentVol = volumes[lastIndex] || 1;
  const volumeRatio = volume20SMA > 0 ? currentVol / volume20SMA : 1;

  return {
    ema20: ema20Arr[lastIndex],
    ema50: ema50Arr[lastIndex],
    ema100: ema100Arr[lastIndex],
    ema200: ema200Arr[lastIndex],
    rsi14: Number(rsiArr[lastIndex].toFixed(2)),
    macd: {
      macdLine: Number(macdObj.macdLine[lastIndex].toFixed(4)),
      signalLine: Number(macdObj.signalLine[lastIndex].toFixed(4)),
      histogram: Number(macdObj.histogram[lastIndex].toFixed(4)),
    },
    atr14: Number(atrArr[lastIndex].toFixed(4)),
    bollingerBands: {
      upper: Number(bbObj.upper[lastIndex].toFixed(2)),
      middle: Number(bbObj.middle[lastIndex].toFixed(2)),
      lower: Number(bbObj.lower[lastIndex].toFixed(2)),
      bandwidth: Number(bbObj.bandwidth[lastIndex].toFixed(2)),
    },
    vwap: Number(vwapArr[lastIndex].toFixed(2)),
    adx14: Number(adxArr[lastIndex].toFixed(2)),
    volume20SMA: Math.round(volume20SMA),
    volumeRatio: Number(volumeRatio.toFixed(2)),
  };
}

