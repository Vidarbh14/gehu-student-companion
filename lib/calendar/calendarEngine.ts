import { AcademicCalendarEvent, DayOfWeek } from "@/types";
import {
  parseISO,
  isWithinInterval,
  addDays,
  format,
  isBefore,
  isAfter,
  startOfDay,
  getDay,
} from "date-fns";

export const DAY_MAP: Record<number, DayOfWeek> = {
  0: "SUNDAY",
  1: "MONDAY",
  2: "TUESDAY",
  3: "WEDNESDAY",
  4: "THURSDAY",
  5: "FRIDAY",
  6: "SATURDAY",
};

/**
 * Checks if a given date is marked as a holiday in the academic calendar.
 */
export function isDateHoliday(
  date: Date,
  events: AcademicCalendarEvent[]
): { isHoliday: boolean; eventTitle?: string } {
  const checkDate = startOfDay(date);

  for (const event of events) {
    if (event.type === "HOLIDAY" || event.type === "SEMESTER_BREAK") {
      const start = startOfDay(parseISO(event.startDate));
      const end = startOfDay(parseISO(event.endDate));
      if (isWithinInterval(checkDate, { start, end })) {
        return { isHoliday: true, eventTitle: event.title };
      }
    }
  }

  // Sundays are always non-teaching days
  if (getDay(date) === 0) {
    return { isHoliday: true, eventTitle: "Sunday (Non-teaching Day)" };
  }

  return { isHoliday: false };
}

/**
 * Checks if a given date falls inside an examination window (End-Sem, Mid-Sem, etc.)
 */
export function isDateExamPeriod(
  date: Date,
  events: AcademicCalendarEvent[]
): { isExam: boolean; eventTitle?: string } {
  const checkDate = startOfDay(date);

  for (const event of events) {
    if (
      event.type === "END_SEM" ||
      event.type === "MID_SEM" ||
      event.type === "PRACTICAL_EXAM" ||
      event.type === "THEORY_EXAM"
    ) {
      const start = startOfDay(parseISO(event.startDate));
      const end = startOfDay(parseISO(event.endDate));
      if (isWithinInterval(checkDate, { start, end })) {
        return { isExam: true, eventTitle: event.title };
      }
    }
  }

  return { isExam: false };
}

/**
 * Checks if a given date is an active teaching day.
 * Must NOT be a holiday and must NOT be an exam period.
 */
export function isTeachingDay(
  date: Date,
  events: AcademicCalendarEvent[]
): boolean {
  const { isHoliday } = isDateHoliday(date, events);
  if (isHoliday) return false;

  const { isExam } = isDateExamPeriod(date, events);
  if (isExam) return false;

  return true;
}

/**
 * Generates all remaining scheduled class dates between today and the semester end date,
 * respecting holidays and exam suspensions.
 */
export function getRemainingTeachingDays(
  startDate: Date,
  semesterEndDate: Date,
  events: AcademicCalendarEvent[]
): Array<{ date: Date; dateStr: string; dayOfWeek: DayOfWeek }> {
  const teachingDays: Array<{
    date: Date;
    dateStr: string;
    dayOfWeek: DayOfWeek;
  }> = [];
  let current = startOfDay(startDate);
  const end = startOfDay(semesterEndDate);

  while (!isAfter(current, end)) {
    if (isTeachingDay(current, events)) {
      const dayNum = getDay(current);
      teachingDays.push({
        date: new Date(current),
        dateStr: format(current, "yyyy-MM-dd"),
        dayOfWeek: DAY_MAP[dayNum],
      });
    }
    current = addDays(current, 1);
  }

  return teachingDays;
}
