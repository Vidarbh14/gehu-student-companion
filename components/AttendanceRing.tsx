"use client";

import React from "react";
import { motion } from "framer-motion";

interface AttendanceRingProps {
  percentage: number;
  target?: number;
  size?: number;
  strokeWidth?: number;
  showText?: boolean;
}

export const AttendanceRing: React.FC<AttendanceRingProps> = ({
  percentage,
  target = 75,
  size = 100,
  strokeWidth = 8,
  showText = true,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedPct = Math.max(0, Math.min(100, percentage));
  const offset = circumference - (clampedPct / 100) * circumference;

  let strokeColor = "#10b981"; // Safe - green
  if (percentage < target) {
    strokeColor = "#ef4444"; // Critical - red
  } else if (percentage < target + 2) {
    strokeColor = "#f97316"; // Risk - orange
  } else if (percentage < target + 5) {
    strokeColor = "#f59e0b"; // Watch - amber
  }

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-200 dark:text-slate-800"
          fill="transparent"
        />
        {/* Progress stroke */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeLinecap="round"
          fill="transparent"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </svg>
      {showText && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            {percentage}%
          </span>
          <span className="text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400">
            {percentage >= target ? "Target Met" : "Shortage"}
          </span>
        </div>
      )}
    </div>
  );
};
