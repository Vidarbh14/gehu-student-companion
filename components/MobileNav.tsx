"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Clock, CalendarDays, FileText, MoreHorizontal } from "lucide-react";

export const MobileNav: React.FC<{ onOpenMore?: () => void }> = ({
  onOpenMore,
}) => {
  const pathname = usePathname();

  const items = [
    { href: "/dashboard", label: "Home", icon: LayoutDashboard },
    { href: "/attendance", label: "Attendance", icon: Clock },
    { href: "/timetable", label: "Timetable", icon: CalendarDays },
    { href: "/exams", label: "Exams", icon: FileText },
    { href: "/miss-tomorrow", label: "Tomorrow", icon: MoreHorizontal },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 safe-area-pb">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[10px] font-semibold transition-colors ${
                active
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${active ? "stroke-[2.5]" : ""}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
