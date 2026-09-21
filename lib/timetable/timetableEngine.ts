import {
  DayOfWeek,
  TimetableSlot,
  AcademicCalendarEvent,
} from "@/types";
import {
  getRemainingTeachingDays,
  isDateHoliday,
  isDateExamPeriod,
  DAY_MAP,
} from "../calendar/calendarEngine";
import { addDays, getDay, format, startOfDay } from "date-fns";

/**
 * Calculates the exact number of remaining scheduled classes for each subject
 * by combining:
 * 1. Current Date
 * 2. Semester End Date
 * 3. Weekly Timetable
 * 4. Academic Calendar Holidays & Exam periods
 */
export function calculateDateAwareRemainingClasses(params: {
  currentDate: Date;
  semesterEndDate: Date;
  timetable: TimetableSlot[];
  academicEvents: AcademicCalendarEvent[];
}): Record<string, number> {
  const { currentDate, semesterEndDate, timetable, academicEvents } = params;

  // 1. Get all actual valid teaching days from tomorrow until semester end
  const futureStartDate = addDays(startOfDay(currentDate), 1);
  const teachingDays = getRemainingTeachingDays(
    futureStartDate,
    semesterEndDate,
    academicEvents
  );

  // 2. Count occurrences of each subject on those teaching days
  const subjectClassCounts: Record<string, number> = {};

  for (const day of teachingDays) {
    // Find all timetable slots matching this day of week
    const slots = timetable.filter((slot) => slot.dayOfWeek === day.dayOfWeek);
    for (const slot of slots) {
      subjectClassCounts[slot.subjectId] =
        (subjectClassCounts[slot.subjectId] || 0) + 1;
    }
  }

  return subjectClassCounts;
}

/**
 * Gets tomorrow's scheduled classes taking into account holidays and exams.
 */
export function getTomorrowSchedule(params: {
  referenceDate?: Date;
  timetable: TimetableSlot[];
  academicEvents: AcademicCalendarEvent[];
}): {
  date: string;
  dayOfWeek: DayOfWeek;
  isHoliday: boolean;
  isExam: boolean;
  specialEventTitle?: string;
  slots: TimetableSlot[];
} {
  const ref = params.referenceDate || new Date();
  const tomorrow = addDays(startOfDay(ref), 1);
  const dayOfWeek = DAY_MAP[getDay(tomorrow)];
  const dateStr = format(tomorrow, "yyyy-MM-dd");

  const holidayCheck = isDateHoliday(tomorrow, params.academicEvents);
  if (holidayCheck.isHoliday) {
    return {
      date: dateStr,
      dayOfWeek,
      isHoliday: true,
      isExam: false,
      specialEventTitle: holidayCheck.eventTitle,
      slots: [],
    };
  }

  const examCheck = isDateExamPeriod(tomorrow, params.academicEvents);
  if (examCheck.isExam) {
    return {
      date: dateStr,
      dayOfWeek,
      isHoliday: false,
      isExam: true,
      specialEventTitle: examCheck.eventTitle,
      slots: [],
    };
  }

  const slots = params.timetable
    .filter((slot) => slot.dayOfWeek === dayOfWeek)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return {
    date: dateStr,
    dayOfWeek,
    isHoliday: false,
    isExam: false,
    slots,
  };
}

/**
 * Gets today's scheduled classes taking into account holidays and exams.
 */
export function getTodaySchedule(params: {
  referenceDate?: Date;
  timetable: TimetableSlot[];
  academicEvents: AcademicCalendarEvent[];
}): {
  date: string;
  dayOfWeek: DayOfWeek;
  isHoliday: boolean;
  isExam: boolean;
  specialEventTitle?: string;
  slots: TimetableSlot[];
} {
  const ref = params.referenceDate || new Date();
  const today = startOfDay(ref);
  const dayOfWeek = DAY_MAP[getDay(today)];
  const dateStr = format(today, "yyyy-MM-dd");

  const holidayCheck = isDateHoliday(today, params.academicEvents);
  if (holidayCheck.isHoliday) {
    return {
      date: dateStr,
      dayOfWeek,
      isHoliday: true,
      isExam: false,
      specialEventTitle: holidayCheck.eventTitle,
      slots: [],
    };
  }

  const examCheck = isDateExamPeriod(today, params.academicEvents);
  if (examCheck.isExam) {
    return {
      date: dateStr,
      dayOfWeek,
      isHoliday: false,
      isExam: true,
      specialEventTitle: examCheck.eventTitle,
      slots: [],
    };
  }

  const slots = params.timetable
    .filter((slot) => slot.dayOfWeek === dayOfWeek)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return {
    date: dateStr,
    dayOfWeek,
    isHoliday: false,
    isExam: false,
    slots,
  };
}
