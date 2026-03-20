"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Heart, MessageCircle, Share2, Bookmark, Play, Pause,
  Volume2, VolumeX, Clapperboard, Send, X, ShoppingCart
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import UserAvatar from "@/components/ui/UserAvatar";
import { formatDistanceToNow } from "date-fns";

function getVideoUrl(product) {
  const vList = product.carousel?.videos || product.videos;
  if (Array.isArray(vList) && vList.length > 0) {
    const v = vList[0];
    return typeof v === "string" ? v : v?.url || v?.src;
  }
  if (typeof product.video === "string") return product.video;
  if (typeof product.primary_video === "string") return product.primary_video;
  return null;
}

export default function FeedReelCard({ reel }) {
  const { data: session } = useSession();
  const user = session?.user;
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(
    reel.star_rating > 0 ? Math.floor(reel.star_rating * 123) : Math.floor(Math.random() * 400 + 50)
  );
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  const videoUrl = getVideoUrl(reel);
  const title = reel.name || reel.title || "Trending Product";
  const brand = reel.brand || reel.vendor || "vF Verified";

  useEffect(() => {
    if (!reel._id) return;
    fetch(`/api/reels/${reel._id}/comments`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setComments(d.comments || []); })
      .catch(() => {});

    if (user) {
      fetch(`/api/reels/${reel._id}/status`)
        .then((r) => r.json())
        .then((d) => { setIsLiked(d.isLiked); setIsSaved(d.isSaved); })
        .catch(() => {});
    }
  }, [reel._id, user]);

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {});
    }
  }, [isPlaying]);

  const toggleMute = useCallback((e) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted((m) => !m);
  }, [isMuted]);

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user) return toast.error("Please login to like");
    setIsLiked((v) => !v);
    setLikeCount((v) => isLiked ? v - 1 : v + 1);
    try {
      await fetch(`/api/reels/${reel._id}/like`, { method: "POST" });
    } catch {}
  };

  const handleSave = async (e) => {
    e.stopPropagation();
    if (!user) return toast.error("Please login to save");
    setIsSaved((v) => !v);
    if (!isSaved) toast.success("Saved!");
    try {
      await fetch(`/api/reels/${reel._id}/save`, { method: "POST" });
    } catch {}
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    if (navigator.share) {
      try { await navigator.share({ title, url: window.location.href }); } catch {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied!");
    }
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    const text = newComment.trim();
    setNewComment("");
    try {
      const res = await fetch(`/api/reels/${reel._id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (data.success) setComments((prev) => [data.comment, ...prev]);
    } catch {}
  };

  if (!videoUrl) return null;

  return (
    <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
      {/* Header — like a post */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary to-rose-500 flex items-center justify-center shadow-sm">
            <Clapperboard className="h-4.5 w-4.5 text-white h-5 w-5" />
          </div>
          <div>
            <p className="font-black text-gray-900 dark:text-white text-sm leading-tight">{brand}</p>
            <p className="text-[11px] font-bold text-primary uppercase tracking-widest">Trending Reel</p>
          </div>
        </div>
        <Link href="/reels" className="text-xs font-bold text-primary hover:text-primary/80 transition-colors px-3 py-1.5 bg-primary/5 rounded-xl">
          View all →
        </Link>
      </div>

      {/* Video */}
      <div className="relative aspect-[9/16] sm:aspect-[4/5] bg-black cursor-pointer" onClick={togglePlay}>
        <video
          ref={videoRef}
          src={videoUrl}
          poster={reel.primary_image || reel.image}
          muted={isMuted}
          loop
          playsInline
          preload="none"
          className="absolute inset-0 w-full h-full object-cover"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />

        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10 pointer-events-none" />

        {/* Play/Pause overlay */}
        <div className={cn("absolute inset-0 flex items-center justify-center transition-opacity duration-200", isPlaying ? "opacity-0" : "opacity-100")}>
          <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
            <Play className="h-7 w-7 text-white fill-white ml-0.5" />
          </div>
        </div>

        {/* Mute button */}
        <button
          onClick={toggleMute}
          className="absolute top-3 right-3 h-9 w-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center border border-white/10 text-white hover:bg-black/70 transition-all z-10"
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>

        {/* Bottom info */}
        <div className="absolute bottom-4 left-4 right-16 z-10 pointer-events-none">
          <h3 className="text-white font-black text-base line-clamp-2 drop-shadow-md">{title}</h3>
          {reel.product_features?.pros && (
            <p className="text-white/70 text-xs font-medium mt-1 line-clamp-1">
              ✨ {reel.product_features.pros.slice(0, 2).join(" • ")}
            </p>
          )}
          {reel.product_cost && (
            <span className="mt-2 inline-block px-2 py-0.5 bg-emerald-500/30 backdrop-blur-sm text-emerald-300 text-xs font-black rounded-lg border border-emerald-500/40">
              ₹{reel.product_cost}
            </span>
          )}
        </div>

        {/* Get Quote button on video */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            window.open(`https://dash.vfulfill.io/signup?email=${user?.email || ""}`, "_blank");
          }}
          className="absolute bottom-4 right-3 z-10 px-3 py-2 bg-white text-black font-black text-[10px] uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow-xl hover:scale-105 active:scale-95 transition-all"
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          Quote
        </button>
      </div>

      {/* Action bar — like post card */}
      <div className="px-5 py-3 flex items-center justify-between border-t border-gray-50 dark:border-white/5">
        <div className="flex items-center gap-1">
          {/* Like */}
          <button
            onClick={handleLike}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95",
              isLiked ? "text-red-500 bg-red-50 dark:bg-red-500/10" : "text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/5"
            )}
          >
            <Heart className={cn("h-4 w-4 transition-all", isLiked ? "fill-red-500 text-red-500" : "")} />
            <span>{likeCount}</span>
          </button>

          {/* Comment */}
          <button
            onClick={(e) => { e.stopPropagation(); setShowComments(true); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/5 transition-all hover:scale-105 active:scale-95"
          >
            <MessageCircle className="h-4 w-4" />
            <span>{comments.length}</span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/5 transition-all hover:scale-105 active:scale-95"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          className={cn(
            "flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95",
            isSaved ? "text-amber-500 bg-amber-50 dark:bg-amber-500/10" : "text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/5"
          )}
        >
          <Bookmark className={cn("h-4 w-4 transition-all", isSaved ? "fill-amber-500 text-amber-500" : "")} />
        </button>
      </div>

      {/* Comments drawer */}
      {showComments && (
        <div className="border-t border-gray-100 dark:border-white/5 px-5 py-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-black text-sm text-gray-900 dark:text-white">Comments ({comments.length})</h4>
            <button onClick={() => setShowComments(false)} className="h-7 w-7 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center">
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>

          <div className="space-y-3 max-h-48 overflow-y-auto">
            {comments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Be the first to comment!</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="flex gap-2.5">
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary to-rose-500 flex items-center justify-center shrink-0">
                    <span className="text-white text-[10px] font-black uppercase">{c.user?.[0] || "?"}</span>
                  </div>
                  <div className="flex-1 bg-gray-50 dark:bg-white/5 rounded-2xl px-3 py-2">
                    <p className="text-[11px] font-bold text-muted-foreground mb-0.5">{c.user || "Anonymous"}</p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">{c.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <form onSubmit={submitComment} className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/10 transition-all"
            />
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center disabled:opacity-40 hover:bg-primary/90 active:scale-95 transition-all"
            >
              <Send className="h-4 w-4 text-white -ml-0.5 mt-0.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
