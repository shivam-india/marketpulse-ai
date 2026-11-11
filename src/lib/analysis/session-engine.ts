import { SessionInfo, TradingSession, OHLCV } from "@/types/market";

export interface SessionSchedule {
  name: TradingSession;
  label: string;
  openUTC: number; // Hour in UTC
  closeUTC: number;
}

export const SESSIONS_SCHEDULE: SessionSchedule[] = [
  { name: "sydney", label: "Sydney", openUTC: 21, closeUTC: 6 },
  { name: "tokyo", label: "Tokyo", openUTC: 0, closeUTC: 9 },
  { name: "london", label: "London", openUTC: 7, closeUTC: 16 },
  { name: "new_york", label: "New York", openUTC: 12, closeUTC: 21 },
];

/**
 * Checks whether an hour falls in the session interval (handles UTC day rollover)
 */
export function isHourInSession(hourUTC: number, openUTC: number, closeUTC: number): boolean {
  if (openUTC < closeUTC) {
    return hourUTC >= openUTC && hourUTC < closeUTC;
  }
  // Crosses midnight
  return hourUTC >= openUTC || hourUTC < closeUTC;
}

/**
 * Returns current active trading sessions and their status
 */
export function getCurrentSessions(currentTime: Date = new Date()): {
  activeSessions: TradingSession[];
  isLondonNYOverlap: boolean;
  isAsianRange: boolean;
  sessionDetails: Record<TradingSession, SessionInfo>;
} {
  const currentUTCHour = currentTime.getUTCHours();
  const currentUTCMinute = currentTime.getUTCMinutes();
  const timeDec = currentUTCHour + currentUTCMinute / 60;

  const activeSessions: TradingSession[] = [];
  const sessionDetails = {} as Record<TradingSession, SessionInfo>;

  for (const s of SESSIONS_SCHEDULE) {
    const isOpen = isHourInSession(Math.floor(timeDec), s.openUTC, s.closeUTC);
    if (isOpen) activeSessions.push(s.name);

    sessionDetails[s.name] = {
      session: s.name,
      isOpen,
      opensAtUTC: `${String(s.openUTC).padStart(2, "0")}:00 UTC`,
      closesAtUTC: `${String(s.closeUTC).padStart(2, "0")}:00 UTC`,
      high: 0,
      low: 0,
      rangePips: 0,
      volatilityRelative: isOpen
        ? s.name === "london" || s.name === "new_york"
          ? "elevated"
          : "average"
        : "low",
    };
  }

  const isLondonNYOverlap =
    activeSessions.includes("london") && activeSessions.includes("new_york");

  const isAsianRange =
    activeSessions.includes("tokyo") && !activeSessions.includes("london");

  return {
    activeSessions,
    isLondonNYOverlap,
    isAsianRange,
    sessionDetails,
  };
}

/**
 * Calculates session high, low, and range from historical bars
 */
export function calculateSessionRanges(
  bars: OHLCV[],
  pipSize = 0.0001
): Record<TradingSession, { high: number; low: number; rangePips: number }> {
  const result: Record<TradingSession, { high: number; low: number; rangePips: number }> = {
    sydney: { high: 0, low: Infinity, rangePips: 0 },
    tokyo: { high: 0, low: Infinity, rangePips: 0 },
    london: { high: 0, low: Infinity, rangePips: 0 },
    new_york: { high: 0, low: Infinity, rangePips: 0 },
  };

  // Look at bars within the last 24 hours
  const nowSec = Math.floor(Date.now() / 1000);
  const recentBars = bars.filter((b) => nowSec - b.time < 86400);

  for (const bar of recentBars) {
    const barDate = new Date(bar.time * 1000);
    const hourUTC = barDate.getUTCHours();

    for (const s of SESSIONS_SCHEDULE) {
      if (isHourInSession(hourUTC, s.openUTC, s.closeUTC)) {
        if (bar.high > result[s.name].high) result[s.name].high = bar.high;
        if (bar.low < result[s.name].low) result[s.name].low = bar.low;
      }
    }
  }

  for (const s of SESSIONS_SCHEDULE) {
    if (result[s.name].low === Infinity) {
      result[s.name].low = 0;
      result[s.name].rangePips = 0;
    } else {
      result[s.name].rangePips = Number(
        ((result[s.name].high - result[s.name].low) / pipSize).toFixed(1)
      );
    }
  }

  return result;
}

