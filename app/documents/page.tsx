"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Lock,
  ExternalLink,
  Download,
  ShieldCheck,
  AlertCircle,
  FileCheck,
} from "lucide-react";
import { SourceBadge } from "@/components/SourceBadge";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/documents")
      .then((res) => res.json())
      .then((d) => {
        if (d.documents) setDocuments(d.documents);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Official Examination Documents
            </h1>
            <SourceBadge
              type="OFFICIAL"
              sourceName="GEHU Student ERP Portal"
              sourceUrl="https://student.gehu.ac.in"
            />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Verified university document links, admit card windows, and seating plans.
          </p>
        </div>
      </div>

      {/* Security Transparency Callout (Section 2 & 20) */}
      <div className="p-6 rounded-3xl bg-blue-500/10 border border-blue-500/20 space-y-2">
        <div className="flex items-center gap-2 text-blue-900 dark:text-blue-200">
          <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-extrabold text-sm sm:text-base">
            Official Authentication Notice
          </h3>
        </div>
        <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed max-w-3xl">
          To protect student identity and adhere to academic regulations, this companion
          <strong> never fabricates or downloads private admit cards without authorization</strong>.
          Clicking below directs you securely to the official GEHU Student Portal
          (<code>student.gehu.ac.in</code>) where you can log in directly.
        </p>
      </div>

      {/* Documents List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 col-span-2">
            Loading university documents...
          </div>
        ) : (
          documents.map((doc) => (
            <div
              key={doc.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 transition-all hover:border-blue-300 dark:hover:border-blue-700"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                    {doc.type.replace("_", " ")}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      doc.status === "AVAILABLE"
                        ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                        : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                    }`}
                  >
                    {doc.status}
                  </span>
                </div>

                <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {doc.title}
                </h4>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Published: {new Date(doc.publishedAt).toLocaleDateString()} • Campus:{" "}
                  {doc.campus}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-slate-400" />
                  <span>Requires ERP Login</span>
                </span>

                <a
                  href={doc.officialPortalUrl || "https://student.gehu.ac.in"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm inline-flex items-center gap-1.5 transition-all"
                >
                  <span>Open Official Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
