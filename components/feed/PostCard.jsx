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
      className="bento-card mb-4 group border-border/50 dark:border-white/5 shadow-md shadow-primary/5 hover:border-primary/20 dark:hover:border-primary/20"
    >
      <div className="p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Link href={`/profile/${author._id || post.authorId}`} className="relative group/avatar">
              <UserAvatar src={author.avatar} name={author.name} size="md" className="ring-2 ring-black/5 dark:ring-white/10 shadow-sm group-hover/avatar:ring-primary/50 transition-all duration-300" />
              <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 bg-green-500 rounded-full border-2 border-background" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Link href={`/profile/${author._id || post.authorId}`} className="text-sm font-bold text-foreground hover:text-primary transition-colors">
                  {author.name || "Unknown"}
                </Link>
                <TierBadge tier={author.tier} size="sm" />
              </div>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                <span>{timeAgo}</span>
                <span>•</span>
                <PostTypePill type={post.type} className="px-0 py-0 bg-transparent text-muted-foreground border-0" />
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-8 w-8 flex items-center justify-center rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors outline-none cursor-pointer">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-card border-white/20 dark:border-white/10 rounded-2xl min-w-[160px] p-2">
              <DropdownMenuItem onClick={handleSave} className="rounded-xl cursor-pointer font-bold focus:bg-primary/10 focus:text-primary py-2.5">
                <Bookmark className={cn("h-4 w-4 mr-2", saved && "fill-primary text-primary")} />
                {saved ? "Unsave" : "Save Post"}
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-xl cursor-pointer text-red-500 font-bold focus:bg-red-500/10 focus:text-red-500 py-2.5">
                <Flag className="h-4 w-4 mr-2" />
                Report
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Content */}
        <Link href={`/post/${post._id}`} className="block group/content">
          <div className="text-[15px] sm:text-base text-foreground/90 leading-relaxed whitespace-pre-wrap font-medium group-hover/content:text-foreground transition-colors">
            {contentPreview ? post.content.slice(0, 280) : post.content}
            {contentPreview && (
              <span className="text-muted-foreground">...</span>
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
          <div className="mt-5 overflow-hidden rounded-[1.25rem] border border-border/50 relative group/media">
            <img src={post.images[0]} alt="Post" className="w-full object-cover max-h-[450px] transform group-hover/media:scale-[1.02] transition-transform duration-700 ease-out" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover/media:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </div>
        )}

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-5">
            {post.tags.map((tag, i) => (
              <span key={i} className="px-2.5 py-1 bg-black/5 dark:bg-white/5 text-muted-foreground hover:text-foreground hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer rounded-lg text-[11px] font-bold border border-black/5 dark:border-white/5 transition-colors">
                #{tag.toUpperCase()}
              </span>
            ))}
          </div>
        )}

        {/* Actions Bar */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/40">
          <div className="flex items-center gap-2">
            <button
              onClick={handleUpvote}
              className={cn(
                "group/btn flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold transition-all duration-300",
                isUpvoted 
                  ? "text-primary bg-primary/10 hover:bg-primary/20" 
                  : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"
              )}
            >
              <ArrowBigUp className={cn("h-5 w-5 transition-transform duration-300 group-hover/btn:-translate-y-1", isUpvoted && "fill-primary")} />
              <span>{upvotes.length || "Upvote"}</span>
            </button>

            <Link
              href={`/post/${post._id}`}
              className="group/btn flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground transition-all duration-300"
            >
              <MessageCircle className="h-5 w-5 transition-transform duration-300 group-hover/btn:scale-110" />
              <span>{post.commentCount || "Reply"}</span>
            </Link>
          </div>

          <div className="flex items-center gap-1">
             <button className="h-10 w-10 flex items-center justify-center rounded-xl text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground transition-all duration-300 hover:rotate-12">
              <Repeat className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigator.clipboard.writeText(`${window.location.origin}/post/${post._id}`)}
              className="h-10 w-10 flex items-center justify-center rounded-xl text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground transition-all duration-300 hover:scale-110"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
