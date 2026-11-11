import { NextRequest, NextResponse } from "next/server";
import { getAssetBySymbol, SUPPORTED_ASSETS } from "@/lib/data/supported-assets";
import { marketDataProvider } from "@/lib/providers/market-data-provider";
import { newsProvider } from "@/lib/providers/news-provider";
import { economicCalendarProvider } from "@/lib/providers/economic-calendar-provider";
import { aiReasoningProvider } from "@/lib/providers/ai-reasoning-provider";
import { Timeframe } from "@/types/market";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get("symbol") || "XAU/USD";
    const timeframe = (searchParams.get("timeframe") || "15m") as Timeframe;

    const asset = getAssetBySymbol(symbol) || SUPPORTED_ASSETS[0];
    const bars = await marketDataProvider.getHistoricalCandles(asset.symbol, timeframe, 120);
    const news = await newsProvider.getNewsForAsset(asset.symbol, 4);
    const events = await economicCalendarProvider.getUpcomingEvents();

    const outlook = await aiReasoningProvider.generateMarketOutlook(
      asset,
      timeframe,
      bars,
      news,
      events
    );

    return NextResponse.json({
      success: true,
      data: outlook,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate market outlook" },
      { status: 500 }
    );
  }
}

