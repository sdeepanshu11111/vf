"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import UserAvatar from "@/components/ui/UserAvatar";
import { cn } from "@/lib/utils";

export default function ConversationList({ conversations = [], activeId }) {
  if (conversations.length === 0) {
    return (
      <div className="p-6 text-center text-gray-400">
        <p className="text-sm">No conversations yet</p>
        <p className="text-xs mt-1">Start a chat from someone&apos;s profile</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {conversations.map((conv) => {
        const user = conv.otherUser || {};
        const timeAgo = conv.lastAt
          ? formatDistanceToNow(new Date(conv.lastAt), { addSuffix: true })
          : "";

        return (
          <Link
            key={conv._id}
            href={`/messages/${conv._id}`}
            className={cn(
              "flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors",
              activeId === conv._id?.toString() && "bg-orange-50/50",
            )}
          >
            <UserAvatar src={user.avatar} name={user.name} size="md" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold truncate">
                  {user.name || "Unknown"}
                </p>
                <span className="text-xs text-gray-400 shrink-0">
                  {timeAgo}
                </span>
              </div>
              <p className="text-xs text-gray-500 truncate mt-0.5">
                {conv.lastMessage || "No messages yet"}
              </p>
            </div>
            {conv.unreadCount > 0 && (
              <span className="h-5 min-w-[20px] px-1.5 bg-[#FF6B35] text-white text-xs font-medium rounded-full flex items-center justify-center shrink-0">
                {conv.unreadCount}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
