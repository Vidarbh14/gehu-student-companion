import {
  AttendanceMetrics,
  AttendanceStatus,
  MissTomorrowResult,
  MissTomorrowSubjectEvaluation,
  SubjectAttendanceInfo,
  AttendanceForecastPoint,
} from "@/types";

/**
 * Calculates current attendance percentage with division-by-zero protection.
 * Returns rounded to 2 decimal places.
 */
export function calculateAttendancePercentage(
  attended: number,
  conducted: number
): number {
  if (conducted <= 0) {
    return 100.0;
  }
  const validAttended = Math.max(0, Math.min(attended, conducted));
  const pct = (validAttended / conducted) * 100;
  return Math.round(pct * 100) / 100;
}

/**
 * Calculates the effective target considering the safety buffer.
 * E.g., target 75% + buffer 2% = 77% effective target.
 */
export function getEffectiveTarget(
  targetPercentage: number = 75.0,
  safetyBuffer: number = 2.0
): number {
  return Math.min(100.0, Math.max(0, targetPercentage + safetyBuffer));
}

/**
 * Determines attendance status tier based on transparent thresholds.
 * SAFE: comfortable margin (>= effectiveTarget + 3%)
 * WATCH: at or slightly above effective target (< effectiveTarget + 3% and >= effectiveTarget)
 * RISK: between official target and effective target (< effectiveTarget and >= targetPercentage)
 * CRITICAL: strictly below official target (< targetPercentage)
 */
export function determineAttendanceStatus(
  currentPercentage: number,
  targetPercentage: number = 75.0,
  safetyBuffer: number = 2.0
): AttendanceStatus {
  const effectiveTarget = getEffectiveTarget(targetPercentage, safetyBuffer);

  if (currentPercentage < targetPercentage) {
    return "CRITICAL";
  }
  if (currentPercentage < effectiveTarget) {
    return "RISK";
  }
  if (currentPercentage < effectiveTarget + 3.0) {
    return "WATCH";
  }
  return "SAFE";
}

/**
 * Calculates maximum additional classes a student can miss RIGHT NOW
 * without their attendance percentage dropping below the target.
 * Formula: A / (C + x) >= T => x <= (A / T) - C
 * Returns floor((A / T) - C) if positive, else 0.
 */
export function calculateMaximumAbsences(
  attended: number,
  conducted: number,
  targetPercentage: number = 75.0
): number {
  if (conducted <= 0) return 0;
  if (targetPercentage <= 0) return 999;
  if (targetPercentage >= 100) {
    // If target is 100%, cannot miss any classes unless attended equals conducted and target met
    return 0;
  }

  const T = targetPercentage / 100.0;
  const maxAbsences = Math.floor(attended / T - conducted);
  return Math.max(0, maxAbsences);
}

/**
 * Calculates the maximum absences allowed across REMAINING scheduled classes.
 * Total final classes = C + R.
 * Minimum total attended needed = ceil(T * (C + R)).
 * Additional attended needed = max(0, ceil(T * (C + R)) - A).
 * Max misses out of R = max(0, R - additional attended needed).
 * Formula: floor(A + R - T * (C + R))
 */
export function calculateMaximumFutureAbsences(
  attended: number,
  conducted: number,
  remainingClasses: number,
  targetPercentage: number = 75.0
): number {
  if (remainingClasses <= 0) {
    return 0;
  }
  const totalClasses = conducted + remainingClasses;
  if (totalClasses <= 0) return 0;

  const T = targetPercentage / 100.0;
  const minFinalAttended = Math.ceil(T * totalClasses);
  const additionalAttendedNeeded = Math.max(0, minFinalAttended - attended);

  if (additionalAttendedNeeded > remainingClasses) {
    // Impossible to reach target even if attending all remaining classes
    return 0;
  }

  const maxMisses = remainingClasses - additionalAttendedNeeded;
  return Math.max(0, Math.min(remainingClasses, maxMisses));
}

/**
 * Calculates how many consecutive future classes must be attended without absence
 * to bring attendance back up to the target percentage.
 * Formula: (A + y) / (C + y) >= T => y >= (T * C - A) / (1 - T)
 * Returns ceil((T * C - A) / (1 - T)).
 */
export function calculateRecoveryClasses(
  attended: number,
  conducted: number,
  targetPercentage: number = 75.0
): number {
  if (conducted <= 0) return 0;
  const currentPct = (attended / conducted) * 100;
  if (currentPct >= targetPercentage) {
    return 0;
  }

  const T = targetPercentage / 100.0;
  if (T >= 1.0) {
    // Impossible to reach 100% if already missed a class
    return Infinity;
  }

  const numerator = T * conducted - attended;
  const denominator = 1.0 - T;
  const needed = Math.ceil(numerator / denominator);
  return Math.max(0, needed);
}

/**
 * Simulates attendance percentage after a specified number of absences.
 */
export function simulateAbsences(
  attended: number,
  conducted: number,
  additionalAbsences: number
): number {
  const newConducted = conducted + Math.max(0, additionalAbsences);
  return calculateAttendancePercentage(attended, newConducted);
}

/**
 * Simulates attendance percentage with both future attended and future conducted.
 */
export function simulateAttendance(
  attended: number,
  conducted: number,
  futureAttended: number,
  futureConducted: number
): number {
  const totalAttended = attended + Math.max(0, futureAttended);
  const totalConducted = conducted + Math.max(futureAttended, futureConducted);
  return calculateAttendancePercentage(totalAttended, totalConducted);
}

/**
 * Generates comprehensive metrics for a subject.
 */
export function calculateSubjectMetrics(params: {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  credits?: number;
  type?: "THEORY" | "LAB" | "PRACTICAL";
  color?: string;
  attended: number;
  conducted: number;
  remainingClasses: number;
  targetPercentage?: number;
  safetyBuffer?: number;
}): SubjectAttendanceInfo {
  const {
    subjectId,
    subjectCode,
    subjectName,
    credits = 4,
    type = "THEORY",
    color = "#0c81eb",
    attended,
    conducted,
    remainingClasses,
    targetPercentage = 75.0,
    safetyBuffer = 2.0,
  } = params;

  const currentPercentage = calculateAttendancePercentage(attended, conducted);
  const effectiveTarget = getEffectiveTarget(targetPercentage, safetyBuffer);
  const status = determineAttendanceStatus(
    currentPercentage,
    targetPercentage,
    safetyBuffer
  );

  const maxAbsencesAllowed = calculateMaximumAbsences(
    attended,
    conducted,
    effectiveTarget
  );

  const maxFutureAbsences = calculateMaximumFutureAbsences(
    attended,
    conducted,
    remainingClasses,
    effectiveTarget
  );

  const recoveryClassesNeeded = calculateRecoveryClasses(
    attended,
    conducted,
    targetPercentage
  );

  // Projected if student attends all remaining classes
  const projectedIfAttendAllRemaining =
    remainingClasses > 0
      ? calculateAttendancePercentage(
          attended + remainingClasses,
          conducted + remainingClasses
        )
      : currentPercentage;

  // Projected if student misses maximum allowed
  const projectedIfMissAllAllowed =
    remainingClasses > 0
      ? calculateAttendancePercentage(
          attended + (remainingClasses - maxFutureAbsences),
          conducted + remainingClasses
        )
      : simulateAbsences(attended, conducted, maxAbsencesAllowed);

  let statusDetails = "";
  if (status === "CRITICAL") {
    statusDetails = `Attendance below ${targetPercentage}%. Attend next ${recoveryClassesNeeded} classes consecutively to recover.`;
  } else if (status === "RISK") {
    statusDetails = `Attendance above ${targetPercentage}% but below ${effectiveTarget}% safety buffer. Caution advised.`;
  } else if (status === "WATCH") {
    statusDetails = `Within safe buffer. Can miss ${maxAbsencesAllowed} immediate class${
      maxAbsencesAllowed === 1 ? "" : "es"
    }.`;
  } else {
    statusDetails = `Comfortable buffer! Can miss up to ${maxFutureAbsences} of the ${remainingClasses} remaining classes.`;
  }

  return {
    subjectId,
    subjectCode,
    subjectName,
    credits,
    type,
    color,
    attended,
    conducted,
    currentPercentage,
    targetPercentage,
    safetyBuffer,
    effectiveTarget,
    status,
    maxAbsencesAllowed,
    recoveryClassesNeeded,
    remainingScheduledClasses: remainingClasses,
    maxFutureAbsences,
    projectedIfMissAllAllowed,
    projectedIfAttendAllRemaining,
    statusDetails,
  };
}

/**
 * Dedicated Engine Feature: "Can I Miss Tomorrow?"
 * Checks tomorrow's timetable entries against subjects' current and projected attendance.
 */
export function evaluateCanIMissTomorrow(params: {
  date: string; // ISO date string YYYY-MM-DD
  dayOfWeek: import("@/types").DayOfWeek;
  scheduledSubjects: Array<{
    subjectId: string;
    subjectCode: string;
    subjectName: string;
    slotsCount: number;
    attended: number;
    conducted: number;
  }>;
  targetPercentage?: number;
  safetyBuffer?: number;
}): MissTomorrowResult {
  const {
    date,
    dayOfWeek,
    scheduledSubjects,
    targetPercentage = 75.0,
    safetyBuffer = 2.0,
  } = params;

  const effectiveTarget = getEffectiveTarget(targetPercentage, safetyBuffer);

  if (!scheduledSubjects || scheduledSubjects.length === 0) {
    return {
      date,
      dayOfWeek,
      totalClassesScheduled: 0,
      canSafelyMissAll: true,
      verdict: "NO_CLASSES",
      summary: "No classes are scheduled on this day. Enjoy your holiday!",
      subjects: [],
      overallProjectedPercentageIfMissed: 100,
    };
  }

  let totalScheduled = 0;
  let totalAttended = 0;
  let totalConducted = 0;
  let canMissAll = true;
  let hasCriticalDrop = false;

  const subjectsEvaluations: MissTomorrowSubjectEvaluation[] = [];

  for (const item of scheduledSubjects) {
    totalScheduled += item.slotsCount;
    totalAttended += item.attended;
    totalConducted += item.conducted;

    const currentPct = calculateAttendancePercentage(
      item.attended,
      item.conducted
    );
    const pctIfMissed = calculateAttendancePercentage(
      item.attended,
      item.conducted + item.slotsCount
    );

    const statusBefore = determineAttendanceStatus(
      currentPct,
      targetPercentage,
      safetyBuffer
    );
    const statusAfter = determineAttendanceStatus(
      pctIfMissed,
      targetPercentage,
      safetyBuffer
    );

    // Can miss if after missing all tomorrow's slots, attendance stays >= effectiveTarget
    const canMiss = pctIfMissed >= effectiveTarget;

    if (!canMiss) {
      canMissAll = false;
      if (pctIfMissed < targetPercentage) {
        hasCriticalDrop = true;
      }
    }

    let reason = "";
    if (canMiss) {
      reason = `Safe: Missing ${item.slotsCount} lecture${
        item.slotsCount > 1 ? "s" : ""
      } maintains ${pctIfMissed}% (above ${effectiveTarget}% target).`;
    } else if (pctIfMissed < targetPercentage) {
      reason = `CRITICAL: Missing drops attendance to ${pctIfMissed}%, strictly below university ${targetPercentage}% requirement!`;
    } else {
      reason = `CAUTION: Missing drops attendance to ${pctIfMissed}%, below your ${effectiveTarget}% safety buffer.`;
    }

    subjectsEvaluations.push({
      subjectId: item.subjectId,
      subjectCode: item.subjectCode,
      subjectName: item.subjectName,
      scheduledSlots: item.slotsCount,
      currentPercentage: currentPct,
      percentageIfMissed: pctIfMissed,
      canMiss,
      reason,
      statusBefore,
      statusAfter,
    });
  }

  // Overall combined impact
  const overallProjectedIfMissed = calculateAttendancePercentage(
    totalAttended,
    totalConducted + totalScheduled
  );

  let verdict: "SAFE_TO_MISS" | "PARTIAL_RISK" | "CANNOT_MISS" | "NO_CLASSES";
  let summary = "";

  if (canMissAll && overallProjectedIfMissed >= effectiveTarget) {
    verdict = "SAFE_TO_MISS";
    summary = `You can safely miss tomorrow's ${totalScheduled} classes without breaching your ${effectiveTarget}% safety target.`;
  } else if (hasCriticalDrop || overallProjectedIfMissed < targetPercentage) {
    verdict = "CANNOT_MISS";
    summary = `Do NOT miss tomorrow. Missing scheduled classes will push one or more subjects below the ${targetPercentage}% requirement.`;
  } else {
    verdict = "PARTIAL_RISK";
    summary = `Caution: You can miss certain classes, but missing all tomorrow will breach your ${effectiveTarget}% safety buffer.`;
  }

  return {
    date,
    dayOfWeek,
    totalClassesScheduled: totalScheduled,
    canSafelyMissAll: canMissAll,
    verdict,
    summary,
    subjects: subjectsEvaluations,
    overallProjectedPercentageIfMissed: overallProjectedIfMissed,
  };
}

/**
 * Generates forecast projection points for Recharts graph visualization.
 */
export function generateForecastCurve(params: {
  currentAttended: number;
  currentConducted: number;
  futureClassesCount: number;
  targetPercentage?: number;
}): AttendanceForecastPoint[] {
  const {
    currentAttended,
    currentConducted,
    futureClassesCount,
    targetPercentage = 75.0,
  } = params;

  const points: AttendanceForecastPoint[] = [];
  const steps = Math.max(5, Math.min(25, futureClassesCount));

  for (let i = 0; i <= steps; i++) {
    // If attending all classes from this point forward
    const attendedAll = currentAttended + i;
    const conductedAll = currentConducted + i;
    const ifAttendAll = calculateAttendancePercentage(attendedAll, conductedAll);

    // If missed 1 class at start, then attended remaining
    const attendedMiss1 = currentAttended + Math.max(0, i - 1);
    const ifMissOneNext = calculateAttendancePercentage(
      attendedMiss1,
      conductedAll
    );

    // If missed 2 classes at start, then attended remaining
    const attendedMiss2 = currentAttended + Math.max(0, i - 2);
    const ifMissTwoNext = calculateAttendancePercentage(
      attendedMiss2,
      conductedAll
    );

    points.push({
      date: `+${i} class${i === 1 ? "" : "es"}`,
      classIndex: i,
      ifAttendAll,
      ifMissOneNext,
      ifMissTwoNext,
      targetLine: targetPercentage,
    });
  }

  return points;
}
