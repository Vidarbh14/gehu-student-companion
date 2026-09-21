import React from "react";
import { ExternalLink, ShieldCheck, UserCheck, Cpu, Globe } from "lucide-react";

interface SourceBadgeProps {
  type: "OFFICIAL" | "SCRAPED" | "USER" | "CALCULATED";
  sourceName?: string;
  sourceUrl?: string;
  lastUpdated?: string;
  assumptions?: string;
}

export const SourceBadge: React.FC<SourceBadgeProps> = ({
  type,
  sourceName = "GEHU",
  sourceUrl,
  lastUpdated,
  assumptions,
}) => {
  const configs = {
    OFFICIAL: {
      label: "Official GEHU",
      badgeClass:
        "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
      icon: ShieldCheck,
    },
    SCRAPED: {
      label: "GEHU Public Source",
      badgeClass:
        "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20",
      icon: Globe,
    },
    USER: {
      label: "User Entered",
      badgeClass:
        "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20",
      icon: UserCheck,
    },
    CALCULATED: {
      label: "Calculated Prediction",
      badgeClass:
        "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
      icon: Cpu,
    },
  };

  const config = configs[type] || configs.OFFICIAL;
  const Icon = config.icon;

  return (
    <div className="inline-flex items-center gap-1.5 flex-wrap">
      <span
        className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded border ${config.badgeClass}`}
        title={
          type === "CALCULATED"
            ? assumptions || "Derived mathematically by GEHU Student Companion"
            : `Source: ${sourceName}`
        }
      >
        <Icon className="w-3 h-3" />
        <span>{config.label}</span>
      </span>

      {sourceUrl && (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 text-[11px] text-blue-600 hover:text-blue-800 dark:text-blue-400 hover:underline"
        >
          <span>Open Source</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </a>
      )}
    </div>
  );
};
