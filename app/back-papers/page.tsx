"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Calendar,
  Clock,
  AlertCircle,
  ExternalLink,
  Plus,
  Check,
  CreditCard,
  MapPin,
} from "lucide-react";
import { SourceBadge } from "@/components/SourceBadge";

export default function BackPapersPage() {
  const [backPapers, setBackPapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [myAddedExams, setMyAddedExams] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch("/api/exams")
      .then((res) => res.json())
      .then((d) => {
        if (d.success) {
          setBackPapers(d.backPaperExams || []);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleAddToMyExams = (id: string) => {
    setMyAddedExams((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Back-Paper / Carryover Module
            </h1>
            <SourceBadge
              type="OFFICIAL"
              sourceName="GEHU Exam Portal"
              sourceUrl="https://gehu.ac.in/dehradun/exam-portal/"
            />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Deadlines, registration fees, and examination dates for backlog courses.
          </p>
        </div>

        <Link
          href="/documents"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <FileText className="w-4 h-4" />
          <span>Back-Paper Form & Fee Slip</span>
        </Link>
      </div>

      {/* Urgent Notice Callout Banner */}
      <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/20 space-y-3">
        <div className="flex items-center gap-2.5 text-amber-900 dark:text-amber-200">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          <h3 className="font-extrabold text-sm sm:text-base">
            Back-Paper Registration Form Deadline: October 05, 2026
          </h3>
        </div>
        <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed max-w-3xl">
          Students must submit their official back-paper form and requisite examination
          fee receipt (₹1,000 per subject) to the examination cell before 5:00 PM on
          October 5. No forms will be accepted after the deadline without late fee penalty.
        </p>
      </div>

      {/* Back Papers List */}
      <div className="space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
          Active Carryover Schedules ({backPapers.length})
        </h3>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">
            Loading back-paper schedules...
          </div>
        ) : backPapers.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-2">
            <Check className="w-8 h-8 text-emerald-500 mx-auto" />
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
              No Back-Paper Examinations Published
            </h4>
            <p className="text-xs text-slate-500">
              Check the official portal notices for late announcements.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {backPapers.map((paper) => {
              const isAdded = !!myAddedExams[paper.id];
              return (
                <div
                  key={paper.id}
                  className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 transition-all hover:border-purple-300 dark:hover:border-purple-700"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                        {paper.courseCode} • Sem {paper.semester}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                        BACK-PAPER
                      </span>
                    </div>

                    <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                      {paper.subjectName}
                    </h4>

                    <div className="space-y-1.5 text-xs text-slate-500 pt-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-purple-500" />
                        <span>
                          Exam Date:{" "}
                          <strong>
                            {new Date(paper.date).toLocaleDateString("en-IN", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          Time: {paper.startTime} – {paper.endTime}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-3.5 h-3.5 text-emerald-500" />
                        <span>
                          Fee: <strong>{paper.backPaperFee || "₹1,000"}</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>Center: {paper.room || "Hall A"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                    {paper.officialNoticeUrl && (
                      <a
                        href={paper.officialNoticeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                      >
                        <span>Official Notice</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}

                    <button
                      onClick={() => toggleAddToMyExams(paper.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                        isAdded
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200"
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Added to My Exams</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to My Exams</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
