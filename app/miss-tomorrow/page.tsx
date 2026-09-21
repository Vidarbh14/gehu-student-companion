"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { SourceBadge } from "@/components/SourceBadge";

export default function MissTomorrowPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>("");

  const fetchEvaluation = async (dateStr?: string) => {
    setLoading(true);
    try {
      const url = dateStr
        ? `/api/attendance/miss-tomorrow?date=${dateStr}`
        : `/api/attendance/miss-tomorrow`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setData(json);
        if (!selectedDate) {
          setSelectedDate(json.schedule.date);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvaluation();
  }, []);

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    fetchEvaluation(newDate);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-6 animate-pulse">
        <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      </div>
    );
  }

  const { schedule, evaluation } = data || {};

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Feature intro */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Can I Miss Tomorrow?
            </h1>
            <SourceBadge type="CALCULATED" assumptions="Tomorrow timetable slots vs subject buffer margins" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Simulates the exact percentage drop for every scheduled lecture tomorrow.
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800">
          <Calendar className="w-4 h-4 text-blue-500 ml-2" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none pr-2"
          />
        </div>
      </div>

      {/* Main Verdict Card */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border shadow-lg relative overflow-hidden ${
          evaluation?.verdict === "SAFE_TO_MISS"
            ? "bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-slate-900/5 border-emerald-500/30"
            : evaluation?.verdict === "CANNOT_MISS"
            ? "bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-slate-900/5 border-rose-500/30"
            : "bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-slate-900/5 border-amber-500/30"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Evaluation for {evaluation?.dayOfWeek} ({evaluation?.date})
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              Verdict:{" "}
              <span
                className={
                  evaluation?.verdict === "SAFE_TO_MISS"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : evaluation?.verdict === "CANNOT_MISS"
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-amber-600 dark:text-amber-400"
                }
              >
                {evaluation?.verdict.replace("_", " ")}
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-2 max-w-2xl leading-relaxed">
              {evaluation?.summary}
            </p>
          </div>

          <div className="text-right sm:border-l sm:border-slate-200 sm:dark:border-slate-800 sm:pl-6">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">
              Total Lectures Scheduled
            </span>
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {evaluation?.totalClassesScheduled}
            </span>
            <span className="text-xs text-slate-500 block">
              If all missed: {evaluation?.overallProjectedPercentageIfMissed}% overall
            </span>
          </div>
        </div>
      </div>

      {/* Per-Subject Tomorrow Audit Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            Subject-by-Subject Impact Breakdown
          </h3>
          <span className="text-xs text-slate-500">
            {evaluation?.subjects?.length ?? 0} Subjects Scheduled
          </span>
        </div>

        {evaluation?.subjects?.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No regular lectures scheduled on this date.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {evaluation?.subjects?.map((sub: any) => (
              <div
                key={sub.subjectId}
                className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                      {sub.subjectCode}
                    </span>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {sub.subjectName}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {sub.reason}
                  </p>
                </div>

                <div className="flex items-center gap-6 justify-between md:justify-end">
                  {/* Before vs After */}
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">
                      Current → If Missed
                    </span>
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <span className="text-slate-700 dark:text-slate-300">
                        {sub.currentPercentage}%
                      </span>
                      <span className="text-slate-400">→</span>
                      <span
                        className={
                          sub.canMiss
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"
                        }
                      >
                        {sub.percentageIfMissed}%
                      </span>
                    </div>
                  </div>

                  {/* Can Miss Badge */}
                  <div className="min-w-[110px] text-right">
                    {sub.canMiss ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Can Miss</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cannot Miss</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mathematical Principle Callout */}
      <div className="p-5 rounded-3xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-200 space-y-2">
        <div className="flex items-center gap-2 font-bold">
          <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Core Product Principle</span>
        </div>
        <p className="leading-relaxed">
          The companion evaluates tomorrow&apos;s lectures individually. If missing a lecture drops
          the subject below your safety buffer (77%), it is marked <strong>Cannot Miss</strong>. If
          it breaches the strict university requirement (75%), a critical warning is issued.
        </p>
      </div>
    </div>
  );
}
