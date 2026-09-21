"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  BookOpen,
  Calendar,
  Clock,
  FileText,
  Sliders,
  X,
  Sparkles,
  ArrowRight,
  Shield,
} from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
}) => {
  const router = useRouter();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        isOpen ? onClose() : undefined;
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickLinks = [
    {
      title: "Attendance Center",
      category: "Navigation",
      href: "/attendance",
      icon: Clock,
      desc: "View subject-wise attendance and recovery plans",
    },
    {
      title: "Can I Miss Tomorrow?",
      category: "Feature",
      href: "/miss-tomorrow",
      icon: BookOpen,
      desc: "Check mathematical impact of missing upcoming classes",
    },
    {
      title: "What-If Simulator",
      category: "Feature",
      href: "/simulator",
      icon: Sliders,
      desc: "Forecast curves and goal attendance calculations",
    },
    {
      title: "Weekly Timetable",
      category: "Navigation",
      href: "/timetable",
      icon: Clock,
      desc: "Daily and weekly schedule of lectures and labs",
    },
    {
      title: "Exam Portal & Back Papers",
      category: "Navigation",
      href: "/exams",
      icon: FileText,
      desc: "Official GEHU exam schedules and carryover papers",
    },
    {
      title: "Back Paper Module",
      category: "Feature",
      href: "/back-papers",
      icon: FileText,
      desc: "Carryover registration, deadline, and fee info",
    },
    {
      title: "Academic Calendar",
      category: "Navigation",
      href: "/calendar",
      icon: Calendar,
      desc: "Holidays, exam windows, and semester milestones",
    },
    {
      title: "GEHU Official Notices",
      category: "Navigation",
      href: "/notices",
      icon: Sparkles,
      desc: "Search university notices and circulars",
    },
    {
      title: "Admin Scraper Health",
      category: "System",
      href: "/admin",
      icon: Shield,
      desc: "View scraper status and manual sync triggers",
    },
  ];

  const filteredLinks = quickLinks.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.desc.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (href: string) => {
    router.push(href);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            type="text"
            placeholder="Search subjects, exams, back-papers, notices, or tools..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {filteredLinks.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">
              No matching commands or pages found.
            </div>
          ) : (
            filteredLinks.map((item) => (
              <button
                key={item.href}
                onClick={() => handleSelect(item.href)}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 group-hover:scale-105 transition-transform">
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {item.title}
                      </span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {item.desc}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
              </button>
            ))
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Navigate with arrows or click</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
};
