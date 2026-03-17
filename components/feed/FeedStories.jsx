"use client";

import { useEffect, useState } from "react";
import UserAvatar from "@/components/ui/UserAvatar";
import { useSession } from "next-auth/react";
import { Plus } from "lucide-react";

export default function FeedStories() {
  const { data: session } = useSession();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("/api/members?limit=10")
      .then((res) => res.json())
      .then((data) => setUsers(data.members || []))
      .catch((err) => console.error("Failed to fetch story users:", err));
  }, []);

  const stories = [
    {
      id: "you",
      name: "Your Story",
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
    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
      {stories.map((story) => (
        <div
          key={story.id}
          className="flex flex-col items-center gap-1.5 shrink-0"
        >
          <div
            className={`relative rounded-full p-[2px] ${
              story.isYou
                ? "bg-gray-200"
                : "bg-gradient-to-tr from-yellow-400 via-orange-500 to-pink-600"
            }`}
          >
            <div className="bg-[#F5F5F5] rounded-full p-[2px]">
              <UserAvatar src={story.avatar} name={story.name} size="lg" />
            </div>
            {story.isYou && (
              <div className="absolute bottom-0 right-0 h-5 w-5 bg-[#FF6B35] rounded-full flex items-center justify-center ring-2 ring-white">
                <Plus className="h-3 w-3 text-white" />
              </div>
            )}
          </div>
          <span className="text-[10px] text-gray-500 font-medium max-w-[64px] truncate text-center">
            {story.isYou ? "You" : story.name}
          </span>
        </div>
      ))}
    </div>
  );
}
