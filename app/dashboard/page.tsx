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
  BookOpen,
  FlaskConical,
  Layers,
  Edit2,
  Trash2,
  Check,
  X,
  Info,
} from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { SourceBadge } from "@/components/SourceBadge";
import { AttendanceRing } from "@/components/AttendanceRing";
import { AuthModal } from "@/components/AuthModal";
import { apiFetch } from "@/lib/apiClient";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Subject tab filter: "ALL" | "THEORY" | "LAB"
  const [activeTab, setActiveTab] = useState<"ALL" | "THEORY" | "LAB">("ALL");

  // Edit Subject Modal
  const [editingSubject, setEditingSubject] = useState<any>(null);
  const [editCode, setEditCode] = useState("");
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState<"THEORY" | "LAB">("THEORY");
  const [editCredits, setEditCredits] = useState(4);
  const [editAttended, setEditAttended] = useState(0);
  const [editConducted, setEditConducted] = useState(0);

  // Add Subject Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSubCode, setNewSubCode] = useState("");
  const [newSubName, setNewSubName] = useState("");
  const [newSubType, setNewSubType] = useState<"THEORY" | "LAB">("THEORY");
  const [newSubCredits, setNewSubCredits] = useState(4);
  const [newSubAttended, setNewSubAttended] = useState(0);
  const [newSubConducted, setNewSubConducted] = useState(0);

  // Curriculum Selector Modal
  const [showCurriculumModal, setShowCurriculumModal] = useState(false);
  const [selectedSem, setSelectedSem] = useState("III");
  const [curriculumLoading, setCurriculumLoading] = useState(false);

  const fetchDashboard = async () => {
    try {
      const res = await apiFetch("/api/dashboard");
      const json = await res.json();
      if (json.success) {
        setData(json);
      } else if (json.unauthenticated) {
        setAuthModalOpen(true);
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

  const handleQuickMark = async (subjectId: string, isPresent: boolean) => {
    try {
      await apiFetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "quickMark", subjectId, isPresent }),
      });
      fetchDashboard();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSeedDefaultSubjects = async () => {
    try {
      await apiFetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "seedDefaultSubjects" }),
      });
      fetchDashboard();
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
      fetchDashboard();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSubject = async (subjectId: string) => {
    if (!confirm("Are you sure you want to delete this subject?")) {
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
      fetchDashboard();
    } catch (err) {
      console.error(err);
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
      fetchDashboard();
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
      fetchDashboard();
    } catch (err) {
      console.error(err);
    } finally {
      setCurriculumLoading(false);
    }
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
      <div className="max-w-xl mx-auto my-20 p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-center space-y-5 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">
          Please Log In with Your Student ID
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          Log in with your Graphic Era Hill University credentials or enter your roll number to access your real attendance, safe absences calculation, and weekly timetable.
        </p>
        <div className="pt-2">
          <button
            onClick={() => setAuthModalOpen(true)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/25 inline-flex items-center gap-2 transition-all"
          >
            <span>Log In with Student ID</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <AuthModal
          isOpen={authModalOpen}
          canClose={false}
          onSuccess={() => {
            setAuthModalOpen(false);
            fetchDashboard();
          }}
        />
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

  const subjectsList = attendance?.subjects || [];

  // Filter subjects based on active tab
  const filteredSubjects = subjectsList.filter((s: any) => {
    const isLab =
      s.type === "LAB" ||
      s.subjectCode?.toUpperCase().startsWith("P") ||
      s.subjectName?.toLowerCase().includes("lab");

    if (activeTab === "THEORY") return !isLab;
    if (activeTab === "LAB") return isLab;
    return true;
  });

  const theoryCount = subjectsList.filter((s: any) => {
    return !(
      s.type === "LAB" ||
      s.subjectCode?.toUpperCase().startsWith("P") ||
      s.subjectName?.toLowerCase().includes("lab")
    );
  }).length;

  const labCount = subjectsList.filter((s: any) => {
    return (
      s.type === "LAB" ||
      s.subjectCode?.toUpperCase().startsWith("P") ||
      s.subjectName?.toLowerCase().includes("lab")
    );
  }).length;

  const theoryData = attendance.theory || {
    percentage: attendance.overallPercentage,
    attended: attendance.totalAttended,
    conducted: attendance.totalConducted,
    status: attendance.overallStatus,
    canMiss: attendance.totalClassesCanMiss,
  };

  const labsData = attendance.labs || {
    percentage: 85,
    attended: 0,
    conducted: 0,
    status: "SAFE",
    canMiss: 0,
  };

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

      {/* Attendance Split Bar: Overall, Theory Lectures, Practical Labs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Overall Aggregate */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Overall Total
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {attendance.overallPercentage}%
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {attendance.totalAttended}/{attendance.totalConducted}
                </span>
              </div>
              <span className="text-[11px] text-blue-600 dark:text-blue-400 font-bold">
                {attendance.totalClassesCanMiss} classes safe to miss
              </span>
            </div>
          </div>
          <StatusBadge status={attendance.overallStatus} size="sm" />
        </div>

        {/* Theory Lectures */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Theory Lectures ({theoryCount})
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                  {theoryData.percentage}%
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {theoryData.attended}/{theoryData.conducted}
                </span>
              </div>
              <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold">
                {theoryData.canMiss} lectures safe to miss
              </span>
            </div>
          </div>
          <StatusBadge status={theoryData.status || "SAFE"} size="sm" />
        </div>

        {/* Practical Labs */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Practical Labs ({labCount})
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black text-teal-600 dark:text-teal-400">
                  {labsData.percentage}%
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {labsData.attended}/{labsData.conducted}
                </span>
              </div>
              <span className="text-[11px] text-teal-600 dark:text-teal-400 font-bold">
                {labsData.percentage >= 75 ? "Practical Exam Eligible" : "Practical Warning"}
              </span>
            </div>
          </div>
          <StatusBadge status={labsData.status || "SAFE"} size="sm" />
        </div>
      </div>

      {/* Primary KPI Grid (Section 23, 24) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {/* Card 1: Attendance Freedom */}
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
            {subjectsList.slice(0, 6).map((sub: any) => (
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
              <span>Manage & simulate all subjects</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Card 2: Dedicated "Can I Miss Tomorrow?" */}
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

        {/* Card 3: Next Exam Countdown */}
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

      {/* Section: Per-Subject Attendance Breakdown */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                <BookOpen className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Per-Subject Attendance Breakdown
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Your real-time attendance percentage, attended vs. conducted lectures, and safe miss calculations for each subject.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowCurriculumModal(true)}
              className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-all"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-500" />
              <span>Load GEHU Curriculum</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5 text-blue-500" />
              <span>Add Subject</span>
            </button>

            <Link
              href="/attendance"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 inline-flex items-center gap-1.5 transition-all"
            >
              <span>Simulator & Settings</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

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
            All Subjects ({subjectsList.length})
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

        {/* Subjects Grid */}
        {filteredSubjects.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No subjects registered yet for this student account.
            </p>
            <button
              onClick={handleSeedDefaultSubjects}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all inline-flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Load GEHU Semester Subjects</span>
            </button>
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
                  className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 transition-all hover:border-blue-300 dark:hover:border-blue-700 relative group"
                >
                  {/* Header */}
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

                  {/* Score & Ring */}
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="text-3xl font-black text-slate-900 dark:text-white">
                        {sub.currentPercentage}%
                      </div>
                      <span className="text-xs font-semibold text-slate-500">
                        {sub.attended} / {sub.conducted} classes attended
                      </span>
                    </div>
                    <AttendanceRing
                      percentage={sub.currentPercentage}
                      target={student.target.targetPercentage}
                      size={60}
                      strokeWidth={6}
                      showText={false}
                    />
                  </div>

                  {/* Absences / Margin details */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Classes you can miss now:</span>
                      <span
                        className={`font-black ${
                          sub.maxAbsencesAllowed > 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-500"
                        }`}
                      >
                        {sub.maxAbsencesAllowed > 0
                          ? `${sub.maxAbsencesAllowed} classes safe`
                          : "0 classes (Shortage risk)"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Safe future absences:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        up to {sub.maxFutureAbsences} classes
                      </span>
                    </div>
                  </div>

                  {/* Quick mark */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-400">
                      Quick Mark:
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQuickMark(sub.subjectId, true)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center gap-1 transition-all"
                        title="Mark Present"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>+1 Present</span>
                      </button>
                      <button
                        onClick={() => handleQuickMark(sub.subjectId, false)}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center gap-1 transition-all"
                        title="Mark Absent"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
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

      {/* Edit Subject Modal */}
      {editingSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Edit / Rename Subject
                </h3>
                <p className="text-xs text-slate-500">
                  Modify subject name, course code, or update conducted/attended totals.
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
                    <option value="THEORY">Theory Lecture</option>
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
          fetchDashboard();
        }}
      />
    </div>
  );
}
