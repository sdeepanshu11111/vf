"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { Heart, MessageSquare, UserPlus, AtSign, Zap } from "lucide-react";
import UserAvatar from "@/components/ui/UserAvatar";
import { cn } from "@/lib/utils";

function getNotificationIcon(type) {
  switch (type) {
    case "upvote": return <Zap className="h-3.5 w-3.5 text-orange-500" />;
    case "comment": return <MessageSquare className="h-3.5 w-3.5 text-blue-500" />;
    case "reply": return <MessageSquare className="h-3.5 w-3.5 text-blue-500" />;
    case "follow": return <UserPlus className="h-3.5 w-3.5 text-green-500" />;
    case "mention": return <AtSign className="h-3.5 w-3.5 text-purple-500" />;
    default: return <Zap className="h-3.5 w-3.5 text-primary" />;
  }
}

function getNotificationText(notification) {
  switch (notification.type) {
    case "upvote": return "voted on your insight";
    case "comment": return "shared a thought on your post";
    case "reply": return "responded to your comment";
    case "follow": return "is now following your hustle";
    case "mention": return "tagged you in a discussion";
    default: return "interacted with your content";
  }
}

export default function NotificationItem({ notification }) {
  const actor = notification.actor || {};
  const timeAgo = notification.createdAt
    ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })
    : "";

  const href = notification.postId
    ? `/post/${notification.postId}`
    : notification.type === "follow"
      ? `/profile/${notification.actorId}`
      : "/notifications";

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="mb-2"
    >
      <Link
        href={href}
        className={cn(
          "flex items-center gap-4 px-5 py-4 rounded-[1.25rem] transition-all border",
          notification.read 
            ? "bg-white/40 border-transparent hover:bg-white/60 hover:border-gray-100" 
            : "bg-white border-primary/10 shadow-sm ring-1 ring-primary/5 shadow-primary/5"
        )}
      >
        <div className="relative shrink-0">
          <UserAvatar src={actor.avatar} name={actor.name} size="md" className="ring-2 ring-white shadow-sm" />
          <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-white shadow-sm flex items-center justify-center border border-gray-50">
            {getNotificationIcon(notification.type)}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-[14px] leading-snug">
            <span className="font-bold text-gray-900">{actor.name || "A Hustler"}</span>{" "}
            <span className="text-gray-500 font-medium">
              {getNotificationText(notification)}
            </span>
          </p>
          <p className="text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-wider">{timeAgo}</p>
        </div>

        {!notification.read && (
          <div className="h-2.5 w-2.5 rounded-full bg-primary shrink-0 shadow-lg shadow-primary/40 animate-pulse" />
        )}
      </Link>
    </motion.div>
  );
}
