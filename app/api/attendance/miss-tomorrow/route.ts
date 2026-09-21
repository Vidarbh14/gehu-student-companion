import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { evaluateCanIMissTomorrow } from "@/lib/attendance/attendanceEngine";
import { getTomorrowSchedule } from "@/lib/timetable/timetableEngine";
import { AcademicCalendarEvent, TimetableSlot } from "@/types";

import { getAuthenticatedStudent } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");
    const targetDate = dateParam ? new Date(dateParam) : new Date();

    const user = await getAuthenticatedStudent();

    if (!user) {
      return NextResponse.json({ error: "Please log in first.", unauthenticated: true }, { status: 401 });
    }

    const rawEvents = await prisma.academicEvent.findMany();
    const academicEvents: AcademicCalendarEvent[] = rawEvents.map((e) => ({
      id: e.id,
      title: e.title,
      type: e.type as any,
      startDate: e.startDate.toISOString(),
      endDate: e.endDate.toISOString(),
      semester: e.semester || undefined,
      campus: e.campus,
      source: e.source,
      isOfficial: e.isOfficial,
    }));

    const timetableSlots: TimetableSlot[] = (user.timetable || []).map((t: any) => ({
      id: t.id,
      subjectId: t.subjectId,
      subjectName: t.subject?.name || "Subject",
      subjectCode: t.subject?.code || "TCS",
      dayOfWeek: t.dayOfWeek as any,
      startTime: t.startTime,
      endTime: t.endTime,
      classType: (t.classType as any) || "THEORY",
      color: t.subject?.color || "#0c81eb",
    }));

    const schedule = getTomorrowSchedule({
      referenceDate: targetDate,
      timetable: timetableSlots,
      academicEvents,
    });

    const targetPercentage = user.target?.targetPercentage ?? 75.0;
    const safetyBuffer = user.target?.safetyBuffer ?? 2.0;

    const scheduledSubjectsData = schedule.slots.map((slot) => {
      const sub = (user.subjects || []).find((s: any) => s.id === slot.subjectId);
      return {
        subjectId: slot.subjectId,
        subjectCode: slot.subjectCode,
        subjectName: slot.subjectName,
        slotsCount: 1,
        attended: sub?.attendance?.attended ?? 0,
        conducted: sub?.attendance?.conducted ?? 0,
      };
    });

    const evaluation = evaluateCanIMissTomorrow({
      date: schedule.date,
      dayOfWeek: schedule.dayOfWeek,
      scheduledSubjects: scheduledSubjectsData,
      targetPercentage,
      safetyBuffer,
    });

    return NextResponse.json({
      success: true,
      schedule,
      evaluation,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to evaluate schedule: " + err.message },
      { status: 500 }
    );
  }
}
