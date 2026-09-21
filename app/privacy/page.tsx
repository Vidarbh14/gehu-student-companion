"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Lock,
  Trash2,
  AlertTriangle,
  CheckCircle,
  FileText,
  ExternalLink,
} from "lucide-react";

export default function PrivacyPage() {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);

  const handleDeleteData = async () => {
    setDeleting(true);
    try {
      const res = await fetch("/api/profile/data", { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setDeleteMessage("✅ Your personal academic data has been completely erased.");
        setShowConfirmModal(false);
      }
    } catch (err: any) {
      setDeleteMessage("❌ Failed to delete data: " + err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-emerald-500" />
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Privacy & Security Architecture
          </h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Transparency guarantee regarding external access, authentication, and data retention.
        </p>
      </div>

      {deleteMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-900 dark:text-emerald-200">
          {deleteMessage}
        </div>
      )}

      {/* Security Principles Cards */}
      <div className="space-y-4">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-extrabold text-sm">
            <Lock className="w-4 h-4 text-blue-500" />
            <span>Strict Security & Anti-Abuse Standards</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            GEHU Student Companion is designed as a student academic intelligence layer.
            We explicitly adhere to the following security protocols:
          </p>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400 list-disc list-inside">
            <li>
              <strong>No CAPTCHA Bypassing:</strong> We do not automate CAPTCHA resolution or circumvent human verification tests.
            </li>
            <li>
              <strong>No Private Scraping:</strong> We do not log in to private student accounts or extract private student transcripts without explicit user session control.
            </li>
            <li>
              <strong>No Credential Storage:</strong> We never request or store your raw Graphic Era ERP passwords.
            </li>
            <li>
              <strong>Respectful Request Rates:</strong> Public scrapers respect server bandwidth, robots.txt, and cache responses using SHA256 content hashes.
            </li>
          </ul>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-extrabold text-sm">
            <FileText className="w-4 h-4 text-purple-500" />
            <span>Data Separation: Official vs Calculated</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Every piece of information shown in the application is transparently tagged:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
              <strong className="text-blue-600 dark:text-blue-400">Official GEHU Data:</strong>
              <p className="text-slate-500 mt-0.5">
                Datesheets, academic calendar PDF milestones, and public notice circulars fetched from gehu.ac.in.
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
              <strong className="text-emerald-600 dark:text-emerald-400">Calculated Predictions:</strong>
              <p className="text-slate-500 mt-0.5">
                Attendance freedom margins, recovery classes needed, and tomorrow impact models derived mathematically.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Delete My Data Section (Section 48) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-rose-500/10 border border-rose-500/20 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-rose-500 text-white shadow-md">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-rose-900 dark:text-rose-100">
              Delete My Academic Data
            </h3>
            <p className="text-xs text-rose-700 dark:text-rose-300">
              Permanently purge all your local attendance records, custom timetable entries, and notifications.
            </p>
          </div>
        </div>

        <p className="text-xs text-rose-800 dark:text-rose-300 leading-relaxed">
          In accordance with data minimization principles, you can wipe your student data
          at any time with a single click. This action is irreversible.
        </p>

        <div className="pt-2">
          <button
            onClick={() => setShowConfirmModal(true)}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 transition-all"
          >
            Delete My Data
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-extrabold">Confirm Data Deletion</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete all your attendance records and
              timetable slots? This cannot be undone.
            </p>

            <div className="flex justify-end gap-2 pt-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteData}
                disabled={deleting}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md shadow-rose-600/20"
              >
                {deleting ? "Purging Data..." : "Yes, Purge Everything"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
