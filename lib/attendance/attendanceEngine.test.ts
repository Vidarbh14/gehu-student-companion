import { describe, it, expect } from "vitest";
import {
  calculateAttendancePercentage,
  getEffectiveTarget,
  determineAttendanceStatus,
  calculateMaximumAbsences,
  calculateMaximumFutureAbsences,
  calculateRecoveryClasses,
  simulateAbsences,
  simulateAttendance,
  calculateSubjectMetrics,
  evaluateCanIMissTomorrow,
} from "./attendanceEngine";

describe("Attendance Engine - Core Mathematics", () => {
  it("calculates percentage accurately and handles zero conducted safely", () => {
    expect(calculateAttendancePercentage(36, 42)).toBe(85.71);
    expect(calculateAttendancePercentage(0, 0)).toBe(100.0);
    expect(calculateAttendancePercentage(10, 10)).toBe(100.0);
    expect(calculateAttendancePercentage(0, 10)).toBe(0.0);
  });

  it("calculates effective target with buffer", () => {
    expect(getEffectiveTarget(75, 2)).toBe(77.0);
    expect(getEffectiveTarget(75, 0)).toBe(75.0);
    expect(getEffectiveTarget(85, 5)).toBe(90.0);
  });

  it("determines correct attendance status tiers", () => {
    // Target 75, Buffer 2 (Effective 77)
    // SAFE: >= 80% (effective + 3)
    // WATCH: >= 77% and < 80%
    // RISK: >= 75% and < 77%
    // CRITICAL: < 75%
    expect(determineAttendanceStatus(85.71, 75, 2)).toBe("SAFE");
    expect(determineAttendanceStatus(78.5, 75, 2)).toBe("WATCH");
    expect(determineAttendanceStatus(76.0, 75, 2)).toBe("RISK");
    expect(determineAttendanceStatus(72.0, 75, 2)).toBe("CRITICAL");
  });

  it("calculates maximum immediate absences (specification example 36/42 at 75%)", () => {
    // 36 / 0.75 - 42 = 48 - 42 = 6 classes
    const maxMisses = calculateMaximumAbsences(36, 42, 75);
    expect(maxMisses).toBe(6);

    // Verify: If missed 6, 36 / 48 = 0.75 (75.0%)
    expect(simulateAbsences(36, 42, 6)).toBe(75.0);
    // If missed 7, 36 / 49 = 73.47% (< 75%)
    expect(simulateAbsences(36, 42, 7)).toBeLessThan(75.0);
  });

  it("calculates maximum absences with safety buffer (36/42 at 77% effective target)", () => {
    // 36 / 0.77 - 42 = 46.75 - 42 = 4.75 => floor is 4 classes
    const maxMissesWithBuffer = calculateMaximumAbsences(36, 42, 77);
    expect(maxMissesWithBuffer).toBe(4);

    // If missed 4, 36 / 46 = 78.26% >= 77%
    expect(simulateAbsences(36, 42, 4)).toBeGreaterThanOrEqual(77.0);
    // If missed 5, 36 / 47 = 76.59% < 77%
    expect(simulateAbsences(36, 42, 5)).toBeLessThan(77.0);
  });

  it("calculates maximum future absences out of 20 remaining classes", () => {
    // Attended = 36, Conducted = 42, Remaining = 20, Target = 75%
    // Total classes = 62. 75% of 62 = 46.5 => ceil is 47.
    // Must attend 47 - 36 = 11 of remaining 20.
    // Can miss 20 - 11 = 9 classes.
    const maxFutureMisses = calculateMaximumFutureAbsences(36, 42, 20, 75);
    expect(maxFutureMisses).toBe(9);

    // If missed 9, attended 11: (36 + 11) / 62 = 47 / 62 = 75.81% >= 75%
    expect(simulateAttendance(36, 42, 11, 20)).toBeGreaterThanOrEqual(75.0);
    // If missed 10, attended 10: (36 + 10) / 62 = 46 / 62 = 74.19% < 75%
    expect(simulateAttendance(36, 42, 10, 20)).toBeLessThan(75.0);
  });

  it("calculates recovery classes accurately when below target", () => {
    // Attended = 28, Conducted = 42 (66.67%), Target = 75%
    // Needed = ceil((0.75 * 42 - 28) / 0.25) = ceil((31.5 - 28) / 0.25) = ceil(3.5 / 0.25) = 14
    const recoveryNeeded = calculateRecoveryClasses(28, 42, 75);
    expect(recoveryNeeded).toBe(14);

    // Verify: (28 + 14) / (42 + 14) = 42 / 56 = 75.0%
    expect(calculateAttendancePercentage(28 + 14, 42 + 14)).toBe(75.0);
    // If only 13: 41 / 55 = 74.55% < 75%
    expect(calculateAttendancePercentage(28 + 13, 42 + 13)).toBeLessThan(75.0);
  });

  it("handles edge cases safely without throwing or NaN", () => {
    expect(calculateMaximumAbsences(0, 0, 75)).toBe(0);
    expect(calculateRecoveryClasses(10, 10, 75)).toBe(0); // already 100%
    expect(calculateMaximumFutureAbsences(0, 0, 0, 75)).toBe(0);
  });
});

describe("Attendance Engine - Feature: Can I Miss Tomorrow", () => {
  it("evaluates tomorrow schedule correctly", () => {
    const evaluation = evaluateCanIMissTomorrow({
      date: "2026-09-22",
      dayOfWeek: "TUESDAY",
      scheduledSubjects: [
        {
          subjectId: "sub-1",
          subjectCode: "TCS-301",
          subjectName: "Data Structures",
          slotsCount: 1,
          attended: 36,
          conducted: 42, // 85.71% -> missing 1: 36/43 = 83.72% >= 77% (safe)
        },
        {
          subjectId: "sub-2",
          subjectCode: "TCS-302",
          subjectName: "Mathematics III",
          slotsCount: 1,
          attended: 31,
          conducted: 40, // 77.5% -> missing 1: 31/41 = 75.6% < 77% buffer (caution)
        },
      ],
      targetPercentage: 75,
      safetyBuffer: 2,
    });

    expect(evaluation.subjects[0].canMiss).toBe(true);
    expect(evaluation.subjects[1].canMiss).toBe(false);
    expect(evaluation.verdict).toBe("PARTIAL_RISK");
  });
});
