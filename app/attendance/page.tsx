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
  Edit2,
  Trash2,
  FlaskConical,
  BookOpen,
  Layers,
  Sparkles,
  Info,
} from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { SourceBadge } from "@/components/SourceBadge";
import { AttendanceRing } from "@/components/AttendanceRing";
import { AuthModal } from "@/components/AuthModal";
import { apiFetch } from "@/lib/apiClient";

export default function AttendancePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [targetSlider, setTargetSlider] = useState(75);
  const [bufferSlider, setBufferSlider] = useState(2);
  const [updatingSettings, setUpdatingSettings] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Tab filter: "ALL" | "THEORY" | "LAB"
  const [activeTab, setActiveTab] = useState<"ALL" | "THEORY" | "LAB">("ALL");

  // Add Subject Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSubCode, setNewSubCode] = useState("");
  const [newSubName, setNewSubName] = useState("");
  const [newSubType, setNewSubType] = useState<"THEORY" | "LAB">("THEORY");
  const [newSubCredits, setNewSubCredits] = useState(4);
  const [newSubAttended, setNewSubAttended] = useState(0);
  const [newSubConducted, setNewSubConducted] = useState(0);

  // Edit Subject Modal
  const [editingSubject, setEditingSubject] = useState<any>(null);
  const [editCode, setEditCode] = useState("");
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState<"THEORY" | "LAB">("THEORY");
  const [editCredits, setEditCredits] = useState(4);
  const [editAttended, setEditAttended] = useState(0);
  const [editConducted, setEditConducted] = useState(0);

  // Curriculum Selector Modal
  const [showCurriculumModal, setShowCurriculumModal] = useState(false);
  const [selectedSem, setSelectedSem] = useState("III");
  const [curriculumLoading, setCurriculumLoading] = useState(false);

  const fetchAttendance = async () => {
    try {
      const res = await apiFetch("/api/attendance");
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

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handleSeedDefaultSubjects = async () => {
    try {
      await apiFetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "seedDefaultSubjects" }),
      });
      fetchAttendance();
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickMark = async (subjectId: string, isPresent: boolean) => {
    try {
      await apiFetch("/api/attendance", {
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
      await apiFetch("/api/attendance", {
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
      await apiFetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "createSubject",
          code: newSubCode,
          name: newSubName,
          type: newSubType,
          credits: newSubCredits,
          initialAttended: newSubAttended,
          initialConducted: newSubConducted,
        }),
      });
      setShowAddModal(false);
      setNewSubCode("");
      setNewSubName("");
      setNewSubAttended(0);
      setNewSubConducted(0);
      fetchAttendance();
    } catch (err) {
      console.error(err);
    }
  };

  const openEditModal = (sub: any) => {
    setEditingSubject(sub);
    setEditCode(sub.subjectCode);
    setEditName(sub.subjectName);
    setEditType(sub.type === "LAB" ? "LAB" : "THEORY");
    setEditCredits(sub.credits || (sub.type === "LAB" ? 1 : 4));
    setEditAttended(sub.attended);
    setEditConducted(sub.conducted);
  };

  const handleUpdateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject) return;

    try {
      await apiFetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateSubject",
          subjectId: editingSubject.subjectId,
          code: editCode,
          name: editName,
          type: editType,
          credits: editCredits,
          attended: editAttended,
          conducted: editConducted,
        }),
      });
      setEditingSubject(null);
      fetchAttendance();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSubject = async (subjectId: string) => {
    if (!confirm("Are you sure you want to delete this subject? All records will be removed.")) {
      return;
    }

    try {
      await apiFetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "deleteSubject",
          subjectId,
        }),
      });
      setEditingSubject(null);
      fetchAttendance();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLoadCurriculum = async (sem: string) => {
    setCurriculumLoading(true);
    try {
      await apiFetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "loadCurriculum",
          semester: sem,
        }),
      });
      setShowCurriculumModal(false);
      fetchAttendance();
    } catch (err) {
      console.error(err);
    } finally {
      setCurriculumLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-6 animate-pulse">
        <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  const { target, overall, theory, labs, subjects } = data || {
    target: { targetPercentage: 75, safetyBuffer: 2, effectiveTarget: 77 },
    overall: { attended: 0, conducted: 0, percentage: 0, status: "SAFE", canMiss: 0 },
    theory: { attended: 0, conducted: 0, percentage: 0, status: "SAFE", canMiss: 0, count: 0 },
    labs: { attended: 0, conducted: 0, percentage: 0, status: "SAFE", canMiss: 0, count: 0 },
    subjects: [],
  };

  // Filter subjects based on active tab
  const filteredSubjects = (subjects || []).filter((s: any) => {
    const isLab =
      s.type === "LAB" ||
      s.subjectCode?.toUpperCase().startsWith("P") ||
      s.subjectName?.toLowerCase().includes("lab");

    if (activeTab === "THEORY") return !isLab;
    if (activeTab === "LAB") return isLab;
    return true;
  });

  const theoryCount = (subjects || []).filter((s: any) => {
    return !(
      s.type === "LAB" ||
      s.subjectCode?.toUpperCase().startsWith("P") ||
      s.subjectName?.toLowerCase().includes("lab")
    );
  }).length;

  const labCount = (subjects || []).filter((s: any) => {
    return (
      s.type === "LAB" ||
      s.subjectCode?.toUpperCase().startsWith("P") ||
      s.subjectName?.toLowerCase().includes("lab")
    );
  }).length;

  // Find subjects in critical or risk tier for recovery module
  const recoverySubjects = (subjects || []).filter(
    (s: any) => s.status === "CRITICAL" || s.status === "RISK"
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Overall Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Official Attendance & Lab Tracking
            </h1>
            <SourceBadge type="CALCULATED" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time university attendance calculation for Theory lectures and Practical Labs separately.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowCurriculumModal(true)}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-all"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-500" />
            <span>Load Semester Curriculum</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Subject</span>
          </button>
        </div>
      </div>

      {/* 3-Part Attendance High-Level Metrics (Overall, Theory, Labs) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Combined Overall */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Overall Aggregate
                </h3>
                <p className="text-[11px] text-slate-500">
                  {subjects?.length || 0} Total Courses
                </p>
              </div>
            </div>
            <StatusBadge status={overall?.status || "SAFE"} size="sm" />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">
                {overall?.percentage ?? 0}%
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {overall?.attended ?? 0} of {overall?.conducted ?? 0} sessions
              </p>
            </div>
            <AttendanceRing
              percentage={overall?.percentage ?? 0}
              target={target?.targetPercentage ?? 75}
              size={56}
              strokeWidth={5}
              showText={false}
            />
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500">Overall Miss Margin:</span>
            <span className="font-bold text-blue-600 dark:text-blue-400">
              {overall?.canMiss ?? 0} classes safe
            </span>
          </div>
        </div>

        {/* Card 2: Theory Lectures */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Theory Lectures
                </h3>
                <p className="text-[11px] text-slate-500">
                  {theory?.count ?? theoryCount} Theory Subjects
                </p>
              </div>
            </div>
            <StatusBadge status={theory?.status || "SAFE"} size="sm" />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
                {theory?.percentage ?? 0}%
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {theory?.attended ?? 0} of {theory?.conducted ?? 0} lectures
              </p>
            </div>
            <AttendanceRing
              percentage={theory?.percentage ?? 0}
              target={target?.targetPercentage ?? 75}
              size={56}
              strokeWidth={5}
              showText={false}
            />
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500">Theory Miss Margin:</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">
              {theory?.canMiss ?? 0} lectures safe
            </span>
          </div>
        </div>

        {/* Card 3: Practical Labs */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
                <FlaskConical className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Practical Labs
                </h3>
                <p className="text-[11px] text-slate-500">
                  {labs?.count ?? labCount} Official Labs
                </p>
              </div>
            </div>
            <StatusBadge status={labs?.status || "SAFE"} size="sm" />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-black text-teal-600 dark:text-teal-400">
                {labs?.percentage ?? 0}%
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {labs?.attended ?? 0} of {labs?.conducted ?? 0} practicals
              </p>
            </div>
            <AttendanceRing
              percentage={labs?.percentage ?? 0}
              target={target?.targetPercentage ?? 75}
              size={56}
              strokeWidth={5}
              showText={false}
            />
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  (labs?.percentage ?? 0) >= 75 ? "bg-emerald-500" : "bg-rose-500"
                }`}
              />
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                {(labs?.percentage ?? 0) >= 75
                  ? "Eligible for Practical Exams"
                  : "Debarment Warning"}
              </span>
            </div>
            <span className="font-bold text-teal-600 dark:text-teal-400">
              {labs?.canMiss ?? 0} lab sessions safe
            </span>
          </div>
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

      {/* Attendance Recovery Mode */}
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

      {/* Subject-Wise Cards Grid with Filter Tabs & Actions */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Tab Filters */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 w-fit">
            <button
              onClick={() => setActiveTab("ALL")}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "ALL"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              All Subjects ({subjects?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("THEORY")}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "THEORY"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Theory ({theoryCount})</span>
            </button>
            <button
              onClick={() => setActiveTab("LAB")}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "LAB"
                  ? "bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Practical Labs ({labCount})</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSeedDefaultSubjects}
              className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1 font-medium transition-colors"
              title="Re-seed standard subjects"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Defaults</span>
            </button>
          </div>
        </div>

        {filteredSubjects.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No subjects found in this filter category.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setShowCurriculumModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all inline-flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                <span>Load Official Curriculum</span>
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700"
              >
                + Add Subject
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSubjects.map((sub: any) => {
              const isLab =
                sub.type === "LAB" ||
                sub.subjectCode?.toUpperCase().startsWith("P") ||
                sub.subjectName?.toLowerCase().includes("lab");

              return (
                <div
                  key={sub.subjectId}
                  className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-5 transition-all hover:border-blue-300 dark:hover:border-blue-700 relative group"
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                            isLab
                              ? "bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60"
                              : "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60"
                          }`}
                        >
                          {sub.subjectCode}
                        </span>
                        <span
                          className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                            isLab
                              ? "bg-teal-500/10 text-teal-600 dark:text-teal-400"
                              : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                          }`}
                        >
                          {isLab ? "Practical Lab" : "Theory"}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400">
                          • {sub.credits || (isLab ? 1 : 4)} Cr
                        </span>
                      </div>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white leading-snug">
                        {sub.subjectName}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditModal(sub)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                        title="Edit / Rename Subject"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <StatusBadge status={sub.status} size="sm" />
                    </div>
                  </div>

                  {/* Middle Metrics */}
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="text-2xl font-black text-slate-900 dark:text-white">
                        {sub.currentPercentage}%
                      </div>
                      <span className="text-xs text-slate-500">
                        {sub.attended} / {sub.conducted} sessions attended
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
                            } safe`
                          : "0 classes safe"}
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
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Subject Modal */}
      {editingSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Edit Subject & Attendance
                </h3>
                <p className="text-xs text-slate-500">
                  Rename subject, change course code, or update conducted/attended totals.
                </p>
              </div>
              <button
                onClick={() => setEditingSubject(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubject} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subject Name:
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Course Code:
                  </label>
                  <input
                    type="text"
                    required
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value.toUpperCase())}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Course Type:
                  </label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  >
                    <option value="THEORY">Theory Course</option>
                    <option value="LAB">Practical Lab</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Attended:
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editAttended}
                    onChange={(e) => setEditAttended(parseInt(e.target.value, 10) || 0)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Conducted:
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editConducted}
                    onChange={(e) => setEditConducted(parseInt(e.target.value, 10) || 0)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Credits:
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={editCredits}
                    onChange={(e) => setEditCredits(parseInt(e.target.value, 10) || 1)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center font-bold text-sm"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Calculated Percentage:</span>
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {editConducted > 0 ? Math.round((editAttended / editConducted) * 1000) / 10 : 0}%
                </span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => handleDeleteSubject(editingSubject.subjectId)}
                  className="px-3 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold rounded-xl flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Subject</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingSubject(null)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Subject Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Add Academic Subject / Lab
                </h3>
                <p className="text-xs text-slate-500">
                  Register a Theory subject or Practical Lab to your attendance dashboard.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubject} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Course Code:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TCS-301 or PCS-301"
                  value={newSubCode}
                  onChange={(e) => {
                    const code = e.target.value.toUpperCase();
                    setNewSubCode(code);
                    if (code.startsWith("P")) {
                      setNewSubType("LAB");
                      setNewSubCredits(1);
                    } else if (code.startsWith("T")) {
                      setNewSubType("THEORY");
                      setNewSubCredits(4);
                    }
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subject Name:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Data Structures Laboratory"
                  value={newSubName}
                  onChange={(e) => {
                    const name = e.target.value;
                    setNewSubName(name);
                    if (name.toLowerCase().includes("lab")) {
                      setNewSubType("LAB");
                      setNewSubCredits(1);
                    }
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Course Type:
                  </label>
                  <select
                    value={newSubType}
                    onChange={(e) => {
                      const type = e.target.value as any;
                      setNewSubType(type);
                      setNewSubCredits(type === "LAB" ? 1 : 4);
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  >
                    <option value="THEORY">Theory Lecture</option>
                    <option value="LAB">Practical Lab</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Credits:
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={newSubCredits}
                    onChange={(e) => setNewSubCredits(parseInt(e.target.value, 10) || 1)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center font-bold"
                  />
                </div>
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

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md"
                >
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Curriculum Selector Modal */}
      {showCurriculumModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Load Official GEHU Curriculum
                  </h3>
                  <p className="text-xs text-slate-500">
                    Instantly load official B.Tech CSE subjects & practical labs for your semester.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCurriculumModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2.5 pt-2">
              {[
                { sem: "I", title: "Semester I", subs: "Maths, Physics, C-Prog, Labs" },
                { sem: "II", title: "Semester II", subs: "Chemistry, Electronics, Workshop" },
                { sem: "III", title: "Semester III", subs: "DSA, OS, Discrete, Logic, Labs" },
                { sem: "IV", title: "Semester IV", subs: "Algorithms, Automata, Java, Micro" },
                { sem: "V", title: "Semester V", subs: "DBMS, Networks, SE, Web, Labs" },
                { sem: "VI", title: "Semester VI", subs: "Compiler, Cloud, ML, Labs" },
              ].map((item) => (
                <button
                  key={item.sem}
                  type="button"
                  onClick={() => setSelectedSem(item.sem)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    selectedSem === item.sem
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 shadow-sm ring-1 ring-blue-500"
                      : "border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                  }`}
                >
                  <div className="font-black text-sm">{item.title}</div>
                  <div className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">
                    {item.subs}
                  </div>
                </button>
              ))}
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              <span>
                Loading this curriculum will configure your subject list to match Graphic Era Hill University's official course codes and labs for <strong>Semester {selectedSem}</strong>.
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowCurriculumModal(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={curriculumLoading}
                onClick={() => handleLoadCurriculum(selectedSem)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all flex items-center gap-1.5"
              >
                {curriculumLoading ? (
                  <span>Loading...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Apply Semester {selectedSem} Curriculum</span>
                  </>
                )}
              </button>
            </div>
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
