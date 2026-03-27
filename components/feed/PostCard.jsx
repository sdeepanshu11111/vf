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
import PostVideoPlayer from "@/components/feed/PostVideoPlayer";
import ImageLightbox from "@/components/feed/ImageLightbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useAuthPrompt } from "@/components/auth/AuthPromptProvider";

export default function PostCard({ post, onUpdate }) {
  const { data: session } = useSession();
  const { requestAuth } = useAuthPrompt();
  const [isExpanded, setIsExpanded] = useState(false);
  const [upvotes, setUpvotes] = useState(post.upvotes || []);
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [poll, setPoll] = useState(post.poll || null);
  const [isVoting, setIsVoting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(null);

  const author = post.author || {};
  const isUpvoted = upvotes.includes(session?.user?.id);
  const timeAgo = post.createdAt
    ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })
    : "";

  const canDelete =
    session &&
    (session.user.id === post.authorId ||
      ["admin", "moderator"].includes(session.user.role));

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
      if (res.ok) {
        setSaved(!saved);
        toast.success(saved ? "Post unsaved" : "Post saved!");
      }
    } catch (e) { console.error(e); }
    setIsSaving(false);
  };

  const handleVote = async (optionIndex) => {
    if (!session) {
      requestAuth({ actionText: "vote on this poll" });
      return;
    }
    if (isVoting) return;
    setIsVoting(true);
    try {
      const res = await fetch(`/api/posts/${post._id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionIndex })
      });
      if (res.ok) {
        const data = await res.json();
        setPoll(data.poll);
      } else {
        const data = await res.json();
        if(data.error) toast.error(data.error);
      }
    } catch (e) { console.error(e); }
    setIsVoting(false);
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/posts/${post._id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Post deleted.");
        onUpdate?.();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete post.");
      }
    } catch {
      toast.error("Network error.");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const contentPreview = post.content?.length > 280 && !isExpanded;

  return (
    <>
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-black">Delete this post?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The post will be permanently removed from the feed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl font-bold">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold"
            >
              {isDeleting ? "Deleting..." : "Delete Post"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="mb-4 sm:mb-5 group rounded-3xl border border-slate-200/70 bg-white shadow-[0_20px_45px_-35px_rgba(15,23,42,0.45)] hover:shadow-[0_22px_55px_-35px_rgba(15,23,42,0.55)] transition-all duration-400"
      >
        <div className="rounded-3xl p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link href={`/profile/${author._id || post.authorId}`} className="relative group/avatar">
                <UserAvatar src={author.avatar} name={author.name} size="md" className="ring-2 ring-slate-100 shadow-sm group-hover/avatar:ring-primary/30 transition-all duration-300 transform group-hover/avatar:scale-105" />
                <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 bg-emerald-500 rounded-full border-[3px] border-white shadow-sm" />
              </Link>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <Link href={`/profile/${author._id || post.authorId}`} className="text-[15px] font-black text-foreground hover:text-primary transition-colors tracking-tight">
                    {author.name || "Unknown"}
                  </Link>
                  <TierBadge tier={author.tier} size="sm" />
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                  <span className="opacity-80">{timeAgo}</span>
                  <span className="opacity-40">•</span>
                  <PostTypePill type={post.type} className="px-0 py-0 bg-transparent text-muted-foreground border-0" />
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-10 w-10 flex items-center justify-center rounded-2xl hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-all outline-none cursor-pointer active:scale-95">
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="border border-slate-200 rounded-2xl min-w-[160px] p-2 shadow-xl bg-white">
                <DropdownMenuItem onClick={handleSave} className="rounded-xl cursor-pointer font-bold focus:bg-primary/10 focus:text-primary py-2.5 transition-colors">
                  <Bookmark className={cn("h-4 w-4 mr-2", saved && "fill-primary text-primary")} />
                  {saved ? "Unsave" : "Save Post"}
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-xl cursor-pointer text-amber-600 font-bold focus:bg-amber-500/10 focus:text-amber-600 py-2.5 transition-colors">
                  <Flag className="h-4 w-4 mr-2" />
                  Report
                </DropdownMenuItem>
                {canDelete && (
                  <>
                    <DropdownMenuSeparator className="my-1" />
                    <DropdownMenuItem
                      onClick={() => setShowDeleteDialog(true)}
                      className="rounded-xl cursor-pointer text-red-500 font-bold focus:bg-red-500/10 focus:text-red-500 py-2.5 transition-colors"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Post
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Content */}
          <Link href={`/post/${post._id}`} className="block group/content">
            <div className="text-[15.5px] sm:text-[17px] text-slate-800 leading-relaxed whitespace-pre-wrap font-medium group-hover/content:text-foreground transition-colors">
              {contentPreview ? post.content.slice(0, 280) : post.content}
              {contentPreview && (
                <span className="text-slate-500 font-black tracking-widest ml-1">...</span>
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
            <div className={cn(
              "mt-4 sm:mt-5 rounded-2xl sm:rounded-3xl border border-slate-200/60 relative group/media shadow-sm overflow-hidden",
              post.images.length > 1 ? "grid grid-cols-2 gap-1 bg-slate-100" : ""
            )}>
              {post.images.slice(0, 4).map((img, idx) => (
                <div 
                  key={idx} 
                  className={cn(
                    "relative overflow-hidden cursor-pointer", 
                    post.images.length === 3 && idx === 0 ? "col-span-2" : ""
                  )}
                  onClick={(e) => { e.preventDefault(); setActiveImageIndex(idx); }}
                >
                  <img loading="lazy" src={img} alt="Post" className="w-full h-full object-cover max-h-[500px] min-h-[200px] transform group-hover/media:scale-105 transition-transform duration-[1.5s] ease-[cubic-bezier(0.25,1,0.5,1)]" />
                  {idx === 3 && post.images.length > 4 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-2xl backdrop-blur-sm">
                      +{post.images.length - 4}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <ImageLightbox
            images={post.images}
            activeIndex={activeImageIndex}
            onClose={() => setActiveImageIndex(null)}
            onNext={() => setActiveImageIndex((prev) => (prev + 1) % post.images.length)}
            onPrev={() => setActiveImageIndex((prev) => (prev - 1 + post.images.length) % post.images.length)}
          />

          {/* Video */}
          {post.video && (
            <div className="mt-4 sm:mt-5 overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/60 shadow-sm relative">
              <PostVideoPlayer src={post.video} />
            </div>
          )}

          {/* Poll */}
          {poll && poll.options && poll.options.length > 0 && (
            <div className="mt-4 sm:mt-5 bg-[#F8FAFC] border border-slate-200/60 rounded-2xl p-4 sm:p-5 space-y-3 shadow-sm" onClick={(e) => e.stopPropagation()}>
              {(() => {
                const totalVotes = poll.options.reduce((sum, opt) => sum + (opt.votes?.length || 0), 0);
                const hasVoted = session && poll.options.some(opt => opt.votes?.includes(session.user.id));
                
                return (
                  <>
                    {poll.options.map((opt, i) => {
                      const votes = opt.votes?.length || 0;
                      const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
                      const isMyVote = session && opt.votes?.includes(session.user.id);

                      if (hasVoted) {
                        return (
                          <div key={i} className="relative overflow-hidden rounded-xl bg-white border border-slate-200">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                              className={cn("absolute inset-y-0 left-0 opacity-20", isMyVote ? "bg-blue-500" : "bg-slate-300")}
                            />
                            <div className="relative flex items-center justify-between p-3.5 text-[14px] font-semibold text-slate-700 z-10">
                              <span className="flex items-center gap-2">
                                {opt.text}
                                {isMyVote && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full uppercase tracking-wider">Your Vote</span>}
                              </span>
                              <span>{percentage}%</span>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <button
                          key={i}
                          onClick={(e) => { e.preventDefault(); handleVote(i); }}
                          disabled={isVoting}
                          className="w-full text-left p-3.5 rounded-xl border border-blue-200/60 bg-white hover:bg-blue-50/50 hover:border-blue-300 text-slate-700 text-[14px] font-semibold transition-all active:scale-[0.98] group flex items-center justify-between"
                        >
                           <span>{opt.text}</span>
                           <span className="w-4 h-4 rounded-full border border-slate-300 group-hover:border-blue-400 group-hover:bg-blue-50 transition-colors" />
                        </button>
                      );
                    })}
                    <div className="text-[11px] font-bold text-slate-500 pt-1 px-1 uppercase tracking-wider">
                      {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* Tags */}
          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {post.tags.map((tag, i) => (
                <span key={i} className="px-3 py-1.5 bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 cursor-pointer rounded-xl text-xs font-black uppercase tracking-wider border border-slate-200 transition-all hover:scale-105">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Actions Bar */}
          <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-200/70">
            <div className="flex items-center gap-1.5 sm:gap-3">
              <button
                onClick={handleUpvote}
                className={cn(
                  "group/btn flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-black transition-all duration-300 active:scale-95 shadow-sm border",
                  isUpvoted 
                    ? "text-primary bg-primary/10 border-primary/20 hover:bg-primary/20 shadow-primary/5" 
                    : "text-slate-500 bg-slate-100/70 hover:bg-slate-100 border-slate-200/70 hover:text-slate-900"
                )}
              >
                <ArrowBigUp className={cn("h-5 w-5 transition-transform duration-300 group-hover/btn:-translate-y-1", isUpvoted && "fill-primary")} />
                <span>{upvotes.length || "Upvote"}</span>
              </button>

              <Link
                href={`/post/${post._id}`}
                className="group/btn flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-black text-slate-500 bg-slate-100/70 hover:bg-slate-100 border border-slate-200/70 hover:text-slate-900 transition-all duration-300 active:scale-95 shadow-sm"
              >
                <MessageCircle className="h-5 w-5 transition-transform duration-300 group-hover/btn:scale-110" />
                <span>{post.commentCount || 0}</span>
              </Link>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
               <button className="h-11 w-11 flex items-center justify-center rounded-2xl text-slate-500 hover:bg-slate-100 bg-transparent border border-transparent hover:border-slate-200 hover:text-slate-900 hover:shadow-sm transition-all duration-300 hover:-rotate-12 active:scale-95">
                <Repeat className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/post/${post._id}`);
                  toast.success("Link copied!");
                }}
                className="h-11 w-11 flex items-center justify-center rounded-2xl text-slate-500 hover:bg-slate-100 bg-transparent border border-transparent hover:border-slate-200 hover:text-slate-900 hover:shadow-sm transition-all duration-300 hover:scale-110 active:scale-95"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
