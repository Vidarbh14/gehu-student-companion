import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { parseAttendanceCSV, parseTimetableCSV } from "@/lib/parsers/csvParser";
import { parseAcademicJSON } from "@/lib/parsers/jsonParser";
import { processExtractedOCRText } from "@/lib/parsers/ocrParser";
import { getAuthenticatedStudent } from "@/lib/auth/session";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, content, confirmedRecords } = body;

    const user = await getAuthenticatedStudent();

    if (!user) {
      return NextResponse.json(
        { error: "Please log in with your Student ID before importing records.", unauthenticated: true },
        { status: 401 }
      );
    }

    // 1. Process OCR text extraction & verification
    if (type === "OCR_EXTRACT") {
      const ocrResult = processExtractedOCRText(content || "");
      return NextResponse.json(ocrResult);
    }

    // 2. Commit verified OCR records to database
    if (type === "OCR_COMMIT" && Array.isArray(confirmedRecords)) {
      let updatedCount = 0;
      for (const rec of confirmedRecords) {
        // Find or create subject
        let subject = await prisma.subject.findFirst({
          where: { userId: user.id, code: rec.subjectCode },
        });

        if (!subject) {
          subject = await prisma.subject.create({
            data: {
              userId: user.id,
              code: rec.subjectCode,
              name: rec.subjectName || rec.subjectCode,
              attendance: {
                create: {
                  attended: rec.attended,
                  conducted: rec.conducted,
                  source: "OCR",
                  notes: `Extracted via OCR screenshot verification (${Math.round(
                    rec.confidence * 100
                  )}% confidence)`,
                },
              },
            },
          });
          updatedCount++;
        } else {
          await prisma.attendanceRecord.upsert({
            where: { subjectId: subject.id },
            update: {
              attended: rec.attended,
              conducted: rec.conducted,
              source: "OCR",
              lastUpdated: new Date(),
            },
            create: {
              subjectId: subject.id,
              attended: rec.attended,
              conducted: rec.conducted,
              source: "OCR",
            },
          });
          updatedCount++;
        }
      }

      return NextResponse.json({
        success: true,
        message: `Successfully verified and imported ${updatedCount} subject records.`,
      });
    }

    // 3. CSV Attendance import
    if (type === "CSV_ATTENDANCE") {
      const rows = parseAttendanceCSV(content || "");
      let importedCount = 0;
      for (const row of rows) {
        let subject = await prisma.subject.findFirst({
          where: { userId: user.id, code: row.subjectCode },
        });

        if (!subject) {
          subject = await prisma.subject.create({
            data: {
              userId: user.id,
              code: row.subjectCode,
              name: row.subjectName,
              attendance: {
                create: {
                  attended: row.attended,
                  conducted: row.conducted,
                  source: "IMPORT",
                },
              },
            },
          });
        } else {
          await prisma.attendanceRecord.upsert({
            where: { subjectId: subject.id },
            update: {
              attended: row.attended,
              conducted: row.conducted,
              source: "IMPORT",
              lastUpdated: new Date(),
            },
            create: {
              subjectId: subject.id,
              attended: row.attended,
              conducted: row.conducted,
              source: "IMPORT",
            },
          });
        }
        importedCount++;
      }
      return NextResponse.json({
        success: true,
        message: `Imported ${importedCount} subjects from CSV.`,
      });
    }

    // 4. CSV Timetable import
    if (type === "CSV_TIMETABLE") {
      const rows = parseTimetableCSV(content || "");
      let importedSlots = 0;
      for (const row of rows) {
        let subject = await prisma.subject.findFirst({
          where: { userId: user.id, code: row.subjectCode },
        });

        if (!subject) {
          subject = await prisma.subject.create({
            data: {
              userId: user.id,
              code: row.subjectCode,
              name: row.subjectName,
              attendance: {
                create: { attended: 0, conducted: 0, source: "IMPORT" },
              },
            },
          });
        }

        await prisma.timetableEntry.create({
          data: {
            userId: user.id,
            subjectId: subject.id,
            dayOfWeek: row.dayOfWeek,
            startTime: row.startTime,
            endTime: row.endTime,
            room: row.room,
            faculty: row.faculty,
            classType: row.classType || "THEORY",
          },
        });
        importedSlots++;
      }
      return NextResponse.json({
        success: true,
        message: `Imported ${importedSlots} timetable slots from CSV.`,
      });
    }

    // 5. JSON Import
    if (type === "JSON") {
      const parsed = parseAcademicJSON(content || "{}");
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error }, { status: 400 });
      }

      let attCount = 0;
      let slotCount = 0;

      for (const att of parsed.attendance) {
        let subject = await prisma.subject.findFirst({
          where: { userId: user.id, code: att.subjectCode },
        });

        if (!subject) {
          subject = await prisma.subject.create({
            data: {
              userId: user.id,
              code: att.subjectCode,
              name: att.subjectName,
              credits: att.credits,
              attendance: {
                create: {
                  attended: att.attended,
                  conducted: att.conducted,
                  source: "IMPORT",
                },
              },
            },
          });
        } else {
          await prisma.attendanceRecord.upsert({
            where: { subjectId: subject.id },
            update: {
              attended: att.attended,
              conducted: att.conducted,
              source: "IMPORT",
              lastUpdated: new Date(),
            },
            create: {
              subjectId: subject.id,
              attended: att.attended,
              conducted: att.conducted,
              source: "IMPORT",
            },
          });
        }
        attCount++;
      }

      for (const slot of parsed.timetable) {
        let subject = await prisma.subject.findFirst({
          where: { userId: user.id, code: slot.subjectCode },
        });

        if (subject) {
          await prisma.timetableEntry.create({
            data: {
              userId: user.id,
              subjectId: subject.id,
              dayOfWeek: slot.dayOfWeek,
              startTime: slot.startTime,
              endTime: slot.endTime,
              room: slot.room,
              faculty: slot.faculty,
              classType: slot.classType,
            },
          });
          slotCount++;
        }
      }

      return NextResponse.json({
        success: true,
        message: `Imported ${attCount} subjects and ${slotCount} timetable slots.`,
      });
    }

    return NextResponse.json({ error: "Unsupported import type." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Import processing failed: " + err.message },
      { status: 500 }
    );
  }
}
