import { NextRequest, NextResponse } from "next/server";
import { getAssetBySymbol, SUPPORTED_ASSETS } from "@/lib/data/supported-assets";
import { marketDataProvider } from "@/lib/providers/market-data-provider";
import { runWalkForwardBacktest } from "@/lib/analysis/backtest-engine";
import { Timeframe } from "@/types/market";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const symbol = body.symbol || "XAU/USD";
    const timeframe = (body.timeframe || "15m") as Timeframe;
    const lookbackBars = body.lookbackBars || 180;
    const minConfluenceScore = body.minConfluenceScore || 70;
    const riskRewardRatio = body.riskRewardRatio || 2.0;

    const asset = getAssetBySymbol(symbol) || SUPPORTED_ASSETS[0];
    const bars = await marketDataProvider.getHistoricalCandles(asset.symbol, timeframe, lookbackBars);

    const backtestResult = runWalkForwardBacktest(bars, {
      asset,
      timeframe,
      lookbackBars,
      minConfluenceScore,
      riskRewardRatio,
    });

    return NextResponse.json({
      success: true,
      data: backtestResult,
    });
  } catch (error: any) {
    console.error("Backtest API error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || String(error) },
      { status: 500 }
    );
  }
}

