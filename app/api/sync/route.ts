import { NextResponse } from "next/server";
import { scraperManager } from "@/lib/scrapers/scraperManager";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const target = body.target || "ALL"; // ALL, CALENDAR, EXAMS, NOTICES, PORTAL

    let result;
    if (target === "CALENDAR") {
      result = await scraperManager.syncCalendar();
    } else if (target === "EXAMS") {
      result = await scraperManager.syncExams();
    } else if (target === "NOTICES") {
      result = await scraperManager.syncNotices();
    } else if (target === "PORTAL") {
      result = await scraperManager.syncPortal();
    } else {
      result = await scraperManager.syncAllSources();
    }

    return NextResponse.json({
      success: true,
      target,
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Sync execution failed: " + err.message },
      { status: 500 }
    );
  }
}
