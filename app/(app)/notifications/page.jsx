"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NotificationItem from "@/components/notifications/NotificationItem";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCheck, Bell, Zap, MessageSquare, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FILTER_TABS = [
  { value: "all", label: "All" },
  { value: "upvote", label: "Likes", icon: Zap },
  { value: "comment", label: "Comments", icon: MessageSquare },
  { value: "follow", label: "Follows", icon: UserPlus },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  const fetchNotifications = async () => {
    try {
      const url = activeFilter === "all" ? "/api/notifications" : `/api/notifications?type=${activeFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    fetchNotifications();
  }, [activeFilter]);

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6 pb-12 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between pt-2">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Notifications</h2>
          <p className="text-sm text-muted-foreground mt-1 font-medium">
            {unreadCount > 0
              ? `${unreadCount} unread update${unreadCount !== 1 ? "s" : ""}`
              : "You're all caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllRead}
            className="text-primary hover:text-primary/90 hover:bg-primary/5 font-bold rounded-xl gap-1.5"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 p-1.5 bg-white dark:bg-[#0f172a] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm w-full overflow-x-auto hide-scrollbar">
        {FILTER_TABS.map((tab) => {
          const isActive = activeFilter === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveFilter(tab.value)}
              className={cn(
                "relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 shrink-0 outline-none",
                isActive
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-gray-50 dark:hover:bg-white/5"
              )}
            >
              {tab.icon && <tab.icon className="h-3.5 w-3.5" />}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Notifications List */}
      <div className="space-y-2">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-3 p-4 bg-white rounded-2xl border border-gray-100">
                <Skeleton className="h-11 w-11 rounded-full shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length > 0 ? (
          <AnimatePresence mode="popLayout">
            {notifications.map((n) => (
              <NotificationItem key={n._id} notification={n} />
            ))}
          </AnimatePresence>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 px-6 bg-white rounded-3xl border border-gray-100 shadow-sm"
          >
            <div className="h-20 w-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-primary/5">
              <Bell className="h-9 w-9 text-primary/50" />
            </div>
            <p className="font-black text-gray-800 text-lg">Nothing here yet</p>
            <p className="text-sm text-muted-foreground mt-2 font-medium max-w-xs mx-auto">
              When someone likes, comments, or follows you, it&apos;ll show up here.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
