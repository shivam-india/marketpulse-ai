import { NextRequest, NextResponse } from "next/server";
import { chartVisionProvider } from "@/lib/providers/chart-vision-provider";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }
    const { image, assetSymbol } = body;

    if (!image) {
      return NextResponse.json(
        { success: false, error: "Base64 image payload is required" },
        { status: 400 }
      );
    }

    const visionResult = await chartVisionProvider.analyzeChartImage(image, assetSymbol);

    return NextResponse.json({
      success: true,
      data: visionResult,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process chart vision" },
      { status: 500 }
    );
  }
}

