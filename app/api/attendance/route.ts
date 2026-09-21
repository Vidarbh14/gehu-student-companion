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
      room: t.room || undefined,
      faculty: t.faculty || undefined,
      classType: (t.classType as any) || "THEORY",
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
    const effectiveTarget = getEffectiveTarget(targetPercentage, safetyBuffer);

    let userSubjects = user.subjects || [];
    if (userSubjects.length === 0) {
      const defaultSubjects = [
        { code: "TCS-301", name: "Data Structures & Algorithms", credits: 4, type: "THEORY", color: "#0c81eb", conducted: 35, attended: 30 },
        { code: "TCS-302", name: "Discrete Mathematics & Graph Theory", credits: 4, type: "THEORY", color: "#8b5cf6", conducted: 32, attended: 26 },
        { code: "TCS-303", name: "Operating Systems Principles", credits: 4, type: "THEORY", color: "#10b981", conducted: 30, attended: 27 },
        { code: "TEC-301", name: "Digital Electronics & Logic Design", credits: 3, type: "THEORY", color: "#ef4444", conducted: 28, attended: 20 },
        { code: "TCS-304", name: "Computer Organization & Architecture", credits: 3, type: "THEORY", color: "#f59e0b", conducted: 28, attended: 22 },
        { code: "PCS-301", name: "Data Structures Laboratory", credits: 1, type: "LAB", color: "#06b6d4", conducted: 10, attended: 9 },
        { code: "PEC-301", name: "Digital Electronics Laboratory", credits: 1, type: "LAB", color: "#14b8a6", conducted: 10, attended: 8 },
        { code: "PCS-303", name: "Operating Systems Laboratory", credits: 1, type: "LAB", color: "#6366f1", conducted: 10, attended: 9 },
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
    let theoryAttended = 0;
    let theoryConducted = 0;
    let labAttended = 0;
    let labConducted = 0;

    const subjects = userSubjects.map((s: any) => {
      const att = s.attendance?.attended ?? 0;
      const cond = s.attendance?.conducted ?? 0;
      const isLab =
        s.type === "LAB" ||
        s.code.toUpperCase().startsWith("P") ||
        s.name.toLowerCase().includes("lab") ||
        s.name.toLowerCase().includes("practical");

      totalAttended += att;
      totalConducted += cond;

      if (isLab) {
        labAttended += att;
        labConducted += cond;
      } else {
        theoryAttended += att;
        theoryConducted += cond;
      }

      return calculateSubjectMetrics({
        subjectId: s.id,
        subjectCode: s.code,
        subjectName: s.name,
        credits: s.credits,
        type: isLab ? "LAB" : "THEORY",
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

    const theoryPercentage = calculateAttendancePercentage(
      theoryAttended,
      theoryConducted
    );
    const theoryStatus = determineAttendanceStatus(
      theoryPercentage,
      targetPercentage,
      safetyBuffer
    );

    const labPercentage = calculateAttendancePercentage(
      labAttended,
      labConducted
    );
    const labStatus = determineAttendanceStatus(
      labPercentage,
      targetPercentage,
      safetyBuffer
    );

    return NextResponse.json({
      success: true,
      target: {
        targetPercentage,
        safetyBuffer,
        effectiveTarget,
      },
      overall: {
        attended: totalAttended,
        conducted: totalConducted,
        percentage: overallPercentage,
        status: overallStatus,
        canMiss: Math.max(
          0,
          Math.floor(totalAttended / (effectiveTarget / 100) - totalConducted)
        ),
      },
      theory: {
        attended: theoryAttended,
        conducted: theoryConducted,
        percentage: theoryPercentage,
        status: theoryStatus,
        canMiss: Math.max(
          0,
          Math.floor(theoryAttended / (effectiveTarget / 100) - theoryConducted)
        ),
        count: subjects.filter((s: any) => s.type !== "LAB").length,
      },
      labs: {
        attended: labAttended,
        conducted: labConducted,
        percentage: labPercentage,
        status: labStatus,
        canMiss: Math.max(
          0,
          Math.floor(labAttended / (effectiveTarget / 100) - labConducted)
        ),
        count: subjects.filter((s: any) => s.type === "LAB").length,
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
    const user = await getAuthenticatedStudent();

    if (!user) {
      return NextResponse.json(
        { error: "Please log in first.", unauthenticated: true },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      action,
      subjectId,
      targetPercentage,
      safetyBuffer,
      conducted,
      attended,
      code,
      name,
      credits,
      type,
      color,
      initialAttended,
      initialConducted,
    } = body;

    // 1. Update Attendance Target
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

    // 3. Full Update / Rename of Subject
    if (action === "updateSubject" && subjectId) {
      const validConducted = Math.max(0, parseInt(conducted, 10) || 0);
      const validAttended = Math.min(
        validConducted,
        Math.max(0, parseInt(attended, 10) || 0)
      );

      const isLab =
        type === "LAB" ||
        (code && code.toUpperCase().startsWith("P")) ||
        (name && name.toLowerCase().includes("lab"));

      const updatedSub = await prisma.subject.update({
        where: { id: subjectId },
        data: {
          name: name ? name.trim() : undefined,
          code: code ? code.trim().toUpperCase() : undefined,
          type: isLab ? "LAB" : "THEORY",
          credits: parseInt(credits, 10) || (isLab ? 1 : 4),
          color: color || (isLab ? "#06b6d4" : "#0c81eb"),
        },
      });

      const updatedRecord = await prisma.attendanceRecord.upsert({
        where: { subjectId },
        update: {
          conducted: validConducted,
          attended: validAttended,
          lastUpdated: new Date(),
          source: "MANUAL",
        },
        create: {
          subjectId,
          conducted: validConducted,
          attended: validAttended,
          source: "MANUAL",
        },
      });

      return NextResponse.json({
        success: true,
        subject: { ...updatedSub, attendance: updatedRecord },
      });
    }

    // 4. Delete Subject
    if (action === "deleteSubject" && subjectId) {
      await prisma.attendanceRecord.deleteMany({ where: { subjectId } });
      await prisma.timetableEntry.deleteMany({ where: { subjectId } });
      await prisma.subject.delete({ where: { id: subjectId } });
      return NextResponse.json({ success: true, message: "Subject deleted." });
    }

    // 5. Add new subject (Theory or Lab)
    if (action === "createSubject") {
      const isLab =
        type === "LAB" ||
        (code && code.toUpperCase().startsWith("P")) ||
        (name && name.toLowerCase().includes("lab"));

      const newSubject = await prisma.subject.create({
        data: {
          userId: user.id,
          code: (code || "TCS-101").trim().toUpperCase(),
          name: (name || "New Subject").trim(),
          credits: parseInt(credits, 10) || (isLab ? 1 : 4),
          type: isLab ? "LAB" : "THEORY",
          color: color || (isLab ? "#06b6d4" : "#0c81eb"),
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

    // 6. Load Official GEHU Semester Curriculum (Theory + Labs)
    if (action === "loadCurriculum") {
      const sem = body.semester || user.profile?.semester || "III";

      const curriculumMap: Record<
        string,
        Array<{
          code: string;
          name: string;
          credits: number;
          type: string;
          color: string;
          conducted: number;
          attended: number;
        }>
      > = {
        I: [
          { code: "TMA-101", name: "Engineering Mathematics I", credits: 4, type: "THEORY", color: "#0c81eb", conducted: 32, attended: 28 },
          { code: "TPH-101", name: "Engineering Physics", credits: 4, type: "THEORY", color: "#8b5cf6", conducted: 30, attended: 26 },
          { code: "TEE-101", name: "Basic Electrical Engineering", credits: 3, type: "THEORY", color: "#10b981", conducted: 28, attended: 24 },
          { code: "TCS-101", name: "Programming for Problem Solving", credits: 3, type: "THEORY", color: "#f59e0b", conducted: 30, attended: 27 },
          { code: "PPH-101", name: "Engineering Physics Laboratory", credits: 1, type: "LAB", color: "#06b6d4", conducted: 10, attended: 9 },
          { code: "PEE-101", name: "Basic Electrical Laboratory", credits: 1, type: "LAB", color: "#14b8a6", conducted: 10, attended: 9 },
          { code: "PCS-101", name: "Programming Lab in C", credits: 1, type: "LAB", color: "#6366f1", conducted: 10, attended: 10 },
        ],
        II: [
          { code: "TMA-201", name: "Engineering Mathematics II", credits: 4, type: "THEORY", color: "#0c81eb", conducted: 32, attended: 27 },
          { code: "TCY-201", name: "Engineering Chemistry", credits: 4, type: "THEORY", color: "#8b5cf6", conducted: 30, attended: 25 },
          { code: "TEC-201", name: "Basic Electronics Engineering", credits: 3, type: "THEORY", color: "#10b981", conducted: 28, attended: 23 },
          { code: "TEV-201", name: "Environmental Studies", credits: 2, type: "THEORY", color: "#f59e0b", conducted: 20, attended: 18 },
          { code: "PCY-201", name: "Engineering Chemistry Laboratory", credits: 1, type: "LAB", color: "#06b6d4", conducted: 10, attended: 9 },
          { code: "PEC-201", name: "Basic Electronics Laboratory", credits: 1, type: "LAB", color: "#14b8a6", conducted: 10, attended: 8 },
          { code: "PWS-201", name: "Engineering Workshop Practice", credits: 1, type: "LAB", color: "#6366f1", conducted: 10, attended: 9 },
        ],
        III: [
          { code: "TCS-301", name: "Data Structures & Algorithms", credits: 4, type: "THEORY", color: "#0c81eb", conducted: 35, attended: 30 },
          { code: "TCS-302", name: "Discrete Mathematics & Graph Theory", credits: 4, type: "THEORY", color: "#8b5cf6", conducted: 32, attended: 26 },
          { code: "TCS-303", name: "Operating Systems Principles", credits: 4, type: "THEORY", color: "#10b981", conducted: 30, attended: 27 },
          { code: "TEC-301", name: "Digital Electronics & Logic Design", credits: 3, type: "THEORY", color: "#ef4444", conducted: 28, attended: 20 },
          { code: "TCS-304", name: "Computer Organization & Architecture", credits: 3, type: "THEORY", color: "#f59e0b", conducted: 28, attended: 22 },
          { code: "PCS-301", name: "Data Structures Laboratory", credits: 1, type: "LAB", color: "#06b6d4", conducted: 10, attended: 9 },
          { code: "PEC-301", name: "Digital Electronics Laboratory", credits: 1, type: "LAB", color: "#14b8a6", conducted: 10, attended: 8 },
          { code: "PCS-303", name: "Operating Systems Laboratory", credits: 1, type: "LAB", color: "#6366f1", conducted: 10, attended: 9 },
        ],
        IV: [
          { code: "TCS-401", name: "Design & Analysis of Algorithms", credits: 4, type: "THEORY", color: "#0c81eb", conducted: 32, attended: 27 },
          { code: "TCS-402", name: "Theory of Automata & Formal Languages", credits: 4, type: "THEORY", color: "#8b5cf6", conducted: 30, attended: 25 },
          { code: "TCS-403", name: "Object Oriented Programming Java", credits: 3, type: "THEORY", color: "#10b981", conducted: 30, attended: 26 },
          { code: "TEC-401", name: "Microprocessors & Microcontrollers", credits: 3, type: "THEORY", color: "#ef4444", conducted: 28, attended: 22 },
          { code: "PCS-401", name: "Algorithms Laboratory", credits: 1, type: "LAB", color: "#06b6d4", conducted: 10, attended: 9 },
          { code: "PCS-403", name: "Java Programming Laboratory", credits: 1, type: "LAB", color: "#14b8a6", conducted: 10, attended: 9 },
          { code: "PEC-401", name: "Microprocessor Laboratory", credits: 1, type: "LAB", color: "#6366f1", conducted: 10, attended: 8 },
        ],
        V: [
          { code: "TCS-501", name: "Database Management Systems", credits: 4, type: "THEORY", color: "#0c81eb", conducted: 34, attended: 29 },
          { code: "TCS-502", name: "Computer Networks Principles", credits: 4, type: "THEORY", color: "#8b5cf6", conducted: 32, attended: 26 },
          { code: "TCS-503", name: "Software Engineering & Testing", credits: 3, type: "THEORY", color: "#10b981", conducted: 28, attended: 24 },
          { code: "TCS-504", name: "Advanced Web Technologies", credits: 3, type: "THEORY", color: "#f59e0b", conducted: 28, attended: 23 },
          { code: "PCS-501", name: "DBMS Laboratory", credits: 1, type: "LAB", color: "#06b6d4", conducted: 10, attended: 9 },
          { code: "PCS-502", name: "Computer Networks Laboratory", credits: 1, type: "LAB", color: "#14b8a6", conducted: 10, attended: 9 },
          { code: "PCS-504", name: "Web Technologies Laboratory", credits: 1, type: "LAB", color: "#6366f1", conducted: 10, attended: 8 },
        ],
        VI: [
          { code: "TCS-601", name: "Compiler Design Principles", credits: 4, type: "THEORY", color: "#0c81eb", conducted: 32, attended: 26 },
          { code: "TCS-602", name: "Cloud Computing & DevOps", credits: 4, type: "THEORY", color: "#8b5cf6", conducted: 30, attended: 25 },
          { code: "TCS-603", name: "Machine Learning Foundations", credits: 3, type: "THEORY", color: "#10b981", conducted: 28, attended: 24 },
          { code: "PCS-601", name: "Compiler Design Laboratory", credits: 1, type: "LAB", color: "#06b6d4", conducted: 10, attended: 8 },
          { code: "PCS-602", name: "Cloud & DevOps Laboratory", credits: 1, type: "LAB", color: "#14b8a6", conducted: 10, attended: 9 },
          { code: "PCS-603", name: "Machine Learning Laboratory", credits: 1, type: "LAB", color: "#6366f1", conducted: 10, attended: 9 },
        ],
      };

      const semSubjects = curriculumMap[sem] || curriculumMap["III"];

      if (body.replaceExisting) {
        await prisma.attendanceRecord.deleteMany({
          where: { subject: { userId: user.id } },
        });
        await prisma.timetableEntry.deleteMany({ where: { userId: user.id } });
        await prisma.subject.deleteMany({ where: { userId: user.id } });
      }

      for (const s of semSubjects) {
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

      return NextResponse.json({
        success: true,
        message: `Loaded GEHU Semester ${sem} official curriculum.`,
      });
    }

    // 7. Seed default semester subjects
    if (action === "seedDefaultSubjects") {
      const defaultSubjects = [
        { code: "TCS-301", name: "Data Structures & Algorithms", credits: 4, type: "THEORY", color: "#0c81eb", conducted: 35, attended: 30 },
        { code: "TCS-302", name: "Discrete Mathematics & Graph Theory", credits: 4, type: "THEORY", color: "#8b5cf6", conducted: 32, attended: 26 },
        { code: "TCS-303", name: "Operating Systems Principles", credits: 4, type: "THEORY", color: "#10b981", conducted: 30, attended: 27 },
        { code: "TEC-301", name: "Digital Electronics & Logic Design", credits: 3, type: "THEORY", color: "#ef4444", conducted: 28, attended: 20 },
        { code: "TCS-304", name: "Computer Organization & Architecture", credits: 3, type: "THEORY", color: "#f59e0b", conducted: 28, attended: 22 },
        { code: "PCS-301", name: "Data Structures Laboratory", credits: 1, type: "LAB", color: "#06b6d4", conducted: 10, attended: 9 },
        { code: "PEC-301", name: "Digital Electronics Laboratory", credits: 1, type: "LAB", color: "#14b8a6", conducted: 10, attended: 8 },
        { code: "PCS-303", name: "Operating Systems Laboratory", credits: 1, type: "LAB", color: "#6366f1", conducted: 10, attended: 9 },
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
      return NextResponse.json({
        success: true,
        message: "Standard semester subjects and labs loaded.",
      });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to update attendance: " + err.message },
      { status: 500 }
    );
  }
}
