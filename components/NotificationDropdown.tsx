"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck, ExternalLink, AlertTriangle, Calendar, FileText } from "lucide-react";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  linkUrl?: string;
  createdAt: string;
}

export const NotificationDropdown: React.FC<{ onClose: () => void }> = ({
  onClose,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (data.notifications) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "ATTENDANCE_WARNING":
        return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      case "EXAM_REMINDER":
        return <Calendar className="w-4 h-4 text-blue-500" />;
      case "BACK_PAPER_DEADLINE":
        return <FileText className="w-4 h-4 text-amber-500" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-4 z-50">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-blue-500" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Academic Notifications
          </h3>
        </div>
        <button
          onClick={markAllRead}
          className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
        >
          <CheckCheck className="w-3.5 h-3.5" />
          <span>Mark all read</span>
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 py-1">
        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">No active notifications</div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              className={`py-3 px-1 transition-colors ${
                !item.isRead ? "bg-blue-50/40 dark:bg-blue-950/20" : ""
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5">{getIcon(item.type)}</div>
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                    {item.message}
                  </p>
                  {item.linkUrl && (
                    <Link
                      href={item.linkUrl}
                      onClick={onClose}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 mt-1 hover:underline"
                    >
                      <span>View details</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </Link>
                  )}
                </div>
                {!item.isRead && (
                  <span className="w-2 h-2 rounded-full bg-blue-500 mt-1" />
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
        <Link
          href="/notices"
          onClick={onClose}
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
        >
          View all GEHU official notices →
        </Link>
      </div>
    </div>
  );
};
