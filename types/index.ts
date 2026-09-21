export type AttendanceStatus = "SAFE" | "WATCH" | "RISK" | "CRITICAL";

export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export interface AttendanceMetrics {
  attended: number;
  conducted: number;
  currentPercentage: number;
  targetPercentage: number;
  safetyBuffer: number;
  effectiveTarget: number;
  status: AttendanceStatus;
  maxAbsencesAllowed: number; // Maximum classes that can be missed right now without dropping below effective target
  recoveryClassesNeeded: number; // Classes to attend consecutively if below target
  projectedPercentage?: number;
}

export interface SubjectAttendanceInfo extends AttendanceMetrics {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  credits: number;
  type: "THEORY" | "LAB" | "PRACTICAL";
  color: string;
  remainingScheduledClasses: number;
  maxFutureAbsences: number; // Out of remaining scheduled classes
  projectedIfMissAllAllowed: number;
  projectedIfAttendAllRemaining: number;
  statusDetails: string;
}

export interface MissTomorrowSubjectEvaluation {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  scheduledSlots: number;
  currentPercentage: number;
  percentageIfMissed: number;
  canMiss: boolean;
  reason: string;
  statusBefore: AttendanceStatus;
  statusAfter: AttendanceStatus;
}

export interface MissTomorrowResult {
  date: string; // ISO format YYYY-MM-DD
  dayOfWeek: DayOfWeek;
  totalClassesScheduled: number;
  canSafelyMissAll: boolean;
  verdict: "SAFE_TO_MISS" | "PARTIAL_RISK" | "CANNOT_MISS" | "NO_CLASSES";
  summary: string;
  subjects: MissTomorrowSubjectEvaluation[];
  overallProjectedPercentageIfMissed: number;
}

export interface AttendanceForecastPoint {
  date: string; // YYYY-MM-DD
  classIndex: number;
  subjectName?: string;
  ifAttendAll: number;
  ifMissOneNext: number;
  ifMissTwoNext: number;
  targetLine: number;
}

export interface AttendanceRecoveryPlan {
  subjectId: string;
  subjectName: string;
  currentPercentage: number;
  targetPercentage: number;
  classesRequiredWithoutAbsence: number;
  estimatedRecoveryDate?: string;
  nextScheduledClasses: Array<{
    date: string;
    dayOfWeek: DayOfWeek;
    startTime: string;
  }>;
}

export interface StudentProfileData {
  name: string;
  email: string;
  universityId: string;
  rollNumber?: string;
  campus: string;
  course: string;
  branch: string;
  semester: string;
  section: string;
  academicYear: string;
}

export interface TimetableSlot {
  id: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // "09:00"
  endTime: string; // "10:00"
  room?: string;
  faculty?: string;
  section?: string;
  classType: "THEORY" | "LAB";
  color: string;
}

export interface AcademicCalendarEvent {
  id: string;
  title: string;
  type:
    | "SEMESTER_START"
    | "SEMESTER_END"
    | "HOLIDAY"
    | "TEACHING_DAY"
    | "TERM_EVALUATION"
    | "MID_SEM"
    | "PRACTICAL_EXAM"
    | "THEORY_EXAM"
    | "END_SEM"
    | "SEMESTER_BREAK"
    | "INTERNSHIP"
    | "EVENT";
  startDate: string; // ISO
  endDate: string; // ISO
  semester?: string;
  campus: string;
  source: string;
  sourceUrl?: string;
  isOfficial: boolean;
  description?: string;
}

export interface ExamEntry {
  id: string;
  subjectName: string;
  courseCode: string;
  date: string; // ISO
  startTime: string;
  endTime: string;
  examType: "MID_SEM" | "END_SEM" | "PRACTICAL" | "BACK_PAPER" | "SPECIAL";
  semester: string;
  campus: string;
  room?: string;
  source: string;
  sourceUrl?: string;
  isBackPaper: boolean;
  backPaperDeadline?: string;
  backPaperFee?: string;
  officialNoticeUrl?: string;
  status: "SCHEDULED" | "REVISED" | "CANCELLED" | "COMPLETED";
}

export interface NoticeEntry {
  id: string;
  title: string;
  category:
    | "EXAMS"
    | "ATTENDANCE"
    | "ACADEMIC"
    | "REGISTRATION"
    | "FEES"
    | "BACK_PAPERS"
    | "HOLIDAYS"
    | "RESULTS"
    | "PLACEMENTS"
    | "EVENTS"
    | "GENERAL";
  content: string;
  publishedAt: string;
  sourceUrl?: string;
  source: string;
  campus?: string;
  course?: string;
  branch?: string;
  semester?: string;
  isPinned: boolean;
  isProfileMatched?: boolean;
}

export interface ExamDocument {
  id: string;
  title: string;
  type:
    | "ADMIT_CARD"
    | "SEATING_PLAN"
    | "EXAM_FORM"
    | "FEE_RECEIPT"
    | "SYLLABUS"
    | "ACADEMIC_CALENDAR"
    | "BACK_PAPER_FORM";
  fileUrl?: string;
  isOfficial: boolean;
  requiresAuth: boolean;
  officialPortalUrl: string;
  publishedAt: string;
  status: "AVAILABLE" | "UPCOMING" | "EXPIRED";
  semester?: string;
  campus: string;
}
