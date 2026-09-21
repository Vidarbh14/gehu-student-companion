import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import {
  calculateAttendancePercentage,
  getEffectiveTarget,
  determineAttendanceStatus,
  calculateSubjectMetrics,
  evaluateCanIMissTomorrow,
} from "@/lib/attendance/attendanceEngine";
import {
  calculateDateAwareRemainingClasses,
  getTomorrowSchedule,
  getTodaySchedule,
} from "@/lib/timetable/timetableEngine";
import { AcademicCalendarEvent, TimetableSlot } from "@/types";

import { getAuthenticatedStudent } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1. Get authenticated student user
    const user = await getAuthenticatedStudent();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          unauthenticated: true,
          error: "Please log in with your Student ID to view your dashboard.",
        },
        { status: 401 }
      );
    }

    // 2. Fetch academic events and exams
    const rawEvents = await prisma.academicEvent.findMany({
      orderBy: { startDate: "asc" },
    });
    const academicEvents: AcademicCalendarEvent[] = rawEvents.map((e) => ({
      id: e.id,
      title: e.title,
      type: e.type as any,
      startDate: e.startDate.toISOString(),
      endDate: e.endDate.toISOString(),
      semester: e.semester || undefined,
      campus: e.campus,
      source: e.source,
      sourceUrl: e.sourceUrl || undefined,
      isOfficial: e.isOfficial,
      description: e.description || undefined,
    }));

    const rawTimetable = user.timetable || [];
    const timetableSlots: TimetableSlot[] = rawTimetable.map((t: any) => ({
      id: t.id,
      subjectId: t.subjectId,
      subjectName: t.subject?.name || "Subject",
      subjectCode: t.subject?.code || "TCS",
      dayOfWeek: t.dayOfWeek as any,
      startTime: t.startTime,
      endTime: t.endTime,
      room: t.room || undefined,
      faculty: t.faculty || undefined,
      section: t.section || undefined,
      classType: (t.classType as any) || "THEORY",
      color: t.subject?.color || "#0c81eb",
    }));

    // Find semester end date from academic events or default to Dec 24, 2026
    const semEndEvent = academicEvents.find((e) => e.type === "SEMESTER_END");
    const semesterEndDate = semEndEvent
      ? new Date(semEndEvent.startDate)
      : new Date("2026-12-24");

    // 3. Compute date-aware remaining classes
    const currentDate = new Date();
    const remainingClassesMap = calculateDateAwareRemainingClasses({
      currentDate,
      semesterEndDate,
      timetable: timetableSlots,
      academicEvents,
    });

    const targetPercentage = user.target?.targetPercentage ?? 75.0;
    const safetyBuffer = user.target?.safetyBuffer ?? 2.0;
    const effectiveTarget = getEffectiveTarget(targetPercentage, safetyBuffer);

    // 4. Calculate subject metrics
    let userSubjects = user.subjects || [];
    if (userSubjects.length === 0) {
      const defaultSubjects = [
        { code: "TCS-301", name: "Data Structures & Algorithms", credits: 4, type: "THEORY", color: "#0c81eb", conducted: 35, attended: 30 },
        { code: "TCS-302", name: "Discrete Mathematics & Graph Theory", credits: 4, type: "THEORY", color: "#8b5cf6", conducted: 32, attended: 26 },
        { code: "TCS-303", name: "Operating Systems Principles", credits: 4, type: "THEORY", color: "#10b981", conducted: 30, attended: 27 },
        { code: "TEC-301", name: "Digital Electronics & Logic Design", credits: 3, type: "THEORY", color: "#ef4444", conducted: 28, attended: 20 },
        { code: "TCS-304", name: "Computer Organization & Architecture", credits: 3, type: "THEORY", color: "#f59e0b", conducted: 28, attended: 22 },
        { code: "PCS-301", name: "Data Structures Laboratory", credits: 1, type: "LAB", color: "#06b6d4", conducted: 10, attended: 9 },
      ];

      for (const s of defaultSubjects) {
        await prisma.subject.create({
          data: {
            userId: user.id,
            code: s.code,
            name: s.name,
            credits: s.credits,
            type: s.type,
            color: s.color,
            attendance: {
              create: {
                conducted: s.conducted,
                attended: s.attended,
                source: "MANUAL",
              },
            },
          },
        });
      }

      userSubjects = await prisma.subject.findMany({
        where: { userId: user.id },
        include: { attendance: true },
      });
    }

    let totalAttended = 0;
    let totalConducted = 0;
    let totalRemainingClasses = 0;
    let totalMaxAbsencesAllowed = 0;

    const subjectsMetrics = userSubjects.map((s: any) => {
      const att = s.attendance?.attended ?? 0;
      const cond = s.attendance?.conducted ?? 0;
      const remaining = remainingClassesMap[s.id] ?? 18;

      totalAttended += att;
      totalConducted += cond;
      totalRemainingClasses += remaining;

      const metrics = calculateSubjectMetrics({
        subjectId: s.id,
        subjectCode: s.code,
        subjectName: s.name,
        credits: s.credits,
        type: (s.type as any) || "THEORY",
        color: s.color,
        attended: att,
        conducted: cond,
        remainingClasses: remaining,
        targetPercentage,
        safetyBuffer,
      });

      totalMaxAbsencesAllowed += metrics.maxAbsencesAllowed;

      return metrics;
    });

    const overallPercentage = calculateAttendancePercentage(
      totalAttended,
      totalConducted
    );
    const overallStatus = determineAttendanceStatus(
      overallPercentage,
      targetPercentage,
      safetyBuffer
    );

    // 5. Compute tomorrow's schedule and "Can I miss tomorrow?"
    const tomorrowSchedule = getTomorrowSchedule({
      referenceDate: currentDate,
      timetable: timetableSlots,
      academicEvents,
    });

    const tomorrowSubjectsData = tomorrowSchedule.slots.map((slot) => {
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

    const missTomorrowResult = evaluateCanIMissTomorrow({
      date: tomorrowSchedule.date,
      dayOfWeek: tomorrowSchedule.dayOfWeek,
      scheduledSubjects: tomorrowSubjectsData,
      targetPercentage,
      safetyBuffer,
    });

    // 6. Today's schedule
    const todaySchedule = getTodaySchedule({
      referenceDate: currentDate,
      timetable: timetableSlots,
      academicEvents,
    });

    // 7. Upcoming next exam
    const upcomingExam = await prisma.exam.findFirst({
      where: {
        date: { gte: new Date() },
        status: { not: "CANCELLED" },
      },
      orderBy: { date: "asc" },
    });

    // 8. Latest pinned or important notice
    const importantNotice = await prisma.notice.findFirst({
      orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }],
    });

    // 9. Deterministic Smart Academic Insights
    const smartInsights: string[] = [];

    // Find any critical subject
    const criticalSubjects = subjectsMetrics.filter(
      (s: any) => s.status === "CRITICAL"
    );
    if (criticalSubjects.length > 0) {
      for (const cs of criticalSubjects) {
        smartInsights.push(
          `Your ${cs.subjectName} (${cs.subjectCode}) attendance is ${cs.currentPercentage}%. You currently need to attend the next ${cs.recoveryClassesNeeded} classes consecutively to recover to ${targetPercentage}%.`
        );
      }
    }

    // High buffer subjects
    const safeSubjects = subjectsMetrics.filter(
      (s: any) => s.currentPercentage >= 85
    );
    if (safeSubjects.length > 0) {
      const topSafe = safeSubjects[0];
      smartInsights.push(
        `Your ${topSafe.subjectName} attendance is ${topSafe.currentPercentage}%. You have a strong buffer and can miss up to ${topSafe.maxAbsencesAllowed} classes right now.`
      );
    }

    if (tomorrowSchedule.slots.length > 0) {
      smartInsights.push(
        `${tomorrowSchedule.slots.length} classes are scheduled tomorrow (${tomorrowSchedule.dayOfWeek}). Overall verdict: ${missTomorrowResult.verdict.replace(
          "_",
          " "
        )}.`
      );
    } else if (tomorrowSchedule.isHoliday) {
      smartInsights.push(
        `Tomorrow is a university holiday: ${
          tomorrowSchedule.specialEventTitle || "No classes scheduled"
        }.`
      );
    }

    if (upcomingExam) {
      const diffDays = Math.ceil(
        (new Date(upcomingExam.date).getTime() - currentDate.getTime()) /
          (1000 * 60 * 60 * 24)
      );
      smartInsights.push(
        `Your next examination (${upcomingExam.subjectName}) is in ${diffDays} days on ${new Date(
          upcomingExam.date
        ).toLocaleDateString("en-IN", {
          month: "short",
          day: "numeric",
        })}.`
      );
    }

    return NextResponse.json({
      success: true,
      student: {
        name: user.name,
        email: user.email,
        profile: user.profile,
        target: {
          targetPercentage,
          safetyBuffer,
          effectiveTarget,
        },
      },
      attendance: {
        overallPercentage,
        overallStatus,
        totalAttended,
        totalConducted,
        totalRemainingClasses,
        totalClassesCanMiss: Math.max(
          0,
          Math.floor(totalAttended / (effectiveTarget / 100) - totalConducted)
        ),
        subjects: subjectsMetrics,
      },
      missTomorrow: missTomorrowResult,
      todaySchedule,
      tomorrowSchedule,
      upcomingExam,
      importantNotice,
      smartInsights,
    });
  } catch (err: any) {
    console.error("[API /dashboard] Error:", err);
    return NextResponse.json(
      { error: "Failed to load dashboard data: " + err.message },
      { status: 500 }
    );
  }
}
