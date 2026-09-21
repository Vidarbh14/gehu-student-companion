"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Clock,
  Calendar,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Activity,
  ChevronRight,
  Lock,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden">
      {/* Glow background effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[550px] overflow-hidden -z-10 pointer-events-none opacity-40 dark:opacity-20">
        <div className="absolute -top-32 left-1/4 w-96 h-96 rounded-full bg-blue-500 blur-3xl" />
        <div className="absolute top-12 right-1/4 w-96 h-96 rounded-full bg-indigo-500 blur-3xl" />
      </div>

      {/* Hero Section */}
      <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-200 dark:border-blue-900/60 bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>Built for Graphic Era Hill University Students</span>
          </div>

          {/* Main Hero Title */}
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            Know exactly{" "}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              how many classes
            </span>{" "}
            you can miss.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Your timetable, attendance, exams, and GEHU academic updates — organized
            into one intelligent, mathematically sound companion dashboard.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-xl shadow-blue-500/25 transition-all hover:scale-105"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-sm shadow-sm transition-all"
            >
              <span>Explore Live Demo</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>

          <div className="flex items-center justify-center gap-6 pt-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              100% Deterministic Math
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-blue-500" />
              Zero Credential Scraping
            </span>
            <span className="flex items-center gap-1.5 hidden sm:flex">
              <CheckCircle2 className="w-4 h-4 text-indigo-500" />
              GEHU 2026-27 Aligned
            </span>
          </div>
        </div>

        {/* Hero Interactive Dashboard Visual Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-14 max-w-5xl mx-auto rounded-3xl p-3 sm:p-5 bg-gradient-to-b from-slate-200/80 to-slate-100/40 dark:from-slate-800/80 dark:to-slate-900/40 border border-slate-300/80 dark:border-slate-700/80 shadow-2xl backdrop-blur-xl"
        >
          <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800/80 shadow-inner">
            {/* Top Bar inside mockup */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800/80 gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Graphic Era Hill University • Dehradun Campus
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  Good Morning, Demo Student
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  B.Tech CSE • III Semester • Section A • 2026-27
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>STATUS: SAFE (82.4%)</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs font-bold">
                  Target: 75% + 2% Buffer
                </div>
              </div>
            </div>

            {/* Grid preview cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-6">
              {/* Card 1: Attendance Freedom */}
              <div className="md:col-span-2 p-5 rounded-2xl bg-gradient-to-br from-blue-50/80 to-indigo-50/30 dark:from-blue-950/30 dark:to-indigo-950/10 border border-blue-200/80 dark:border-blue-900/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-blue-600 dark:text-blue-400 tracking-wider">
                    Attendance Freedom
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white">
                    7 Classes Safe
                  </span>
                </div>
                <div className="mt-3">
                  <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                    You can miss{" "}
                    <span className="text-blue-600 dark:text-blue-400">7</span>{" "}
                    classes
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Calculated against your 77% effective target (75% + 2% safety buffer).
                  </p>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Data Structures</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">3 can miss</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Discrete Math</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">0 can miss</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Can I Miss Tomorrow */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                      Can I Miss Tomorrow?
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      PARTIAL RISK
                    </span>
                  </div>
                  <div className="mt-2 text-xl font-extrabold text-slate-900 dark:text-white">
                    3 Classes Scheduled
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Missing Discrete Math will breach safety buffer.
                  </p>
                </div>
                <div className="pt-3">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1">
                    Inspect breakdown →
                  </span>
                </div>
              </div>

              {/* Card 3: Next Exam */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                      Next Exam
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-600 border border-purple-500/20">
                      MID-SEM
                    </span>
                  </div>
                  <div className="mt-2 text-xl font-extrabold text-slate-900 dark:text-white">
                    Data Structures
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Oct 12 • 10:00 AM • Block C 101
                  </p>
                </div>
                <div className="pt-3 flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>11 Days Remaining</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Key Architectural Pillars */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200 dark:border-slate-800">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Engineered for Academic Precision
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            No guesswork. The companion executes deterministic calculations based on
            your timetable and the official academic session.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Deterministic Math Engine
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Calculates exact maximum absences using:
              <code className="block mt-2 p-2 bg-slate-100 dark:bg-slate-800 rounded font-mono text-[11px] text-blue-600 dark:text-blue-400">
                floor(A / T - C)
              </code>
              Considers customizable safety buffers (75%, 77%, 80%) to prevent unexpected shortage.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Date-Aware Calendar Engine
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Never assumes arbitrary class counts. Walks day-by-day from today to
              semester end, subtracting university holidays, festival breaks, and exam
              windows.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Legal & Security Conscious
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              We never bypass CAPTCHA, brute-force student accounts, or store raw
              passwords. Authenticated ERP resources safely link to the official
              student.gehu.ac.in portal.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 px-4 text-center text-xs text-slate-500 dark:text-slate-400 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="font-bold text-slate-700 dark:text-slate-300">
            GEHU Student Companion
          </span>{" "}
          — Academic Intelligence & Attendance Planner
        </div>
        <div className="flex items-center gap-4">
          <Link href="/privacy" className="hover:underline">
            Privacy & Legal Notice
          </Link>
          <Link href="/admin" className="hover:underline">
            Admin Sync
          </Link>
          <a
            href="https://gehu.ac.in"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline text-blue-600 dark:text-blue-400"
          >
            Official GEHU Website
          </a>
        </div>
      </footer>
    </div>
  );
}
