"use client";

import { useEffect, useState } from "react";
import UserAvatar from "@/components/ui/UserAvatar";
import { useSession } from "next-auth/react";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";

export default function FeedStories() {
  const { data: session } = useSession();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("/api/members?limit=12")
      .then((res) => res.json())
      .then((data) => setUsers(data.members || []))
      .catch((err) => console.error("Story users error:", err));
  }, []);

  const stories = [
    {
      id: "you",
      name: "Story",
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
    <div className="rounded-2xl bg-slate-50/90 border border-slate-200/70 p-3 sm:p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
          Active Members
        </p>
        <p className="text-[11px] font-bold text-slate-400">{users.length + 1} online</p>
      </div>

      <div className="flex gap-2.5 sm:gap-3 overflow-x-auto pb-1 no-scrollbar snap-x snap-mandatory select-none">
        {stories.map((story, i) => (
          <motion.button
            key={story.id}
            type="button"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.035 }}
            className="snap-start shrink-0 group"
          >
            <div className="w-[78px] sm:w-[88px] rounded-2xl border border-slate-200 bg-white px-2 py-2.5 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.45)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_14px_30px_-18px_rgba(15,23,42,0.5)]">
              <div className="relative mx-auto w-fit">
                <div
                  className={`h-[52px] w-[52px] sm:h-[58px] sm:w-[58px] rounded-full p-[2.5px] transition-transform duration-300 group-hover:scale-105 ${
                    story.isYou
                      ? "bg-slate-200"
                      : "bg-gradient-to-br from-primary via-violet-500 to-fuchsia-500"
                  }`}
                >
                  <div className="h-full w-full rounded-full bg-white p-[2px]">
                    <UserAvatar
                      src={story.avatar}
                      name={story.name}
                      size="lg"
                      className="h-full w-full rounded-full"
                    />
                  </div>
                </div>

                {story.isYou ? (
                  <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-primary ring-2 ring-white flex items-center justify-center shadow-md">
                    <Plus className="h-3 w-3 text-white stroke-[3px]" />
                  </div>
                ) : (
                  <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                )}
              </div>

              <p className="mt-2 truncate text-center text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-600">
                {story.isYou ? "You" : story.name}
              </p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
