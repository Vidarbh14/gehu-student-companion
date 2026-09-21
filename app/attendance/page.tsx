"use client";

import React, { useState, useEffect } from "react";
import {
  Clock,
  Plus,
  Sliders,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  RotateCcw,
  Check,
  X,
} from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { SourceBadge } from "@/components/SourceBadge";
import { AttendanceRing } from "@/components/AttendanceRing";
import { AuthModal } from "@/components/AuthModal";

export default function AttendancePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [targetSlider, setTargetSlider] = useState(75);
  const [bufferSlider, setBufferSlider] = useState(2);
  const [updatingSettings, setUpdatingSettings] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [newSubCode, setNewSubCode] = useState("");
  const [newSubName, setNewSubName] = useState("");
  const [newSubAttended, setNewSubAttended] = useState(0);
  const [newSubConducted, setNewSubConducted] = useState(0);

  const fetchAttendance = async () => {
    try {
      const res = await fetch("/api/attendance");
      const json = await res.json();
      if (json.success) {
        setData(json);
        setTargetSlider(json.target.targetPercentage);
        setBufferSlider(json.target.safetyBuffer);
      } else if (json.unauthenticated) {
        setAuthModalOpen(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDefaultSubjects = async () => {
    try {
      await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "seedDefaultSubjects" }),
      });
      fetchAttendance();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handleQuickMark = async (subjectId: string, isPresent: boolean) => {
    try {
      await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "quickMark",
          subjectId,
          isPresent,
        }),
      });
      fetchAttendance();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSettings = async () => {
    setUpdatingSettings(true);
    try {
      await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateTarget",
          targetPercentage: targetSlider,
          safetyBuffer: bufferSlider,
        }),
      });
      fetchAttendance();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingSettings(false);
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "createSubject",
          code: newSubCode,
          name: newSubName,
          initialAttended: newSubAttended,
          initialConducted: newSubConducted,
        }),
      });
      setShowAddModal(false);
      setNewSubCode("");
      setNewSubName("");
      fetchAttendance();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-6 animate-pulse">
        <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  const { target, overall, subjects } = data || {
    target: { targetPercentage: 75, safetyBuffer: 2, effectiveTarget: 77 },
    overall: { attended: 0, conducted: 0, percentage: 0, status: "SAFE", canMiss: 0 },
    subjects: [],
  };

  // Find subjects in critical or risk tier for recovery module
  const recoverySubjects = subjects.filter(
    (s: any) => s.status === "CRITICAL" || s.status === "RISK"
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Overall Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Attendance Intelligence
            </h1>
            <SourceBadge type="CALCULATED" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time mathematical forecasting, subject margins, and recovery roadmaps.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Subject</span>
          </button>
        </div>
      </div>

      {/* Settings Bar: Target & Safety Buffer (Section 11) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Attendance Policy & Safety Buffer Settings
              </h3>
              <p className="text-xs text-slate-500">
                Adjust university requirement threshold and personal safety margin.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                Effective Target
              </span>
              <span className="text-lg font-black text-blue-600 dark:text-blue-400">
                {targetSlider + bufferSlider}%
              </span>
            </div>
            <button
              onClick={handleSaveSettings}
              disabled={updatingSettings}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 text-white rounded-xl text-xs font-bold transition-all"
            >
              {updatingSettings ? "Saving..." : "Apply Settings"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Target Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-700 dark:text-slate-300">
                Official University Target:
              </span>
              <span className="text-blue-600 dark:text-blue-400">{targetSlider}%</span>
            </div>
            <input
              type="range"
              min={60}
              max={95}
              step={1}
              value={targetSlider}
              onChange={(e) => setTargetSlider(parseInt(e.target.value, 10))}
              className="w-full accent-blue-600 h-2 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>75% (GEHU Standard)</span>
              <span>80%</span>
              <span>85%</span>
              <span>90%</span>
            </div>
          </div>

          {/* Buffer Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-700 dark:text-slate-300">
                Safety Buffer:
              </span>
              <span className="text-emerald-600 dark:text-emerald-400">
                +{bufferSlider}% (Conservative Target: {targetSlider + bufferSlider}%)
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={10}
              step={1}
              value={bufferSlider}
              onChange={(e) => setBufferSlider(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-600 h-2 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0% (No buffer)</span>
              <span>+2% (Recommended)</span>
              <span>+5%</span>
              <span>+10%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Recovery Mode (Section 28) */}
      {recoverySubjects.length > 0 && (
        <div className="p-6 rounded-3xl bg-rose-500/10 border border-rose-500/20 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500 text-white shadow-md">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-rose-900 dark:text-rose-100">
                Attendance Recovery Mode Active
              </h3>
              <p className="text-xs text-rose-700 dark:text-rose-300">
                The following subjects require consecutive attendance without absence to
                meet the university {target.targetPercentage}% cutoff.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {recoverySubjects.map((sub: any) => (
              <div
                key={sub.subjectId}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {sub.subjectName}
                    </span>
                    <span className="text-xs text-slate-500 block">
                      {sub.subjectCode} • Current: {sub.currentPercentage}%
                    </span>
                  </div>
                  <StatusBadge status={sub.status} />
                </div>

                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/30 text-xs text-rose-800 dark:text-rose-200 font-medium">
                  Must attend next{" "}
                  <strong className="text-rose-600 dark:text-rose-400 text-sm">
                    {sub.recoveryClassesNeeded} classes
                  </strong>{" "}
                  consecutively without missing any lectures.
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Maximum additional absences: <strong>0 classes</strong></span>
                  <span className="text-rose-600 dark:text-rose-400 font-bold">
                    Risk of Debarment
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subject-Wise Cards Grid (Section 9, 10, 12, 14) */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-slate-900 dark:text-white">
          All Registered Subjects ({subjects.length})
        </h2>

        {subjects.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No subjects registered yet for this student account.
            </p>
            <button
              onClick={handleSeedDefaultSubjects}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all inline-flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Load GEHU Semester Subjects</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {subjects.map((sub: any) => (
              <div
                key={sub.subjectId}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-5 transition-all hover:border-slate-300 dark:hover:border-slate-700"
              >
              {/* Top row */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                      {sub.subjectCode}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500">
                      {sub.credits} Credits • {sub.type}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white leading-snug">
                    {sub.subjectName}
                  </h3>
                </div>
                <StatusBadge status={sub.status} size="sm" />
              </div>

              {/* Middle Metrics */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {sub.currentPercentage}%
                  </div>
                  <span className="text-xs text-slate-500">
                    {sub.attended} / {sub.conducted} classes attended
                  </span>
                </div>
                <AttendanceRing
                  percentage={sub.currentPercentage}
                  target={target.targetPercentage}
                  size={58}
                  strokeWidth={5}
                  showText={false}
                />
              </div>

              {/* Mathematical Insights */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Classes you can miss now:</span>
                  <span
                    className={`font-bold ${
                      sub.maxAbsencesAllowed > 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-500"
                    }`}
                  >
                    {sub.maxAbsencesAllowed > 0
                      ? `${sub.maxAbsencesAllowed} class${
                          sub.maxAbsencesAllowed > 1 ? "es" : ""
                        }`
                      : "0 classes"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Scheduled remaining:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {sub.remainingScheduledClasses} classes
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Safe future absences:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    up to {sub.maxFutureAbsences} classes
                  </span>
                </div>
              </div>

              {/* Quick Mark Attendance Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-slate-400">
                  Quick Mark:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleQuickMark(sub.subjectId, true)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center gap-1 transition-all"
                    title="Mark 1 Present"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>+1 Present</span>
                  </button>
                  <button
                    onClick={() => handleQuickMark(sub.subjectId, false)}
                    className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center gap-1 transition-all"
                    title="Mark 1 Absent"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>+1 Absent</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>

      {/* Add Subject Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Add Academic Subject
            </h3>
            <form onSubmit={handleCreateSubject} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Course Code:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TCS-305"
                  value={newSubCode}
                  onChange={(e) => setNewSubCode(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subject Name:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Artificial Intelligence"
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Attended:
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={newSubAttended}
                    onChange={(e) =>
                      setNewSubAttended(parseInt(e.target.value, 10) || 0)
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Conducted:
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={newSubConducted}
                    onChange={(e) =>
                      setNewSubConducted(parseInt(e.target.value, 10) || 0)
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
                >
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AuthModal
        isOpen={authModalOpen}
        canClose={false}
        onSuccess={() => {
          setAuthModalOpen(false);
          fetchAttendance();
        }}
      />
    </div>
  );
}
