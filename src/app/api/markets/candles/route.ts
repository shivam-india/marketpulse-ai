import { NextRequest, NextResponse } from "next/server";
import { marketDataProvider } from "@/lib/providers/market-data-provider";
import { Timeframe } from "@/types/market";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get("symbol") || "XAU/USD";
    const timeframe = (searchParams.get("timeframe") || "15m") as Timeframe;
    const count = parseInt(searchParams.get("count") || "120", 10);

    const bars = await marketDataProvider.getHistoricalCandles(symbol, timeframe, count);

    return NextResponse.json({
      success: true,
      symbol,
      timeframe,
      bars,
      count: bars.length,
      lastBarTime: bars[bars.length - 1]?.time,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch candles" },
      { status: 500 }
    );
  }
}

