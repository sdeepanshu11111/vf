"use client";
/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowBigUp,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Flag,
  Trash2,
  Bookmark,
  Repeat
} from "lucide-react";
import UserAvatar from "@/components/ui/UserAvatar";
import TierBadge from "@/components/ui/TierBadge";
import PostTypePill from "@/components/ui/PostTypePill";
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
  const [isSaving, setIsSaving] = useState(false);
  const [isReposting, setIsReposting] = useState(false);
  const [saved, setSaved] = useState(false);

  const author = post.author || {};
  const isUpvoted = upvotes.includes(session?.user?.id);
  const timeAgo = post.createdAt
    ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })
    : "";

  const handleUpvote = async () => {
    if (!session || isUpvoting) return;
    const previousUpvotes = [...upvotes];
    if (upvotes.includes(session.user.id)) {
      setUpvotes(upvotes.filter((id) => id !== session.user.id));
    } else {
      setUpvotes([...upvotes, session.user.id]);
    }
    setIsUpvoting(true);
    try {
      const res = await fetch(`/api/posts/${post._id}/upvote`, { method: "POST" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUpvotes(data.upvoted ? [...previousUpvotes.filter(id => id !== session.user.id), session.user.id] : previousUpvotes.filter(id => id !== session.user.id));
    } catch { setUpvotes(previousUpvotes); }
    finally { setIsUpvoting(false); }
  };

  const handleSave = async () => {
    if (!session || isSaving) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/posts/${post._id}/save`, { method: "POST" });
      if (res.ok) setSaved(!saved);
    } catch (e) { console.error(e); }
    setIsSaving(false);
  };

  const contentPreview = post.content?.length > 280 && !isExpanded;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className="bento-card mb-4 group"
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Link href={`/profile/${author._id || post.authorId}`} className="relative">
              <UserAvatar src={author.avatar} name={author.name} size="md" className="ring-2 ring-white shadow-sm" />
              <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 bg-green-500 rounded-full border-2 border-white" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Link href={`/profile/${author._id || post.authorId}`} className="text-sm font-bold text-gray-900 hover:text-primary transition-colors">
                  {author.name || "Unknown"}
                </Link>
                <TierBadge tier={author.tier} size="sm" />
              </div>
              <div className="flex items-center gap-2 text-[11px] text-gray-400 font-medium uppercase tracking-wider">
                <span>{timeAgo}</span>
                <span>•</span>
                <PostTypePill type={post.type} className="px-0 py-0 bg-transparent text-gray-400 border-0" />
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-card">
              <DropdownMenuItem onClick={handleSave}>
                <Bookmark className={cn("h-4 w-4 mr-2", saved && "fill-primary text-primary")} />
                {saved ? "Unsave" : "Save Post"}
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-500">
                <Flag className="h-4 w-4 mr-2" />
                Report
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Content */}
        <Link href={`/post/${post._id}`} className="block">
          <div className="text-[15px] text-gray-800 leading-[1.6] whitespace-pre-wrap font-medium">
            {contentPreview ? post.content.slice(0, 280) : post.content}
            {contentPreview && (
              <span className="text-gray-400">...</span>
            )}
          </div>
          {contentPreview && (
            <button
              onClick={(e) => { e.preventDefault(); setIsExpanded(true); }}
              className="text-primary text-[13px] font-bold mt-2 hover:underline"
            >
              Read full story
            </button>
          )}
        </Link>

        {/* Media */}
        {post.images?.length > 0 && (
          <div className="mt-4 overflow-hidden rounded-2xl border border-gray-100">
            <img src={post.images[0]} alt="Post" className="w-full object-cover max-h-[400px] hover:scale-105 transition-transform duration-700" />
          </div>
        )}

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {post.tags.map((tag, i) => (
              <span key={i} className="px-2.5 py-1 bg-gray-50 text-gray-500 rounded-lg text-[11px] font-bold border border-gray-100">
                #{tag.toUpperCase()}
              </span>
            ))}
          </div>
        )}

        {/* Actions Bar */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-50">
          <div className="flex items-center gap-1">
            <button
              onClick={handleUpvote}
              className={cn(
                "group/btn flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold transition-all",
                isUpvoted ? "text-primary bg-primary/5" : "text-gray-500 hover:bg-gray-50"
              )}
            >
              <ArrowBigUp className={cn("h-5 w-5 transition-transform group-hover/btn:-translate-y-0.5", isUpvoted && "fill-primary")} />
              <span>{upvotes.length || "Upvote"}</span>
            </button>

            <Link
              href={`/post/${post._id}`}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold text-gray-500 hover:bg-gray-50 transition-all"
            >
              <MessageCircle className="h-5 w-5" />
              <span>{post.commentCount || ""}</span>
            </Link>
          </div>

          <div className="flex items-center gap-1">
            <button className="h-10 w-10 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-all">
              <Repeat className="h-5 w-5" />
            </button>
            <button
              onClick={() => navigator.clipboard.writeText(`${window.location.origin}/post/${post._id}`)}
              className="h-10 w-10 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-all"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
