import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import {
  calculateAttendancePercentage,
  getEffectiveTarget,
  determineAttendanceStatus,
  calculateSubjectMetrics,
} from "@/lib/attendance/attendanceEngine";
import { calculateDateAwareRemainingClasses } from "@/lib/timetable/timetableEngine";
import { AcademicCalendarEvent, TimetableSlot } from "@/types";

import { getAuthenticatedStudent } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getAuthenticatedStudent();

    if (!user) {
      return NextResponse.json(
        { error: "Please log in to view your attendance.", unauthenticated: true },
        { status: 401 }
      );
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

    const semesterEndDate = new Date("2026-12-24");
    const remainingClassesMap = calculateDateAwareRemainingClasses({
      currentDate: new Date(),
      semesterEndDate,
      timetable: timetableSlots,
      academicEvents,
    });

    const targetPercentage = user.target?.targetPercentage ?? 75.0;
    const safetyBuffer = user.target?.safetyBuffer ?? 2.0;

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

    const subjects = userSubjects.map((s: any) => {
      const att = s.attendance?.attended ?? 0;
      const cond = s.attendance?.conducted ?? 0;
      totalAttended += att;
      totalConducted += cond;

      return calculateSubjectMetrics({
        subjectId: s.id,
        subjectCode: s.code,
        subjectName: s.name,
        credits: s.credits,
        type: (s.type as any) || "THEORY",
        color: s.color,
        attended: att,
        conducted: cond,
        remainingClasses: remainingClassesMap[s.id] ?? 18,
        targetPercentage,
        safetyBuffer,
      });
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

    return NextResponse.json({
      success: true,
      target: {
        targetPercentage,
        safetyBuffer,
        effectiveTarget: getEffectiveTarget(targetPercentage, safetyBuffer),
      },
      overall: {
        attended: totalAttended,
        conducted: totalConducted,
        percentage: overallPercentage,
        status: overallStatus,
        canMiss: Math.max(
          0,
          Math.floor(
            totalAttended / ((targetPercentage + safetyBuffer) / 100) -
              totalConducted
          )
        ),
      },
      subjects,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to fetch attendance: " + err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, subjectId, attended, conducted, targetPercentage, safetyBuffer } =
      body;

    const user = await getAuthenticatedStudent();

    if (!user) {
      return NextResponse.json({ error: "Please log in first.", unauthenticated: true }, { status: 401 });
    }

    // 1. Update target and buffer settings
    if (action === "updateTarget") {
      const updatedTarget = await prisma.attendanceTarget.upsert({
        where: { userId: user.id },
        update: {
          targetPercentage: parseFloat(targetPercentage) || 75.0,
          safetyBuffer: parseFloat(safetyBuffer) || 2.0,
        },
        create: {
          userId: user.id,
          targetPercentage: parseFloat(targetPercentage) || 75.0,
          safetyBuffer: parseFloat(safetyBuffer) || 2.0,
        },
      });
      return NextResponse.json({ success: true, target: updatedTarget });
    }

    // 2. Mark attendance (+1 attended / +1 absent)
    if (action === "quickMark" && subjectId) {
      const isPresent = body.isPresent === true;
      const existing = await prisma.attendanceRecord.findUnique({
        where: { subjectId },
      });

      if (!existing) {
        return NextResponse.json(
          { error: "Subject attendance record not found." },
          { status: 404 }
        );
      }

      const updated = await prisma.attendanceRecord.update({
        where: { subjectId },
        data: {
          conducted: existing.conducted + 1,
          attended: existing.attended + (isPresent ? 1 : 0),
          lastUpdated: new Date(),
        },
      });

      return NextResponse.json({ success: true, record: updated });
    }

    // 3. Manual full update of subject attendance
    if (action === "updateSubjectAttendance" && subjectId) {
      const validConducted = Math.max(0, parseInt(conducted, 10) || 0);
      const validAttended = Math.min(
        validConducted,
        Math.max(0, parseInt(attended, 10) || 0)
      );

      const updated = await prisma.attendanceRecord.update({
        where: { subjectId },
        data: {
          conducted: validConducted,
          attended: validAttended,
          lastUpdated: new Date(),
          source: "MANUAL",
        },
      });

      return NextResponse.json({ success: true, record: updated });
    }

    // 4. Add new subject
    if (action === "createSubject") {
      const { code, name, credits, type, color, initialAttended, initialConducted } =
        body;
      const newSubject = await prisma.subject.create({
        data: {
          userId: user.id,
          code: code || "TCS-999",
          name: name || "New Subject",
          credits: parseInt(credits, 10) || 3,
          type: type || "THEORY",
          color: color || "#0c81eb",
          attendance: {
            create: {
              attended: parseInt(initialAttended, 10) || 0,
              conducted: parseInt(initialConducted, 10) || 0,
              source: "MANUAL",
            },
          },
        },
        include: { attendance: true },
      });

      return NextResponse.json({ success: true, subject: newSubject });
    }

    // 5. Seed default semester subjects
    if (action === "seedDefaultSubjects") {
      const defaultSubjects = [
        { code: "TCS-301", name: "Data Structures & Algorithms", credits: 4, type: "THEORY", color: "#0c81eb", conducted: 35, attended: 30 },
        { code: "TCS-302", name: "Discrete Mathematics & Graph Theory", credits: 4, type: "THEORY", color: "#8b5cf6", conducted: 32, attended: 26 },
        { code: "TCS-303", name: "Operating Systems Principles", credits: 4, type: "THEORY", color: "#10b981", conducted: 30, attended: 27 },
        { code: "TEC-301", name: "Digital Electronics & Logic Design", credits: 3, type: "THEORY", color: "#ef4444", conducted: 28, attended: 20 },
        { code: "TCS-304", name: "Computer Organization & Architecture", credits: 3, type: "THEORY", color: "#f59e0b", conducted: 28, attended: 22 },
        { code: "PCS-301", name: "Data Structures Laboratory", credits: 1, type: "LAB", color: "#06b6d4", conducted: 10, attended: 9 },
      ];

      for (const s of defaultSubjects) {
        const existing = await prisma.subject.findFirst({
          where: { userId: user.id, code: s.code },
        });
        if (!existing) {
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
      }
      return NextResponse.json({ success: true, message: "Standard semester subjects loaded." });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to update attendance: " + err.message },
      { status: 500 }
    );
  }
}
