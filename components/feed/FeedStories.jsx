"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import UserAvatar from "@/components/ui/UserAvatar";
import { useSession } from "next-auth/react";
import { Plus, Flame } from "lucide-react";
import { motion } from "framer-motion";

export default function FeedStories() {
  const { data: session } = useSession();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("/api/members?limit=12&sort=postCount")
      .then((res) => res.json())
      .then((data) => setUsers(data.members || []))
      .catch((err) => console.error("Story users error:", err));
  }, []);

  const stories = [
    {
      id: session?.user?.id || "you",
      name: "You",
      avatar: session?.user?.avatar,
      isYou: true,
    },
    ...users
      .filter((u) => u._id !== session?.user?.id)
      .map((u) => ({
        id: u._id,
        name: u.name?.split(" ")[0],
        avatar: u.avatar,
      })),
  ];

  return (
    <div className="rounded-3xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/60 dark:border-white/5 p-3 sm:p-4 backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-md bg-primary/10 flex items-center justify-center">
            <Flame className="h-3 w-3 text-primary" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            Active Minds
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
          <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tight">
            {users.length + 1} online
          </p>
        </div>
      </div>

      <div className="flex gap-4 sm:gap-5 overflow-x-auto pb-4 no-scrollbar snap-x snap-mandatory select-none">
        {stories.map((story, i) => (
          <Link 
            key={story.id} 
            href={story.isYou ? "/profile" : `/profile/${story.id}`}
            className="snap-start shrink-0 first:pl-1 last:pr-1 relative"
            style={{ zIndex: stories.length - i }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              className="group flex flex-col items-center gap-2 relative"
            >
              <div className="relative pointer-events-none">
                {/* Status/Counter Ring - Ensure grid centering */}
                <div
                  className={`h-16 w-16 sm:h-18 sm:w-18 rounded-[1.6rem] p-[2.5px] grid place-items-center ${
                    story.isYou
                      ? "bg-gradient-to-tr from-cyan-400 via-blue-400 to-indigo-500 shadow-[0_4px_12px_rgba(56,189,248,0.25)]"
                      : "bg-gradient-to-tr from-[#6366f1] via-[#8b5cf6] to-[#ec4899] shadow-[0_4px_15px_rgba(99,102,241,0.2)]"
                  }`}
                >
                  <div className="h-full w-full rounded-[1.45rem] bg-white dark:bg-slate-950 grid place-items-center overflow-hidden">
                    <UserAvatar
                      src={story.avatar}
                      name={story.name}
                      size="full"
                      className="h-[105%] w-[105%] rounded-[1.2rem] object-cover"
                    />
                  </div>
                </div>

                {/* Status Indicator (Only for others) */}
                {!story.isYou && (
                  <div className="absolute -bottom-0.5 right-0.5 h-4 w-4 rounded-lg bg-emerald-500 ring-2 ring-white dark:ring-slate-950 shadow-md z-[60] pointer-events-auto" />
                )}
              </div>

              <p className="w-16 sm:w-18 text-center text-[10px] font-black uppercase tracking-widest text-slate-500 truncate">
                {story.isYou ? "You" : story.name}
              </p>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}
