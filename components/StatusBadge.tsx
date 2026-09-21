import React from "react";
import { AttendanceStatus } from "@/types";
import { CheckCircle2, AlertCircle, AlertTriangle, XCircle } from "lucide-react";

interface StatusBadgeProps {
  status: AttendanceStatus;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = "md",
  showIcon = true,
}) => {
  const configs = {
    SAFE: {
      label: "SAFE",
      bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      icon: CheckCircle2,
    },
    WATCH: {
      label: "WATCH",
      bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      icon: AlertCircle,
    },
    RISK: {
      label: "RISK",
      bg: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
      icon: AlertTriangle,
    },
    CRITICAL: {
      label: "CRITICAL",
      bg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
      icon: XCircle,
    },
  };

  const config = configs[status] || configs.SAFE;
  const Icon = config.icon;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs font-semibold gap-1",
    md: "px-2.5 py-1 text-xs font-bold gap-1.5",
    lg: "px-3.5 py-1.5 text-sm font-bold gap-2",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ${config.bg} ${sizeClasses[size]} transition-all`}
    >
      {showIcon && <Icon className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />}
      <span>{config.label}</span>
    </span>
  );
};
