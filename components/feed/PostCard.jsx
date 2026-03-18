"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowBigUp,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Flag,
  Trash2,
} from "lucide-react";
import UserAvatar from "@/components/ui/UserAvatar";
import TierBadge from "@/components/ui/TierBadge";
import PostTypePill from "@/components/ui/PostTypePill";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export default function PostCard({ post, onUpdate }) {
  const { data: session } = useSession();
  const [isExpanded, setIsExpanded] = useState(false);
  const [upvotes, setUpvotes] = useState(post.upvotes || []);
  const [isUpvoting, setIsUpvoting] = useState(false);

  const author = post.author || {};
  const isUpvoted = upvotes.includes(session?.user?.id);
  const timeAgo = post.createdAt
    ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })
    : "";

  const handleUpvote = async () => {
    if (!session || isUpvoting) return;
    setIsUpvoting(true);
    try {
      const res = await fetch(`/api/posts/${post._id}/upvote`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setUpvotes(
          data.upvoted
            ? [...upvotes, session.user.id]
            : upvotes.filter((id) => id !== session.user.id),
        );
      }
    } catch (e) {
      console.error(e);
    }
    setIsUpvoting(false);
  };

  const handleFlag = async () => {
    try {
      await fetch(`/api/posts/${post._id}/flag`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Inappropriate content" }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/posts/${post._id}`, { method: "DELETE" });
      if (res.ok) onUpdate?.();
    } catch (e) {
      console.error(e);
    }
  };

  const contentPreview = post.content?.length > 280 && !isExpanded;

  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Link href={`/profile/${author._id || post.authorId}`}>
              <UserAvatar src={author.avatar} name={author.name} size="md" />
            </Link>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href={`/profile/${author._id || post.authorId}`}
                  className="text-sm font-semibold text-gray-900 hover:underline"
                >
                  {author.name || "Unknown"}
                </Link>
                <TierBadge tier={author.tier} size="sm" />
                <span className="text-xs text-gray-400">· {timeAgo}</span>
              </div>
              <PostTypePill type={post.type} />
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-gray-400 hover:text-gray-600 p-1">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleFlag}>
                <Flag className="h-4 w-4 mr-2" />
                Report
              </DropdownMenuItem>
              {(post.authorId === session?.user?.id ||
                ["moderator", "admin"].includes(session?.user?.role)) && (
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Content */}
        <Link href={`/post/${post._id}`} className="block">
          <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
            {contentPreview ? post.content.slice(0, 280) + "..." : post.content}
          </p>
          {contentPreview && (
            <button
              onClick={(e) => {
                e.preventDefault();
                setIsExpanded(true);
              }}
              className="text-[#FF6B35] text-sm font-medium mt-1 hover:underline"
            >
              See more
            </button>
          )}
        </Link>

        {/* Images */}
        {post.images?.length > 0 && (
          <div className="mt-3 grid gap-2 grid-cols-1">
            {post.images.map((img, i) => (
              <Image
                key={i}
                src={img}
                alt={`Post image ${i + 1}`}
                width={1200}
                height={800}
                className="rounded-xl w-full max-h-80 object-cover bg-gray-100"
              />
            ))}
          </div>
        )}

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {post.tags.map((tag, i) => (
              <span
                key={i}
                className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100">
          <button
            onClick={handleUpvote}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
              isUpvoted
                ? "text-[#FF6B35] bg-orange-50"
                : "text-gray-500 hover:bg-gray-50",
            )}
          >
            <ArrowBigUp
              className={cn("h-5 w-5", isUpvoted && "fill-[#FF6B35]")}
            />
            {upvotes.length || ""}
          </button>

          <Link
            href={`/post/${post._id}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all"
          >
            <MessageCircle className="h-4 w-4" />
            {post.commentCount || ""}
          </Link>

          <button
            onClick={() => {
              navigator.clipboard?.writeText(
                `${window.location.origin}/post/${post._id}`,
              );
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all ml-auto"
          >
            <Share2 className="h-4 w-4" />
            Share
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
