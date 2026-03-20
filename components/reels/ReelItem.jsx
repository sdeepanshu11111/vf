"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  X,
  Send,
  ShoppingCart,
  Play,
  Pause,
  Volume2,
  VolumeX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner"; // Ensure sonner is installed as it's used in AppLayout
import { useSession } from "next-auth/react";

export default function ReelItem({ product, isActive }) {
  const { data: session } = useSession();
  const user = session?.user;
  const containerRef = useRef(null);
  const videoRef = useRef(null);

  // Interactive States
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(
    product.star_rating > 0 ? Math.floor(product.star_rating * 123) : 24,
  );
  const [isSaved, setIsSaved] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [statusLoaded, setStatusLoaded] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // Fetch initial status and comments when active or just mounted
  useEffect(() => {
    if (!product._id) return;

    // Fetch comments
    fetch(`/api/reels/${product._id}/comments`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setComments(data.comments || []);
      })
      .catch(err => console.error(err));

    // Fetch user specific status
    if (user && !statusLoaded) {
      fetch(`/api/reels/${product._id}/status`)
        .then(res => res.json())
        .then(data => {
          setIsLiked(data.isLiked);
          setIsSaved(data.isSaved);
          setStatusLoaded(true);
        })
        .catch(err => console.error(err));
    }
  }, [product._id, user, statusLoaded]);

  // Robustly extract video URL from productData schema variations
  let videoUrl = null;
  const vList = product.carousel?.videos || product.videos;
  if (Array.isArray(vList) && vList.length > 0) {
    const v = vList[0];
    videoUrl = typeof v === "string" ? v : v?.url || v?.src;
  } else if (typeof product.video === "string") {
    videoUrl = product.video;
  } else if (typeof product.primary_video === "string") {
    videoUrl = product.primary_video;
  }

  // Fallback to gif or image if no video
  const mediaUrl = videoUrl || product.primary_gif || product.primary_image;
  const isVideo = !!videoUrl || !!mediaUrl?.match(/\.(mp4|webm|ogg)$/i);

  // Playback control
  useEffect(() => {
    if (!videoRef.current) return;

    if (isActive) {
      videoRef.current.play().catch((e) => console.log("Autoplay blocked:", e));
      setIsPaused(false);
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPaused(false);
    }
  }, [isActive]);

  const handleVideoTap = () => {
    if (!videoRef.current) return;
    if (isPaused) {
      videoRef.current.play().catch(() => {});
      setIsPaused(false);
    } else {
      videoRef.current.pause();
      setIsPaused(true);
    }
  };

  const handleMuteToggle = (e) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted((m) => !m);
  };

  const handleLike = async () => {
    if (!user) return toast.error("Please login to like reels");
    
    // Optimistic UI update
    const prevLiked = isLiked;
    setIsLiked(!isLiked);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
    if (!isLiked) toast.success("Added to liked reels!");

    try {
      const res = await fetch(`/api/reels/${product._id}/like`, { method: "POST" });
      const data = await res.json();
      // Only revert if failed
      if (res.status !== 200) {
        setIsLiked(prevLiked);
        setLikeCount((prev) => (prevLiked ? prev + 1 : prev - 1));
      }
    } catch (e) {
      setIsLiked(prevLiked);
      setLikeCount((prev) => (prevLiked ? prev + 1 : prev - 1));
    }
  };

  const handleSave = async () => {
    if (!user) return toast.error("Please login to save reels");

    const prevSaved = isSaved;
    setIsSaved(!isSaved);
    if (!isSaved) toast.success("Saved to your collections!");

    try {
      const res = await fetch(`/api/reels/${product._id}/save`, { method: "POST" });
      if (res.status !== 200) {
        setIsSaved(prevSaved);
      }
    } catch (e) {
      setIsSaved(prevSaved);
    }
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Check out ${product.name}`,
          url: url,
        });
      } catch (err) {
        console.log("Share failed", err);
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) {
      if (!user) toast.error("Please login to comment");
      return;
    }

    const tempText = newComment.trim();
    setNewComment("");
    
    try {
      const res = await fetch(`/api/reels/${product._id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: tempText })
      });
      const data = await res.json();
      
      if (data.success) {
        setComments((prev) => [data.comment, ...prev]);
        toast.success("Comment posted!");
      } else {
        toast.error("Failed to post comment");
      }
    } catch (err) {
      toast.error("Network error");
    }
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative bg-gray-950 flex items-center justify-center overflow-hidden"
      onClick={handleVideoTap}
    >
      {/* Media Layer */}
      {mediaUrl ? (
        isVideo ? (
          <video
            ref={videoRef}
            src={mediaUrl}
            className="w-full h-full object-cover opacity-95"
            playsInline
            loop
            muted={isMuted}
            // We control play/pause via useEffect to ensure lazy load
          />
        ) : (
          <Image
            src={mediaUrl}
            alt={product.name || "Reel"}
            fill
            className="object-cover opacity-95 transition-opacity duration-700"
            priority={isActive}
            unoptimized
          />
        )
      ) : (
        <div className="text-gray-500 font-bold">No Media Available</div>
      )}

      {/* Bottom Gradient for text readability */}
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

      {/* Pause overlay (shows briefly on tap) */}
      {isPaused && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="h-20 w-20 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center">
            <Pause className="h-9 w-9 text-white" />
          </div>
        </div>
      )}

      {/* Mute toggle — top left */}
      <button
        onClick={handleMuteToggle}
        className="absolute top-12 left-4 z-30 h-10 w-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/15 flex items-center justify-center text-white hover:bg-black/70 transition-all active:scale-90"
      >
        {isMuted ? <VolumeX className="h-4.5 w-4.5 h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
      </button>

      {/* Overlay controls - Right side (TikTok style) */}
      <div className="absolute right-4 bottom-[100px] lg:bottom-12 flex flex-col items-center gap-6 z-10 pb-env(safe-area-inset-bottom)">
        {/* Like Button */}
        <button
          onClick={handleLike}
          className="flex flex-col items-center gap-1 group transition-transform active:scale-90"
        >
          <div
            className={cn(
              "p-3 rounded-full backdrop-blur-md transition-all border",
              isLiked
                ? "bg-red-500/20 border-red-500/50"
                : "bg-black/40 border-white/10 group-hover:bg-white/20",
            )}
          >
            <Heart
              className={cn(
                "w-6 h-6 lg:w-7 lg:h-7 transition-colors",
                isLiked ? "fill-red-500 text-red-500" : "text-white",
              )}
            />
          </div>
          <span className="text-white text-xs lg:text-sm font-bold drop-shadow-md">
            {likeCount > 999 ? (likeCount / 1000).toFixed(1) + "k" : likeCount}
          </span>
        </button>

        {/* Comment Button */}
        <button
          onClick={() => setShowComments(true)}
          className="flex flex-col items-center gap-1 group transition-transform active:scale-90"
        >
          <div className="p-3 rounded-full bg-black/40 backdrop-blur-md group-hover:bg-white/20 transition-all border border-white/10">
            <MessageCircle className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
          </div>
          <span className="text-white text-xs lg:text-sm font-bold drop-shadow-md">
            {comments.length}
          </span>
        </button>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="flex flex-col items-center gap-1 group transition-transform active:scale-90"
        >
          <div
            className={cn(
              "p-3 rounded-full backdrop-blur-md transition-all border",
              isSaved
                ? "bg-yellow-500/20 border-yellow-500/50"
                : "bg-black/40 border-white/10 group-hover:bg-white/20",
            )}
          >
            <Bookmark
              className={cn(
                "w-6 h-6 lg:w-7 lg:h-7 transition-colors",
                isSaved ? "fill-yellow-500 text-yellow-500" : "text-white",
              )}
            />
          </div>
          <span className="text-white text-xs lg:text-sm font-bold drop-shadow-md">
            Save
          </span>
        </button>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="flex flex-col items-center gap-1 group transition-transform active:scale-90"
        >
          <div className="p-3 rounded-full bg-black/40 backdrop-blur-md group-hover:bg-white/20 transition-all border border-white/10">
            <Share2 className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
          </div>
          <span className="text-white text-xs lg:text-sm font-bold drop-shadow-md">
            Share
          </span>
        </button>
      </div>

      {/* Product Info - Bottom left */}
      <div className="absolute bottom-[100px] lg:bottom-12 left-4 right-20 z-10 text-white drop-shadow-md pb-env(safe-area-inset-bottom)">
        <h2 className="text-xl lg:text-2xl font-black line-clamp-2 mb-2">
          {product.name}
        </h2>

        {product.product_features?.pros && (
          <p className="text-sm font-medium opacity-90 line-clamp-2 text-primary-50">
            ✨ {product.product_features.pros.join(" • ")}
          </p>
        )}

        <div className="flex items-center gap-2 mt-3">
          <span className="px-2 py-1 bg-primary/80 backdrop-blur-sm rounded-lg text-xs font-bold shadow-lg border border-primary/50">
            {product.stage ? product.stage.replace(/_/g, " ") : "Trending"}
          </span>
          {product.product_cost && (
            <span className="px-2 py-1 bg-emerald-500/20 backdrop-blur-sm rounded-lg text-xs font-bold shadow-lg border border-emerald-500/50 text-emerald-300">
              ₹{product.product_cost}
            </span>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            // open in new tab
            const email = user?.email || "";
            window.open(
              `https://dash.vfulfill.io/signup?email=${email}`,
              "_blank",
            );
          }}
          className="mt-4 w-full sm:max-w-[180px] px-5 py-2.5 bg-white text-black font-black uppercase tracking-wider text-[11px] rounded-xl flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(255,255,255,0.25)] hover:shadow-[0_4px_25px_rgba(255,255,255,0.4)] hover:scale-105 active:scale-95 transition-all duration-300 group"
        >
          <ShoppingCart className="w-4 h-4 text-black group-hover:-rotate-6 transition-transform" />
          Get Quote
        </button>
      </div>

      {/* Comments Drawer (Slide Up) */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 lg:left-0 lg:right-24 h-[65%] lg:h-[75%] rounded-t-[2.5rem] border-t border-white/20 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] z-50 flex flex-col overflow-hidden",
          showComments ? "translate-y-0" : "translate-y-full"
        )}
      >
        {/* Background Blur Layer */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between p-5 border-b border-white/10 shrink-0">
          <h3 className="text-white font-black text-lg tracking-tight flex items-center gap-2">
            Comments 
            <span className="px-2 py-0.5 rounded-md bg-white/10 text-xs font-bold text-white/80">
              {comments.length}
            </span>
          </h3>
          <button
            onClick={() => setShowComments(false)}
            className="p-2.5 rounded-full bg-white/5 hover:bg-white/20 transition-colors active:scale-95"
          >
            <X className="w-5 h-5 text-white/80" />
          </button>
        </div>

        {/* Comments List */}
        <div className="relative z-10 flex-1 overflow-y-auto p-5 space-y-6 hide-scrollbar flex flex-col">
          {comments.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-70">
              <MessageCircle className="w-12 h-12 text-white/30 mb-3" />
              <p className="text-white font-medium text-sm">No comments yet.</p>
              <p className="text-white/60 text-xs mt-1">Be the first to share your thoughts!</p>
            </div>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="flex gap-3 items-start animate-fade-in">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-rose-500 flex items-center justify-center shrink-0 shadow-lg ring-2 ring-black/50">
                  <span className="text-white text-xs font-black uppercase shadow-sm">
                    {c.user?.[0] || "?"}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-white/70 text-xs font-bold bg-white/5 px-2 py-0.5 rounded-md">
                      {c.user || "Anonymous"}
                    </span>
                  </div>
                  <p className="text-white text-[15px] font-medium mt-1.5 leading-snug drop-shadow-sm">
                    {c.text}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input Form */}
        <form
          onSubmit={submitComment}
          className="relative z-10 p-4 border-t border-white/10 bg-black/40 backdrop-blur-lg flex gap-3 items-center shrink-0 pb-env(safe-area-inset-bottom)"
        >
          <div className="flex-1 relative">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full bg-white/10 border border-white/10 hover:bg-white/15 focus:bg-white/20 rounded-2xl px-5 py-3.5 text-white text-[15px] font-medium placeholder:text-white/40 focus:outline-none focus:border-white/30 transition-all shadow-inner"
            />
          </div>
          <button
            type="submit"
            disabled={!newComment.trim()}
            className="w-12 h-12 rounded-2xl bg-white text-black hover:bg-white/90 flex items-center justify-center disabled:opacity-30 disabled:hover:bg-white disabled:cursor-not-allowed shrink-0 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            <Send className="w-5 h-5 -ml-1 mt-0.5 fill-black" />
          </button>
        </form>
      </div>

      {/* Click outside overlay to close comments */}
      {showComments && (
        <div
          className="absolute inset-0 bg-black/50 z-40"
          onClick={() => setShowComments(false)}
        />
      )}
    </div>
  );
}
