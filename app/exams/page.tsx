"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Download,
  ArrowRight,
} from "lucide-react";
import { SourceBadge } from "@/components/SourceBadge";

export default function ExamsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/exams")
      .then((res) => res.json())
      .then((d) => {
        if (d.success) setData(d);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-6 animate-pulse">
        <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  const { regularExams = [], backPaperExams = [] } = data || {};
  const nearestExam = regularExams[0] || null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              GEHU Examination Portal
            </h1>
            <SourceBadge
              type="OFFICIAL"
              sourceName="GEHU Exam Portal"
              sourceUrl="https://gehu.ac.in/dehradun/exam-portal/"
            />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Mid-Semester, End-Semester schedules, admit card links, and carryover examinations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/documents"
            className="px-3.5 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <Download className="w-4 h-4 text-blue-500" />
            <span>Admit Card & Docs</span>
          </Link>
          <Link
            href="/back-papers"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-500/20 flex items-center gap-1.5 transition-all"
          >
            <span>Back Papers ({backPaperExams.length})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Countdown Card (Section 29) */}
      {nearestExam && (
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white shadow-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 border border-purple-400/30">
                Next Examination • {nearestExam.examType.replace("_", " ")}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black">
                {nearestExam.subjectName}
              </h2>
              <p className="text-xs text-purple-200 font-medium">
                Course Code: {nearestExam.courseCode} • Center:{" "}
                {nearestExam.room || "Block C - Hall 101"}
              </p>
            </div>

            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15">
              <div className="text-center">
                <span className="text-3xl sm:text-4xl font-black">
                  {Math.max(
                    0,
                    Math.ceil(
                      (new Date(nearestExam.date).getTime() - Date.now()) /
                        (1000 * 60 * 60 * 24)
                    )
                  )}
                </span>
                <span className="block text-[10px] uppercase font-bold text-purple-200 tracking-wider">
                  Days
                </span>
              </div>
              <div className="text-2xl font-thin text-purple-300">:</div>
              <div className="text-center">
                <span className="text-3xl sm:text-4xl font-black">
                  {nearestExam.startTime.split(":")[0]}
                </span>
                <span className="block text-[10px] uppercase font-bold text-purple-200 tracking-wider">
                  Shift
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Regular Exams List */}
      <div className="space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
          Upcoming Scheduled Examinations ({regularExams.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {regularExams.map((ex: any) => (
            <div
              key={ex.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 transition-all hover:border-purple-300 dark:hover:border-purple-700"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                    {ex.courseCode}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {ex.status}
                  </span>
                </div>

                <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {ex.subjectName}
                </h4>

                <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-purple-500" />
                    <span>
                      {new Date(ex.date).toLocaleDateString("en-IN", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {ex.startTime} – {ex.endTime}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{ex.room || "Room TBA"}</span>
                </div>

                <a
                  href={ex.sourceUrl || "https://gehu.ac.in/dehradun/exam-portal/"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 dark:text-purple-400 hover:underline font-bold text-[11px] inline-flex items-center gap-1"
                >
                  <span>Official Datesheet</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
