import { NextResponse } from "next/server";
import { marketDataProvider } from "@/lib/providers/market-data-provider";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const quotes = await marketDataProvider.getAssetQuotes();
    return NextResponse.json({
      success: true,
      data: quotes,
      count: quotes.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch quotes" },
      { status: 500 }
    );
  }
}

