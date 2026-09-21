"use client";

import React, { useState, useEffect } from "react";
import { User, Shield, Check, Save, RotateCcw, Building, BookOpen } from "lucide-react";
import { AuthModal } from "@/components/AuthModal";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>({
    name: "",
    campus: "Dehradun",
    course: "B.Tech",
    branch: "CSE",
    semester: "III",
    section: "A",
    rollNumber: "",
    universityId: "",
    academicYear: "2026-27",
    targetPercentage: 75,
    safetyBuffer: 2,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    fetch("/api/profile/data")
      .then((res) => res.json())
      .then((d) => {
        if (d.success && d.user) {
          setProfile({
            name: d.user.name,
            ...d.user.profile,
            targetPercentage: d.user.target?.targetPercentage || 75,
            safetyBuffer: d.user.target?.safetyBuffer || 2,
          });
        } else if (d.unauthenticated) {
          setAuthModalOpen(true);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/profile/data", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (data.success) {
        setMsg("✅ Profile settings saved successfully!");
      }
    } catch (err: any) {
      setMsg("❌ Failed to save: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Student Profile & Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Configure your academic details for personalized timetable and notice matching.
        </p>
      </div>

      {msg && (
        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs font-semibold text-blue-900 dark:text-blue-200">
          {msg}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Personal Details */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <User className="w-5 h-5 text-blue-500" />
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              Student Identification
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Full Name:
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                University ID:
              </label>
              <input
                type="text"
                value={profile.universityId || "GEHU/2024/CSE/1042"}
                onChange={(e) =>
                  setProfile({ ...profile, universityId: e.target.value })
                }
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Roll Number:
              </label>
              <input
                type="text"
                value={profile.rollNumber || "24150021"}
                onChange={(e) =>
                  setProfile({ ...profile, rollNumber: e.target.value })
                }
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Campus Location:
              </label>
              <select
                value={profile.campus || "Dehradun"}
                onChange={(e) =>
                  setProfile({ ...profile, campus: e.target.value })
                }
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              >
                <option value="Dehradun">Dehradun Campus</option>
                <option value="Bhimtal">Bhimtal Campus</option>
                <option value="Haldwani">Haldwani Campus</option>
              </select>
            </div>
          </div>
        </div>

        {/* Academic Program */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <BookOpen className="w-5 h-5 text-indigo-500" />
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              Course & Batch Information
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Course:
              </label>
              <input
                type="text"
                value={profile.course || "B.Tech"}
                onChange={(e) => setProfile({ ...profile, course: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Branch / Specialization:
              </label>
              <input
                type="text"
                value={profile.branch || "CSE"}
                onChange={(e) => setProfile({ ...profile, branch: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Semester:
              </label>
              <select
                value={profile.semester || "III"}
                onChange={(e) =>
                  setProfile({ ...profile, semester: e.target.value })
                }
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              >
                <option value="I">I Semester</option>
                <option value="II">II Semester</option>
                <option value="III">III Semester</option>
                <option value="IV">IV Semester</option>
                <option value="V">V Semester</option>
                <option value="VI">VI Semester</option>
                <option value="VII">VII Semester</option>
                <option value="VIII">VIII Semester</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving Changes..." : "Save Profile Details"}</span>
          </button>
        </div>
      </form>

      <AuthModal
        isOpen={authModalOpen}
        canClose={false}
        onSuccess={() => {
          setAuthModalOpen(false);
          window.location.reload();
        }}
      />
    </div>
  );
}
