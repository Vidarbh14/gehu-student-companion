"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Sparkles,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  FileText,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  Plus,
  RefreshCw,
} from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { SourceBadge } from "@/components/SourceBadge";
import { AttendanceRing } from "@/components/AttendanceRing";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async () => {
    try {
      const res = await fetch("/api/dashboard");
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 animate-pulse">
        <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-2xl md:col-span-2" />
          <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold">Failed to load academic dashboard</h2>
        <p className="text-xs text-slate-500">
          Ensure the database is initialized and seeded.
        </p>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl"
        >
          Retry
        </button>
      </div>
    );
  }

  const {
    student,
    attendance,
    missTomorrow,
    todaySchedule,
    upcomingExam,
    importantNotice,
    smartInsights,
  } = data;

  // Next class from today's schedule
  const nextClass = todaySchedule?.slots?.[0] || null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner / Student Greeting Section (Section 23) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30">
                {student.profile.campus} Campus • {student.profile.course}{" "}
                {student.profile.branch}
              </span>
              <span className="text-xs text-blue-200/80 font-medium">
                {student.profile.semester} Semester • Sec {student.profile.section}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Good Morning, {student.name}
            </h1>
            <p className="text-xs text-blue-200/80 font-medium">
              ID: {student.profile.universityId} • Roll No:{" "}
              {student.profile.rollNumber} • Academic Year {student.profile.academicYear}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15">
            <div className="text-right">
              <span className="block text-[11px] font-semibold text-blue-200 uppercase tracking-wider">
                Overall Attendance
              </span>
              <div className="flex items-baseline justify-end gap-1.5">
                <span className="text-3xl font-black">
                  {attendance.overallPercentage}%
                </span>
                <span className="text-xs text-blue-200">
                  ({attendance.totalAttended}/{attendance.totalConducted})
                </span>
              </div>
              <div className="mt-1 flex items-center justify-end gap-1.5">
                <StatusBadge status={attendance.overallStatus} size="sm" />
                <span className="text-[10px] text-blue-200/80">
                  Target {student.target.targetPercentage}% + {student.target.safetyBuffer}% Buffer
                </span>
              </div>
            </div>
            <AttendanceRing
              percentage={attendance.overallPercentage}
              target={student.target.targetPercentage}
              size={64}
              strokeWidth={6}
              showText={false}
            />
          </div>
        </div>
      </div>

      {/* Primary KPI Grid (Section 23, 24) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {/* Card 1: Attendance Freedom (Section 14) */}
        <div className="md:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Attendance Freedom
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Classes you can miss right now
                </p>
              </div>
            </div>
            <SourceBadge
              type="CALCULATED"
              assumptions={`Derived from floor(A / ${student.target.effectiveTarget}% - C)`}
            />
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-blue-600 dark:text-blue-400">
                {attendance.totalClassesCanMiss}
              </span>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                total classes across all subjects
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Maintains your {student.target.effectiveTarget}% conservative target (75% + 2% safety buffer).
            </p>
          </div>

          {/* Subject-wise breakdown chips */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            {attendance.subjects.slice(0, 5).map((sub: any) => (
              <div
                key={sub.subjectId}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 truncate max-w-[80px]">
                    {sub.subjectCode}
                  </span>
                  <span
                    className={`text-[10px] font-bold ${
                      sub.maxAbsencesAllowed > 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-500"
                    }`}
                  >
                    {sub.maxAbsencesAllowed > 0
                      ? `${sub.maxAbsencesAllowed} safe`
                      : "0 safe"}
                  </span>
                </div>
                <div className="text-xs font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">
                  {sub.currentPercentage}%
                </div>
              </div>
            ))}
          </div>

          <div className="text-right">
            <Link
              href="/attendance"
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
            >
              <span>Manage all subjects</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Card 2: Dedicated "Can I Miss Tomorrow?" (Section 13) */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                missTomorrow.verdict === "SAFE_TO_MISS"
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                  : missTomorrow.verdict === "CANNOT_MISS"
                  ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                  : "bg-amber-500/10 text-amber-600 border-amber-500/20"
              }`}
            >
              {missTomorrow.verdict.replace("_", " ")}
            </span>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Can I Miss Tomorrow?
            </h3>
            <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
              {missTomorrow.totalClassesScheduled} Classes Tomorrow
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-3">
              {missTomorrow.summary}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <Link
              href="/miss-tomorrow"
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
            >
              <span>View full tomorrow audit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Card 3: Next Exam Countdown (Section 29) */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <Calendar className="w-5 h-5" />
            </div>
            <SourceBadge type="OFFICIAL" sourceName="GEHU Exam Portal" />
          </div>

          {upcomingExam ? (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                {upcomingExam.examType.replace("_", " ")}
              </span>
              <h4 className="text-lg font-black text-slate-900 dark:text-white mt-2 leading-tight">
                {upcomingExam.subjectName}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {new Date(upcomingExam.date).toLocaleDateString("en-IN", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}{" "}
                • {upcomingExam.startTime}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                {upcomingExam.room || "Block C - Hall 101"}
              </p>
            </div>
          ) : (
            <div>
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                No immediate exams
              </h4>
              <p className="text-xs text-slate-500">All evaluations up to date.</p>
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <Link
              href="/exams"
              className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline inline-flex items-center gap-1"
            >
              <span>Exams & Back Papers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Middle Section: Today's Timeline + Smart Academic Insights (Section 24, 25) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule Timeline (2 Cols) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Today&apos;s Lecture Schedule
              </h3>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {todaySchedule?.slots?.length ?? 0} Lectures Today
            </span>
          </div>

          {todaySchedule?.slots?.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-400">
              No classes scheduled for today!
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              {todaySchedule?.slots?.map((slot: any, idx: number) => (
                <div
                  key={slot.id || idx}
                  className="flex items-start gap-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 transition-all hover:border-blue-300 dark:hover:border-blue-700"
                >
                  <div className="text-center min-w-[70px] pt-1">
                    <span className="text-xs font-black text-slate-900 dark:text-white block">
                      {slot.startTime}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {slot.endTime}
                    </span>
                  </div>

                  <div className="w-1 self-stretch rounded-full bg-blue-500 shrink-0" />

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {slot.subjectName}
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                        {slot.classType}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                      <span>{slot.room || "Room 204"}</span>
                      <span>•</span>
                      <span>{slot.faculty || "Faculty"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2 flex items-center justify-between text-xs">
            <span className="text-slate-400">
              Official lecture schedule for Odd Semester
            </span>
            <Link
              href="/timetable"
              className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Full Weekly Timetable →
            </Link>
          </div>
        </div>

        {/* Smart Academic Insights (Section 25) */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Smart Insights
              </h3>
            </div>
            <SourceBadge type="CALCULATED" />
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Deterministic findings based on your timetable, exams, and target attendance.
          </p>

          <div className="space-y-3 pt-1">
            {smartInsights?.map((insight: string, i: number) => (
              <div
                key={i}
                className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 text-xs text-slate-700 dark:text-slate-300 leading-relaxed flex items-start gap-2.5"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                <span>{insight}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <Link
              href="/simulator"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all"
            >
              <span>Open What-If Simulator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Pinned Notice Alert Card (Section 21) */}
      {importantNotice && (
        <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">
                  {importantNotice.category} Notice
                </span>
                <span className="text-[10px] text-slate-500">
                  {new Date(importantNotice.publishedAt).toLocaleDateString()}
                </span>
              </div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white mt-1">
                {importantNotice.title}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-1">
                {importantNotice.content}
              </p>
            </div>
          </div>
          <Link
            href="/notices"
            className="shrink-0 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition-all text-center"
          >
            Read Notice
          </Link>
        </div>
      )}
    </div>
  );
}
