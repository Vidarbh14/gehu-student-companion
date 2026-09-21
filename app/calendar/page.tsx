"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  CalendarDays,
  Clock,
  Sparkles,
  ExternalLink,
  PartyPopper,
  GraduationCap,
  FileText,
} from "lucide-react";
import { SourceBadge } from "@/components/SourceBadge";

export default function CalendarPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/calendar")
      .then((res) => res.json())
      .then((data) => {
        if (data.events) setEvents(data.events);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getEventBadge = (type: string) => {
    switch (type) {
      case "HOLIDAY":
        return {
          bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
          label: "Holiday",
          icon: PartyPopper,
        };
      case "MID_SEM":
      case "END_SEM":
      case "PRACTICAL_EXAM":
        return {
          bg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
          label: "Examination",
          icon: FileText,
        };
      case "SEMESTER_START":
      case "SEMESTER_END":
        return {
          bg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
          label: "Semester Milestone",
          icon: GraduationCap,
        };
      default:
        return {
          bg: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
          label: "Academic Event",
          icon: CalendarIcon,
        };
    }
  };

  const filtered = events.filter((e) => {
    if (filter === "ALL") return true;
    if (filter === "HOLIDAYS") return e.type === "HOLIDAY";
    if (filter === "EXAMS")
      return (
        e.type === "MID_SEM" ||
        e.type === "END_SEM" ||
        e.type === "PRACTICAL_EXAM"
      );
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              GEHU Academic Calendar
            </h1>
            <SourceBadge
              type="OFFICIAL"
              sourceName="GEHU Academic Calendar"
              sourceUrl="https://gehu.ac.in/dehradun/academics/calendar/"
            />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Official Odd Semester 2026-27 schedule of examinations, holidays, and teaching days.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === "ALL"
                ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-slate-500"
            }`}
          >
            All Events
          </button>
          <button
            onClick={() => setFilter("HOLIDAYS")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === "HOLIDAYS"
                ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm"
                : "text-slate-500"
            }`}
          >
            Holidays
          </button>
          <button
            onClick={() => setFilter("EXAMS")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === "EXAMS"
                ? "bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm"
                : "text-slate-500"
            }`}
          >
            Exams
          </button>
        </div>
      </div>

      {/* Events Timeline / List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">
            Loading university calendar...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">
            No events match this filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((event) => {
              const badge = getEventBadge(event.type);
              const Icon = badge.icon;
              const startDate = new Date(event.startDate).toLocaleDateString(
                "en-IN",
                {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }
              );
              const endDate = new Date(event.endDate).toLocaleDateString(
                "en-IN",
                {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }
              );
              const isSingleDay = startDate === endDate;

              return (
                <div
                  key={event.id}
                  className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 group hover:border-blue-300 dark:hover:border-blue-700 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border ${badge.bg}`}
                      >
                        <Icon className="w-3 h-3" />
                        <span>{badge.label}</span>
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {event.campus} Campus
                      </span>
                    </div>

                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white leading-snug">
                      {event.title}
                    </h3>

                    {event.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                      <CalendarDays className="w-4 h-4 text-blue-500" />
                      <span>{isSingleDay ? startDate : `${startDate} – ${endDate}`}</span>
                    </div>

                    {event.sourceUrl && (
                      <a
                        href={event.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                      >
                        <span>Official Notice</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
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
