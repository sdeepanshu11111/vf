"use client";
/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
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
import { useAuthPrompt } from "@/components/auth/AuthPromptProvider";

export default function PostCard({ post, onUpdate }) {
  const { data: session } = useSession();
  const { requestAuth } = useAuthPrompt();
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
    if (!session) {
      requestAuth({ actionText: "upvote this post" });
      return;
    }
    if (isUpvoting) return;
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
    if (!session) {
      requestAuth({ actionText: "save this post" });
      return;
    }
    if (isSaving) return;
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
      initial={{ opacity: 0, scale: 0.98, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className="glass-card mb-4 sm:mb-6 group rounded-3xl sm:rounded-[2.5rem] p-1 sm:p-1.5 border-white/20 dark:border-white/5 shadow-xl shadow-black/5 hover:shadow-2xl transition-all duration-500"
    >
      <div className="bg-white/60 dark:bg-black/40 rounded-[1.75rem] sm:rounded-[2rem] p-4 sm:p-7 backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-4">
            <Link href={`/profile/${author._id || post.authorId}`} className="relative group/avatar">
              <UserAvatar src={author.avatar} name={author.name} size="md" className="ring-2 ring-white/50 dark:ring-white/10 shadow-md group-hover/avatar:ring-primary/50 transition-all duration-300 transform group-hover/avatar:scale-105" />
              <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 bg-emerald-500 rounded-full border-[3px] border-white dark:border-gray-950 shadow-sm" />
            </Link>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <Link href={`/profile/${author._id || post.authorId}`} className="text-[15px] font-black text-foreground hover:text-primary transition-colors tracking-tight">
                  {author.name || "Unknown"}
                </Link>
                <TierBadge tier={author.tier} size="sm" />
              </div>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">
                <span className="opacity-80">{timeAgo}</span>
                <span className="opacity-40">•</span>
                <PostTypePill type={post.type} className="px-0 py-0 bg-transparent text-muted-foreground border-0" />
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-10 w-10 flex items-center justify-center rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all outline-none cursor-pointer active:scale-95">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-card border-white/20 dark:border-white/10 rounded-2xl min-w-[160px] p-2 shadow-2xl">
              <DropdownMenuItem onClick={handleSave} className="rounded-xl cursor-pointer font-bold focus:bg-primary/10 focus:text-primary py-2.5 transition-colors">
                <Bookmark className={cn("h-4 w-4 mr-2", saved && "fill-primary text-primary")} />
                {saved ? "Unsave" : "Save Post"}
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-xl cursor-pointer text-red-500 font-bold focus:bg-red-500/10 focus:text-red-500 py-2.5 transition-colors">
                <Flag className="h-4 w-4 mr-2" />
                Report
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Content */}
        <Link href={`/post/${post._id}`} className="block group/content">
          <div className="text-[16px] sm:text-[17px] text-foreground/90 leading-relaxed whitespace-pre-wrap font-medium group-hover/content:text-foreground transition-colors">
            {contentPreview ? post.content.slice(0, 280) : post.content}
            {contentPreview && (
              <span className="text-muted-foreground font-black tracking-widest ml-1">...</span>
            )}
          </div>
          {contentPreview && (
            <button
              onClick={(e) => { e.preventDefault(); setIsExpanded(true); }}
              className="text-primary text-sm font-black mt-3 hover:underline underline-offset-4 opacity-90 transition-opacity hover:opacity-100 inline-flex items-center gap-1"
            >
              Read full story
            </button>
          )}
        </Link>

        {/* Media */}
        {post.images?.length > 0 && (
          <div className="mt-4 sm:mt-6 overflow-hidden rounded-2xl sm:rounded-[2rem] border border-white/10 dark:border-white/5 relative group/media shadow-lg">
            <img loading="lazy" src={post.images[0]} alt="Post" className="w-full object-cover max-h-[500px] transform group-hover/media:scale-105 transition-transform duration-[1.5s] ease-[cubic-bezier(0.25,1,0.5,1)]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover/media:opacity-100 transition-opacity duration-500 pointer-events-none" />
          </div>
        )}

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-5">
            {post.tags.map((tag, i) => (
              <span key={i} className="px-3 py-1.5 bg-background/50 dark:bg-white/5 text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer rounded-xl text-xs font-black uppercase tracking-wider border border-white/10 transition-all hover:scale-105">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Actions Bar */}
        <div className="flex items-center justify-between mt-6 pt-5 border-t border-black/5 dark:border-white/5">
          <div className="flex items-center gap-1.5 sm:gap-3">
            <button
              onClick={handleUpvote}
              className={cn(
                "group/btn flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-black transition-all duration-300 active:scale-95 shadow-sm border",
                isUpvoted 
                  ? "text-primary bg-primary/10 border-primary/20 hover:bg-primary/20 shadow-primary/5" 
                  : "text-muted-foreground bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 border-white/10 dark:border-white/5 hover:text-foreground"
              )}
            >
              <ArrowBigUp className={cn("h-5 w-5 transition-transform duration-300 group-hover/btn:-translate-y-1", isUpvoted && "fill-primary")} />
              <span>{upvotes.length || "Upvote"}</span>
            </button>

            <Link
              href={`/post/${post._id}`}
              className="group/btn flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-black text-muted-foreground bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 border border-white/10 dark:border-white/5 hover:text-foreground transition-all duration-300 active:scale-95 shadow-sm"
            >
              <MessageCircle className="h-5 w-5 transition-transform duration-300 group-hover/btn:scale-110" />
              <span>{post.commentCount || 0}</span>
            </Link>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
             <button className="h-11 w-11 flex items-center justify-center rounded-2xl text-muted-foreground hover:bg-white dark:hover:bg-white/10 bg-white/50 dark:bg-transparent border border-transparent hover:border-white/10 hover:text-foreground hover:shadow-sm transition-all duration-300 hover:-rotate-12 active:scale-95">
              <Repeat className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/post/${post._id}`);
                toast.success("Link copied!");
              }}
              className="h-11 w-11 flex items-center justify-center rounded-2xl text-muted-foreground hover:bg-white dark:hover:bg-white/10 bg-white/50 dark:bg-transparent border border-transparent hover:border-white/10 hover:text-foreground hover:shadow-sm transition-all duration-300 hover:scale-110 active:scale-95"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
