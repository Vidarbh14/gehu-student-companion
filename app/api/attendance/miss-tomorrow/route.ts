import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { evaluateCanIMissTomorrow } from "@/lib/attendance/attendanceEngine";
import { getTomorrowSchedule } from "@/lib/timetable/timetableEngine";
import { AcademicCalendarEvent, TimetableSlot } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");
    const targetDate = dateParam ? new Date(dateParam) : new Date();

    const user = await prisma.user.findFirst({
      where: { email: "demo@gehu.ac.in" },
      include: {
        target: true,
        subjects: {
          include: { attendance: true },
        },
        timetable: {
          include: { subject: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
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

    const timetableSlots: TimetableSlot[] = user.timetable.map((t) => ({
      id: t.id,
      subjectId: t.subjectId,
      subjectName: t.subject.name,
      subjectCode: t.subject.code,
      dayOfWeek: t.dayOfWeek as any,
      startTime: t.startTime,
      endTime: t.endTime,
      classType: (t.classType as any) || "THEORY",
      color: t.subject.color,
    }));

    const schedule = getTomorrowSchedule({
      referenceDate: targetDate,
      timetable: timetableSlots,
      academicEvents,
    });

    const targetPercentage = user.target?.targetPercentage ?? 75.0;
    const safetyBuffer = user.target?.safetyBuffer ?? 2.0;

    const scheduledSubjectsData = schedule.slots.map((slot) => {
      const sub = user.subjects.find((s) => s.id === slot.subjectId);
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
