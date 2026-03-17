"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import UserAvatar from "@/components/ui/UserAvatar";
import { cn } from "@/lib/utils";

function getNotificationText(notification) {
  switch (notification.type) {
    case "upvote":
      return "upvoted your post";
    case "comment":
      return "commented on your post";
    case "reply":
      return "replied to your comment";
    case "follow":
      return "started following you";
    case "mention":
      return "mentioned you in a post";
    default:
      return "interacted with you";
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
    <Link
      href={href}
      className={cn(
        "flex items-start gap-3 px-4 py-3 rounded-xl transition-colors hover:bg-gray-50",
        !notification.read && "bg-orange-50/50",
      )}
    >
      <UserAvatar src={actor.avatar} name={actor.name} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="text-sm">
          <span className="font-semibold">{actor.name || "Someone"}</span>{" "}
          <span className="text-gray-600">
            {getNotificationText(notification)}
          </span>
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{timeAgo}</p>
      </div>
      {!notification.read && (
        <div className="h-2 w-2 rounded-full bg-[#FF6B35] shrink-0 mt-2" />
      )}
    </Link>
  );
}
