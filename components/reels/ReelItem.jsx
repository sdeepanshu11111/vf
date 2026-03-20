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
  const [comments, setComments] = useState([
    {
      id: 1,
      user: "Alex_Ecom",
      text: "Is this product actually good for scaling?",
    },
    {
      id: 2,
      user: "Sarah_Dropship",
      text: "Tested this last week, insane ROAS!",
    },
    { id: 3, user: "DropshipKing", text: "What's the average shipping time?" },
  ]);
  const [newComment, setNewComment] = useState("");

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
  // It's a video if we found a valid video URL, or if the media URL ends in a video extension
  const isVideo = !!videoUrl || !!mediaUrl?.match(/\.(mp4|webm|ogg)$/i);

  // Playback control
  useEffect(() => {
    if (!videoRef.current) return;

    if (isActive) {
      videoRef.current.play().catch((e) => console.log("Autoplay blocked:", e));
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isActive]);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
    if (!isLiked) toast.success("Added to liked products!");
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    if (!isSaved) toast.success("Saved to your collections!");
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

  const submitComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setComments([
      ...comments,
      { id: Date.now(), user: "You", text: newComment },
    ]);
    setNewComment("");
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative bg-gray-950 flex items-center justify-center overflow-hidden"
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
            muted
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
          "absolute bottom-0 left-0 right-0 lg:left-0 lg:right-24 h-[60%] bg-[#0f172a] rounded-t-3xl border-t border-white/10 transition-transform duration-300 ease-out z-50 flex flex-col",
          showComments ? "translate-y-0" : "translate-y-full",
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-white font-bold text-lg">
            Comments ({comments.length})
          </h3>
          <button
            onClick={() => setShowComments(false)}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <span className="text-primary text-xs font-bold">
                  {c.user[0]}
                </span>
              </div>
              <div>
                <span className="text-gray-400 text-xs font-medium">
                  {c.user}
                </span>
                <p className="text-white text-sm">{c.text}</p>
              </div>
            </div>
          ))}
        </div>

        <form
          onSubmit={submitComment}
          className="p-4 border-t border-white/10 flex gap-2"
        >
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 text-white text-sm focus:outline-none focus:border-primary transition-colors"
          />
          <button
            type="submit"
            disabled={!newComment.trim()}
            className="w-10 h-10 rounded-full bg-primary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            <Send className="w-4 h-4 text-white -ml-0.5 mt-0.5" />
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
