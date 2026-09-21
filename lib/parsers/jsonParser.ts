import { z } from "zod";

const AttendanceItemSchema = z.object({
  subjectCode: z.string(),
  subjectName: z.string(),
  conducted: z.number().int().nonnegative(),
  attended: z.number().int().nonnegative(),
  credits: z.number().optional().default(4),
});

const TimetableItemSchema = z.object({
  dayOfWeek: z.enum([
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
  ]),
  startTime: z.string(),
  endTime: z.string(),
  subjectCode: z.string(),
  subjectName: z.string(),
  room: z.string().optional(),
  faculty: z.string().optional(),
  classType: z.enum(["THEORY", "LAB"]).optional().default("THEORY"),
});

export function parseAcademicJSON(jsonContent: string) {
  try {
    const raw = JSON.parse(jsonContent);

    const attendanceParsed = Array.isArray(raw.attendance)
      ? raw.attendance
          .map((item: any) => {
            const res = AttendanceItemSchema.safeParse(item);
            return res.success ? res.data : null;
          })
          .filter(Boolean)
      : [];

    const timetableParsed = Array.isArray(raw.timetable)
      ? raw.timetable
          .map((item: any) => {
            const res = TimetableItemSchema.safeParse(item);
            return res.success ? res.data : null;
          })
          .filter(Boolean)
      : [];

    return {
      success: true,
      attendance: attendanceParsed,
      timetable: timetableParsed,
    };
  } catch (err: any) {
    return {
      success: false,
      error: `Invalid JSON syntax: ${err.message}`,
      attendance: [],
      timetable: [],
    };
  }
}
