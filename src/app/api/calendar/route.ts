import { NextRequest, NextResponse } from "next/server";
import { economicCalendarProvider } from "@/lib/providers/economic-calendar-provider";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const currency = searchParams.get("currency");

    const events = currency
      ? await economicCalendarProvider.getEventsForCurrency(currency)
      : await economicCalendarProvider.getUpcomingEvents();

    return NextResponse.json({
      success: true,
      data: events,
      count: events.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch economic calendar" },
      { status: 500 }
    );
  }
}

