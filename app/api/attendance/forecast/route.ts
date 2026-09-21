import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { generateForecastCurve } from "@/lib/attendance/attendanceEngine";

import { getAuthenticatedStudent } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get("subjectId");

    const user = await getAuthenticatedStudent();

    if (!user) {
      return NextResponse.json({ error: "Please log in first.", unauthenticated: true }, { status: 401 });
    }

    const targetPercentage = user.target?.targetPercentage ?? 75.0;

    // If a specific subject is requested
    if (subjectId) {
      const subject = user.subjects?.find((s: any) => s.id === subjectId);
      if (!subject || !subject.attendance) {
        return NextResponse.json({ error: "Subject not found." }, { status: 404 });
      }

      const points = generateForecastCurve({
        currentAttended: subject.attendance.attended,
        currentConducted: subject.attendance.conducted,
        futureClassesCount: 20,
        targetPercentage,
      });

      return NextResponse.json({
        success: true,
        subject: {
          id: subject.id,
          name: subject.name,
          code: subject.code,
        },
        forecastPoints: points,
      });
    }

    // Overall aggregate forecast
    let totalAttended = 0;
    let totalConducted = 0;
    for (const s of user.subjects) {
      totalAttended += s.attendance?.attended ?? 0;
      totalConducted += s.attendance?.conducted ?? 0;
    }

    const overallPoints = generateForecastCurve({
      currentAttended: totalAttended,
      currentConducted: totalConducted,
      futureClassesCount: 25,
      targetPercentage,
    });

    return NextResponse.json({
      success: true,
      overall: true,
      forecastPoints: overallPoints,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Forecast generation failed: " + err.message },
      { status: 500 }
    );
  }
}
