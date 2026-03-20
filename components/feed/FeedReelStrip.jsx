"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { Heart, Play, Volume2, VolumeX, Clapperboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

// A single compact reel preview card for display in the feed
function MiniReelCard({ reel, onLikeToggle }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(
    reel.star_rating > 0 ? Math.floor(reel.star_rating * 123) : 24
  );
  const { data: session } = useSession();

  // Extract video URL
  const getVideoUrl = (product) => {
    if (product.carousel?.videos?.length > 0) return product.carousel.videos[0];
    if (product.videos?.length > 0) return product.videos[0];
    if (product.video) return product.video;
    if (product.primary_video) return product.primary_video;
    return null;
  };

  const videoUrl = getVideoUrl(reel);
  const title = reel.name || reel.title || "Product Reel";
  const brand = reel.brand || reel.vendor || "";

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!session) return;
    setIsLiked((prev) => !prev);
    setLikeCount((prev) => isLiked ? prev - 1 : prev + 1);
    try {
      await fetch(`/api/reels/${reel._id}/like`, { method: "POST" });
    } catch {}
  };

  if (!videoUrl) return null;

  return (
    <div className="relative rounded-2xl overflow-hidden bg-black shadow-md aspect-[9/16] cursor-pointer group" onClick={togglePlay}>
      <video
        ref={videoRef}
        src={videoUrl}
        muted={isMuted}
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

      {/* Play indicator */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
            <Play className="h-6 w-6 text-white fill-white ml-0.5" />
          </div>
        </div>
      )}

      {/* Top controls */}
      <button
        onClick={toggleMute}
        className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center border border-white/10 text-white"
      >
        {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
      </button>

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 p-3 flex items-end justify-between">
        <div className="max-w-[80%]">
          <p className="text-white text-xs font-black line-clamp-2 leading-tight">{title}</p>
          {brand && <p className="text-white/60 text-[10px] font-bold mt-0.5">{brand}</p>}
        </div>
        <button onClick={handleLike} className="flex flex-col items-center gap-0.5 text-white">
          <Heart className={cn("h-5 w-5 transition-all", isLiked ? "fill-red-400 text-red-400 scale-105" : "fill-transparent")} />
          <span className="text-[9px] font-black">{likeCount}</span>
        </button>
      </div>
    </div>
  );
}

// The strip of reels shown in the feed
export default function FeedReelStrip() {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reels?page=1&limit=6")
      .then((r) => r.json())
      .then((d) => setReels(d.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (!reels.length) return null;

  return (
    <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-xl bg-primary/10 flex items-center justify-center">
            <Clapperboard className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="font-black text-sm text-gray-900 dark:text-white tracking-tight">Trending Reels</span>
        </div>
        <Link
          href="/reels"
          className="text-xs font-bold text-primary hover:text-primary/80 transition-colors"
        >
          View all →
        </Link>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {reels.slice(0, 4).map((reel) => (
          <MiniReelCard key={reel._id} reel={reel} />
        ))}
      </div>
    </div>
  );
}
