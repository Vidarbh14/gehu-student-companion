import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const events = await prisma.academicEvent.findMany({
      orderBy: { startDate: "asc" },
    });

    const holidays = events.filter((e) => e.type === "HOLIDAY");
    const exams = events.filter(
      (e) =>
        e.type === "MID_SEM" ||
        e.type === "END_SEM" ||
        e.type === "PRACTICAL_EXAM"
    );

    return NextResponse.json({
      success: true,
      events,
      holidays,
      exams,
      totalCount: events.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to fetch calendar events: " + err.message },
      { status: 500 }
    );
  }
}
