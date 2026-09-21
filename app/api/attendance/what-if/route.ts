import { NextResponse } from "next/server";
import {
  calculateAttendancePercentage,
  calculateRecoveryClasses,
  calculateMaximumAbsences,
  determineAttendanceStatus,
  simulateAbsences,
} from "@/lib/attendance/attendanceEngine";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const attended = Math.max(0, parseInt(body.attended, 10) || 0);
    const conducted = Math.max(attended, parseInt(body.conducted, 10) || 0);
    const target = Math.min(100, Math.max(1, parseFloat(body.target) || 75.0));
    const buffer = Math.max(0, parseFloat(body.buffer) || 2.0);
    const missClasses = Math.max(0, parseInt(body.missClasses, 10) || 0);
    const goalPercentage = Math.min(
      100,
      Math.max(target, parseFloat(body.goalPercentage) || 80.0)
    );

    // Current metrics
    const currentPercentage = calculateAttendancePercentage(attended, conducted);
    const currentStatus = determineAttendanceStatus(
      currentPercentage,
      target,
      buffer
    );

    // If student misses 'missClasses' additional classes
    const projectedPercentageIfMiss = simulateAbsences(
      attended,
      conducted,
      missClasses
    );
    const projectedStatusIfMiss = determineAttendanceStatus(
      projectedPercentageIfMiss,
      target,
      buffer
    );

    // Consecutive classes to reach goal percentage
    const classesToReachGoal = calculateRecoveryClasses(
      attended,
      conducted,
      goalPercentage
    );

    // Max safe absences right now
    const maxSafeAbsences = calculateMaximumAbsences(
      attended,
      conducted,
      target + buffer
    );

    return NextResponse.json({
      success: true,
      current: {
        attended,
        conducted,
        percentage: currentPercentage,
        status: currentStatus,
      },
      simulation: {
        classesMissed: missClasses,
        projectedPercentage: projectedPercentageIfMiss,
        projectedStatus: projectedStatusIfMiss,
        isAboveTarget: projectedPercentageIfMiss >= target,
        isAboveEffectiveTarget: projectedPercentageIfMiss >= target + buffer,
      },
      goalPlanner: {
        desiredGoal: goalPercentage,
        classesNeededConsecutively: classesToReachGoal,
        explanation: `To achieve ${goalPercentage}%, you need to attend the next ${classesToReachGoal} consecutive classes without absence.`,
      },
      maxSafeAbsences,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Simulator calculation failed: " + err.message },
      { status: 400 }
    );
  }
}
