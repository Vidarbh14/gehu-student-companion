"use client";

import React, { useState, useEffect } from "react";
import {
  Shield,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  Activity,
  Database,
} from "lucide-react";

export default function AdminPage() {
  const [sources, setSources] = useState<any[]>([]);
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingTarget, setSyncingTarget] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchSourceHealth = async () => {
    try {
      const res = await fetch("/api/sources");
      const data = await res.json();
      if (data.success) {
        setSources(data.sources);
        setRecentJobs(data.recentJobs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSourceHealth();
  }, []);

  const triggerSync = async (target: string) => {
    setSyncingTarget(target);
    setMessage(null);
    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`✅ Synchronization completed for: ${target}`);
        fetchSourceHealth();
      } else {
        setMessage(`❌ Sync failed: ${data.error}`);
      }
    } catch (err: any) {
      setMessage(`❌ Network error: ${err.message}`);
    } finally {
      setSyncingTarget(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Admin & Scraper Health Center
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              System Admin
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Monitor public GEHU source adapters, content change hashes, and automated jobs.
          </p>
        </div>

        <button
          onClick={() => triggerSync("ALL")}
          disabled={!!syncingTarget}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <RefreshCw
            className={`w-4 h-4 ${syncingTarget === "ALL" ? "animate-spin" : ""}`}
          />
          <span>{syncingTarget === "ALL" ? "Syncing All Sources..." : "Sync All Sources"}</span>
        </button>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs font-semibold text-blue-900 dark:text-blue-200">
          {message}
        </div>
      )}

      {/* Sources Health Cards Grid */}
      <div className="space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
          Data Sources Health Status ({sources.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {sources.map((src) => (
            <div
              key={src.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {src.type}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded ${
                      src.lastStatus === "SUCCESS"
                        ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                        : "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300"
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{src.lastStatus}</span>
                  </span>
                </div>

                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {src.name}
                </h4>

                <div className="space-y-1 text-xs text-slate-500">
                  <p>Records Stored: <strong>{src.recordsCount} items</strong></p>
                  <p className="truncate text-[11px] font-mono text-slate-400">
                    URL: {src.url}
                  </p>
                  {src.lastScrapedAt && (
                    <p className="text-[11px]">
                      Last Synced:{" "}
                      {new Date(src.lastScrapedAt).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => triggerSync(src.type)}
                  disabled={syncingTarget === src.type}
                  className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${
                      syncingTarget === src.type ? "animate-spin" : ""
                    }`}
                  />
                  <span>Sync {src.type}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scrape Job History Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            <span>Recent Ingestion & Scrape Jobs Log</span>
          </h3>
          <span className="text-xs text-slate-500">
            {recentJobs.length} Recent Tasks
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-y border-slate-100 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Items Found</th>
                <th className="py-3 px-4">New / Updated</th>
                <th className="py-3 px-4">Started At</th>
                <th className="py-3 px-4">Logs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentJobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                    {job.dataSource?.name || "Source"}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      {job.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold">{job.itemsFound}</td>
                  <td className="py-3 px-4 text-slate-500">
                    +{job.itemsNew} new, ~{job.itemsUpdated} updated
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {new Date(job.startedAt).toLocaleTimeString()}
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px] truncate max-w-xs">
                    {job.logs || "Completed successfully"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
