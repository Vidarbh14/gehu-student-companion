"use client";

import React, { useState, useEffect } from "react";
import {
  Lock,
  User,
  ShieldCheck,
  RefreshCw,
  ArrowRight,
  Sparkles,
  Building,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  KeyRound,
} from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onSuccess?: (user: any) => void;
  onClose?: () => void;
  canClose?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onSuccess,
  onClose,
  canClose = false,
}) => {
  const [tab, setTab] = useState<"erp" | "manual">("erp");

  // ERP Form State
  const [erpUsername, setErpUsername] = useState("");
  const [erpPassword, setErpPassword] = useState("");
  const [erpCaptcha, setErpCaptcha] = useState("");
  const [captchaImg, setCaptchaImg] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<string | null>(null);
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const [erpSubmitting, setErpSubmitting] = useState(false);
  const [erpError, setErpError] = useState<string | null>(null);

  // Manual Profile State
  const [name, setName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [campus, setCampus] = useState("Dehradun");
  const [course, setCourse] = useState("B.Tech");
  const [branch, setBranch] = useState("CSE");
  const [semester, setSemester] = useState("III");
  const [section, setSection] = useState("A");
  const [targetPercentage, setTargetPercentage] = useState("75");
  const [safetyBuffer, setSafetyBuffer] = useState("2");
  const [manualSubmitting, setManualSubmitting] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);

  // Fetch live GEHU ERP Captcha
  const fetchCaptcha = async () => {
    setCaptchaLoading(true);
    setErpError(null);
    try {
      const res = await fetch("/api/auth/gehu-captcha");
      const data = await res.json();
      if (data.success && data.captchaDataUrl) {
        setCaptchaImg(data.captchaDataUrl);
        setSessionData(data.sessionData);
        setErpCaptcha("");
      } else {
        setErpError(data.error || "Failed to load captcha from student portal.");
      }
    } catch (err: any) {
      setErpError("Cannot connect to student.gehu.ac.in: " + err.message);
    } finally {
      setCaptchaLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && tab === "erp" && !captchaImg) {
      fetchCaptcha();
    }
  }, [isOpen, tab]);

  if (!isOpen) return null;

  const handleErpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!erpUsername || !erpPassword || !erpCaptcha) {
      setErpError("Please fill in Student ID, Password, and Captcha.");
      return;
    }

    setErpSubmitting(true);
    setErpError(null);

    try {
      const res = await fetch("/api/auth/gehu-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: erpUsername,
          password: erpPassword,
          captcha: erpCaptcha,
          sessionData,
        }),
      });

      const data = await res.json();

      if (data.success) {
        if (onSuccess) onSuccess(data.user);
        window.location.reload();
      } else {
        setErpError(data.error || "Login failed. Please check credentials and captcha.");
        fetchCaptcha(); // Refresh captcha on failure
      }
    } catch (err: any) {
      setErpError("Connection error: " + err.message);
      fetchCaptcha();
    } finally {
      setErpSubmitting(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !rollNumber.trim()) {
      setManualError("Please enter your Full Name and University Roll Number.");
      return;
    }

    setManualSubmitting(true);
    setManualError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          rollNumber,
          campus,
          course,
          branch,
          semester,
          section,
          targetPercentage,
          safetyBuffer,
        }),
      });

      const data = await res.json();

      if (data.success) {
        if (onSuccess) onSuccess(data.user);
        window.location.reload();
      } else {
        setManualError(data.error || "Failed to set up profile.");
      }
    } catch (err: any) {
      setManualError("Error: " + err.message);
    } finally {
      setManualSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl my-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-blue-300" />
              </div>
              <div>
                <h2 className="text-lg font-black tracking-tight">
                  Student Verification & Login
                </h2>
                <p className="text-[11px] text-blue-200/80">
                  Graphic Era Hill University • Academic Portal
                </p>
              </div>
            </div>

            {canClose && onClose && (
              <button
                onClick={onClose}
                className="text-white/60 hover:text-white text-xs font-bold px-2.5 py-1 rounded-lg bg-white/10"
              >
                Close
              </button>
            )}
          </div>

          {/* Tab Selector */}
          <div className="grid grid-cols-2 gap-2 mt-5 p-1 bg-black/20 rounded-xl">
            <button
              onClick={() => setTab("erp")}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                tab === "erp"
                  ? "bg-blue-600 text-white shadow"
                  : "text-blue-200 hover:text-white"
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Official ERP Login</span>
            </button>
            <button
              onClick={() => setTab("manual")}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                tab === "manual"
                  ? "bg-blue-600 text-white shadow"
                  : "text-blue-200 hover:text-white"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Enter My Details</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Official GEHU ERP Login */}
        {tab === "erp" && (
          <form onSubmit={handleErpSubmit} className="p-6 space-y-4">
            <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-[11px] text-blue-900 dark:text-blue-200 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <strong>Direct Official Portal Sync:</strong> Authenticate with your official{" "}
                <code>student.gehu.ac.in</code> credentials and captcha to pull your real attendance
                and course details automatically.
              </div>
            </div>

            {erpError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{erpError}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Student User ID / Roll Number:
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. 24150021 or GEHU/2024/CSE/1042"
                    value={erpUsername}
                    onChange={(e) => setErpUsername(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Official ERP Password:
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="Enter your student ERP password"
                    value={erpPassword}
                    onChange={(e) => setErpPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Official Captcha Box */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Official Security Captcha:
                  </label>
                  <button
                    type="button"
                    onClick={fetchCaptcha}
                    disabled={captchaLoading}
                    className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 font-semibold"
                  >
                    <RefreshCw
                      className={`w-3 h-3 ${captchaLoading ? "animate-spin" : ""}`}
                    />
                    <span>Refresh Captcha</span>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-12 min-w-[170px] bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden">
                    {captchaLoading ? (
                      <span className="text-[10px] text-slate-400">Loading captcha...</span>
                    ) : captchaImg ? (
                      <img
                        src={captchaImg}
                        alt="GEHU Captcha"
                        className="h-full object-contain"
                      />
                    ) : (
                      <span className="text-[10px] text-rose-500">Captcha failed</span>
                    )}
                  </div>

                  <input
                    type="text"
                    required
                    maxLength={8}
                    placeholder="Enter captcha text"
                    value={erpCaptcha}
                    onChange={(e) => setErpCaptcha(e.target.value)}
                    className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono tracking-widest text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={erpSubmitting || captchaLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all"
              >
                {erpSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Connecting to student.gehu.ac.in...</span>
                  </>
                ) : (
                  <>
                    <span>Log In & Load My Real Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Manual Student Identification Setup */}
        {tab === "manual" && (
          <form onSubmit={handleManualSubmit} className="p-6 space-y-4">
            <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-[11px] text-indigo-900 dark:text-indigo-200 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <strong>Direct Identification:</strong> Enter your real student details to instantly
                start calculating attendance, margins, and timetable projections.
              </div>
            </div>

            {manualError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{manualError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Your Full Name:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vidarbh Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  University Roll Number / ID:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 24150021"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Campus:
                </label>
                <select
                  value={campus}
                  onChange={(e) => setCampus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="Dehradun">Dehradun Campus</option>
                  <option value="Bhimtal">Bhimtal Campus</option>
                  <option value="Haldwani">Haldwani Campus</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Course & Branch:
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <input
                    type="text"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    placeholder="Course"
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    placeholder="Branch"
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Semester & Section:
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="I">I Sem</option>
                    <option value="II">II Sem</option>
                    <option value="III">III Sem</option>
                    <option value="IV">IV Sem</option>
                    <option value="V">V Sem</option>
                    <option value="VI">VI Sem</option>
                    <option value="VII">VII Sem</option>
                    <option value="VIII">VIII Sem</option>
                  </select>
                  <input
                    type="text"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    placeholder="Sec (e.g. A)"
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Target Attendance & Buffer:
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <input
                    type="number"
                    value={targetPercentage}
                    onChange={(e) => setTargetPercentage(e.target.value)}
                    placeholder="75%"
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <input
                    type="number"
                    value={safetyBuffer}
                    onChange={(e) => setSafetyBuffer(e.target.value)}
                    placeholder="+2% Buffer"
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={manualSubmitting}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all"
              >
                {manualSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Setting up your real student dashboard...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Launch My Attendance Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
