import { NextRequest, NextResponse } from "next/server";
import { newsProvider } from "@/lib/providers/news-provider";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get("symbol");
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const news = symbol
      ? await newsProvider.getNewsForAsset(symbol, limit)
      : await newsProvider.getTopMarketNews(limit);

    return NextResponse.json({
      success: true,
      data: news,
      count: news.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch news" },
      { status: 500 }
    );
  }
}

