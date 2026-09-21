"use client";

import React, { useState, useEffect } from "react";
import {
  Sliders,
  TrendingUp,
  Target,
  Sparkles,
  Info,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";
import { StatusBadge } from "@/components/StatusBadge";
import { SourceBadge } from "@/components/SourceBadge";

export default function SimulatorPage() {
  const [attended, setAttended] = useState(36);
  const [conducted, setConducted] = useState(42);
  const [target, setTarget] = useState(75);
  const [buffer, setBuffer] = useState(2);
  const [missClasses, setMissClasses] = useState(3);
  const [goalPct, setGoalPct] = useState(80);
  const [simulationData, setSimulationData] = useState<any>(null);
  const [forecastCurve, setForecastCurve] = useState<any[]>([]);

  const runSimulation = async () => {
    try {
      const res = await fetch("/api/attendance/what-if", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attended,
          conducted,
          target,
          buffer,
          missClasses,
          goalPercentage: goalPct,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSimulationData(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchForecast = async () => {
    try {
      const res = await fetch("/api/attendance/forecast");
      const data = await res.json();
      if (data.success) {
        setForecastCurve(data.forecastPoints);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    runSimulation();
    fetchForecast();
  }, [attended, conducted, target, buffer, missClasses, goalPct]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              What-If Attendance Simulator
            </h1>
            <SourceBadge type="CALCULATED" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Simulate future absences, graph projections, and plan recovery milestones.
          </p>
        </div>
      </div>

      {/* Simulator Inputs & Result Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Column */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Sliders className="w-5 h-5 text-blue-500" />
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              Simulation Parameters
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            {/* Attended & Conducted */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Classes Attended (A):
                </label>
                <input
                  type="number"
                  min={0}
                  max={conducted}
                  value={attended}
                  onChange={(e) =>
                    setAttended(
                      Math.min(
                        conducted,
                        Math.max(0, parseInt(e.target.value, 10) || 0)
                      )
                    )
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Conducted (C):
                </label>
                <input
                  type="number"
                  min={1}
                  value={conducted}
                  onChange={(e) =>
                    setConducted(Math.max(1, parseInt(e.target.value, 10) || 1))
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center font-bold"
                />
              </div>
            </div>

            {/* Target Percentage */}
            <div className="space-y-1">
              <div className="flex justify-between font-bold">
                <span className="text-slate-700 dark:text-slate-300">
                  Target Percentage:
                </span>
                <span className="text-blue-600 dark:text-blue-400">{target}%</span>
              </div>
              <input
                type="range"
                min={65}
                max={90}
                value={target}
                onChange={(e) => setTarget(parseInt(e.target.value, 10))}
                className="w-full accent-blue-600 h-2 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Slider: Classes to Miss */}
            <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between font-bold">
                <span className="text-slate-700 dark:text-slate-300">
                  Hypothetical Absences to Miss:
                </span>
                <span className="text-rose-500 font-extrabold">
                  +{missClasses} classes
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={15}
                value={missClasses}
                onChange={(e) => setMissClasses(parseInt(e.target.value, 10))}
                className="w-full accent-rose-500 h-2 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Goal Planner Input */}
            <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between font-bold">
                <span className="text-slate-700 dark:text-slate-300">
                  Desired Goal Percentage:
                </span>
                <span className="text-indigo-600 dark:text-indigo-400">
                  {goalPct}%
                </span>
              </div>
              <input
                type="range"
                min={75}
                max={95}
                value={goalPct}
                onChange={(e) => setGoalPct(parseInt(e.target.value, 10))}
                className="w-full accent-indigo-600 h-2 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Results & Simulator Feedback Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Simulation Output Card (Section 26) */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Simulation Projection
            </span>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  If you miss {missClasses} more class
                  {missClasses === 1 ? "" : "es"}:
                </h3>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl sm:text-4xl font-black text-blue-600 dark:text-blue-400">
                    {simulationData?.simulation.projectedPercentage}%
                  </span>
                  <span className="text-xs text-slate-500">
                    (from current {simulationData?.current.percentage}%)
                  </span>
                </div>
              </div>

              <div className="text-right">
                <StatusBadge
                  status={simulationData?.simulation.projectedStatus || "SAFE"}
                  size="lg"
                />
                <span className="block text-[11px] text-slate-400 mt-1 font-medium">
                  {simulationData?.simulation.isAboveTarget
                    ? `Comfortably meets ${target}% requirement`
                    : `BREACHES ${target}% university cutoff!`}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-3">
              <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Formula: Attended ({attended}) / (Conducted {conducted} + Missed{" "}
                {missClasses}) = {attended} / {conducted + missClasses} ={" "}
                {simulationData?.simulation.projectedPercentage}%.
              </p>
            </div>
          </div>

          {/* Goal Planner Card (Section 27) */}
          <div className="p-6 rounded-3xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-3">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-extrabold text-sm text-indigo-900 dark:text-indigo-200">
                Attendance Goal Planner ({goalPct}%)
              </h3>
            </div>
            <p className="text-xs text-indigo-800 dark:text-indigo-300 leading-relaxed font-medium">
              {simulationData?.goalPlanner.explanation}
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-300 pt-1">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>
                Required Future Attendance:{" "}
                {simulationData?.goalPlanner.classesNeededConsecutively} consecutive
                lectures
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Forecast Curve Graph (Section 15) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <span>Future Attendance Forecast Curves</span>
            </h3>
            <p className="text-xs text-slate-500">
              Interactive projection comparing regular attendance vs simulated upcoming absences.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            Target Threshold: {target}%
          </span>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={forecastCurve}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
              <YAxis
                domain={[50, 100]}
                stroke="#94a3b8"
                fontSize={11}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.9)",
                  borderColor: "#334155",
                  borderRadius: "0.75rem",
                  color: "#fff",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
              <ReferenceLine
                y={target}
                stroke="#ef4444"
                strokeDasharray="5 5"
                label={{
                  value: `${target}% Target`,
                  fill: "#ef4444",
                  fontSize: 11,
                  position: "insideTopRight",
                }}
              />
              <Line
                type="monotone"
                dataKey="ifAttendAll"
                name="Attend All Future"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="ifMissOneNext"
                name="Miss 1 Lecture"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="3 3"
              />
              <Line
                type="monotone"
                dataKey="ifMissTwoNext"
                name="Miss 2 Lectures"
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
