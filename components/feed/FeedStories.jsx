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
    <div className="flex gap-5 overflow-x-auto pb-4 px-1 no-scrollbar select-none">
      {stories.map((story, i) => (
        <motion.div
          key={story.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
          className="flex flex-col items-center gap-2 shrink-0 group cursor-pointer"
        >
          <div className="relative">
            <div className={`
              h-[72px] w-[72px] rounded-3xl p-[3px] transition-transform duration-300 group-hover:scale-105 group-active:scale-95
              ${story.isYou 
                ? "bg-gray-100 dark:bg-gray-800" 
                : "bg-gradient-to-tr from-primary via-orange-400 to-yellow-300 shadow-lg shadow-primary/10"
              }
            `}>
              <div className="h-full w-full bg-white dark:bg-gray-900 rounded-[1.25rem] p-[2px]">
                <UserAvatar src={story.avatar} name={story.name} size="lg" className="h-full w-full rounded-[1.1rem]" />
              </div>
            </div>
            
            {story.isYou ? (
              <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-primary rounded-xl flex items-center justify-center ring-4 ring-white shadow-lg">
                <Plus className="h-3.5 w-3.5 text-white stroke-[3px]" />
              </div>
            ) : (
              <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 bg-green-500 rounded-full ring-4 ring-white shadow-sm" />
            )}
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-gray-900 transition-colors">
            {story.isYou ? "YOU" : story.name}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
