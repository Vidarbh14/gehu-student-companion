"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  Search,
  Filter,
  ExternalLink,
  Sparkles,
  Pin,
  Calendar,
  CheckCircle,
} from "lucide-react";
import { SourceBadge } from "@/components/SourceBadge";

const CATEGORIES = [
  "ALL",
  "EXAMS",
  "ATTENDANCE",
  "BACK_PAPERS",
  "ACADEMIC",
  "FEES",
  "REGISTRATION",
  "HOLIDAYS",
  "EVENTS",
];

export default function NoticesPage() {
  const [notices, setNotices] = useState<any[]>([]);
  const [category, setCategory] = useState("ALL");
  const [search, setSearch] = useState("");
  const [onlyMatched, setOnlyMatched] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchNotices = async () => {
    try {
      const params = new URLSearchParams();
      if (category !== "ALL") params.append("category", category);
      if (search) params.append("q", search);

      const res = await fetch(`/api/notices?${params.toString()}`);
      const data = await res.json();
      if (data.notices) setNotices(data.notices);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [category, search]);

  const displayedNotices = onlyMatched
    ? notices.filter((n) => n.isProfileMatched)
    : notices;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              GEHU Academic Updates & Notices
            </h1>
            <SourceBadge
              type="SCRAPED"
              sourceName="GEHU Notice Board"
              sourceUrl="https://gehu.ac.in/dehradun/student-area/"
            />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Aggregated official circulars, examination notifications, and deadlines.
          </p>
        </div>

        {/* Personalized Profile Toggle (Section 22) */}
        <button
          onClick={() => setOnlyMatched(!onlyMatched)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
            onlyMatched
              ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
              : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Matched to your profile (B.Tech CSE III)</span>
        </button>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Search notices by keyword ('back paper', 'attendance', 'datesheet', 'admit card')..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
        </div>

        {/* Category Pills */}
        <div className="flex overflow-x-auto gap-2 py-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                category === cat
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
              }`}
            >
              {cat.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Notices Feed */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">
            Fetching latest university circulars...
          </div>
        ) : displayedNotices.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-2">
            <Bell className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
              No matching notices found
            </h4>
            <p className="text-xs text-slate-500">
              Try adjusting your search terms or category filter.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedNotices.map((notice) => (
              <div
                key={notice.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 transition-all hover:border-blue-300 dark:hover:border-blue-700"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {notice.isPinned && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                        <Pin className="w-3 h-3" />
                        <span>Pinned Notice</span>
                      </span>
                    )}
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                      {notice.category}
                    </span>
                    {notice.isProfileMatched && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        ✓ Matched to your profile
                      </span>
                    )}
                  </div>

                  <span className="text-xs text-slate-400">
                    {new Date(notice.publishedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-snug">
                  {notice.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {notice.content}
                </p>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">
                    Source: {notice.source}
                  </span>

                  {notice.sourceUrl && (
                    <a
                      href={notice.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 font-bold hover:underline inline-flex items-center gap-1"
                    >
                      <span>Open Official Notice</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
