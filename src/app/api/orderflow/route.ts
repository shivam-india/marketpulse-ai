import { NextRequest, NextResponse } from "next/server";
import { getAssetBySymbol, SUPPORTED_ASSETS } from "@/lib/data/supported-assets";
import { fetchRealOrderFlowAndDepth } from "@/lib/providers/real-orderflow-provider";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get("symbol") || "BTC/USD";

    const asset = getAssetBySymbol(symbol) || SUPPORTED_ASSETS[0];
    const orderFlowData = await fetchRealOrderFlowAndDepth(asset);

    return NextResponse.json({
      success: true,
      data: orderFlowData,
      symbol: asset.symbol,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch order flow data" },
      { status: 500 }
    );
  }
}

