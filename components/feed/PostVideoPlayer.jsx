"use client";

import { useRef, useState, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PostVideoPlayer({ src, poster }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [showPlayIcon, setShowPlayIcon] = useState(false);

  // Intersection Observer for autoplay
  useEffect(() => {
    const options = {
      threshold: 0.6, // Play when 60% of the video is visible
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          videoRef.current?.play().catch(() => {
            // Autoplay might be blocked if not muted or no interaction
            setIsPlaying(false);
          });
          setIsPlaying(true);
        } else {
          videoRef.current?.pause();
          setIsPlaying(false);
        }
      });
    }, options);

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  const [progress, setProgress] = useState(0);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(currentProgress);
    }
  };

  const togglePlay = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
      setShowPlayIcon(true);
      setTimeout(() => setShowPlayIcon(false), 800);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      setShowPlayIcon(true);
      setTimeout(() => setShowPlayIcon(false), 800);
    }
  };

  const toggleMute = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const newMuted = !isMuted;
    videoRef.current.muted = newMuted;
    setIsMuted(newMuted);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden bg-black rounded-2xl group cursor-pointer"
      onClick={togglePlay}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        muted={isMuted}
        loop
        playsInline
        onTimeUpdate={handleTimeUpdate}
        className="w-full h-full object-contain max-h-[600px] min-h-[300px]"
      />

      {/* Centered Play/Pause Icon Update */}
      <div className={cn(
        "absolute inset-0 flex items-center justify-center transition-opacity duration-300 pointer-events-none z-10",
        showPlayIcon ? "opacity-100 scale-110" : "opacity-0 scale-95"
      )}>
        <div className="bg-black/40 backdrop-blur-md p-6 rounded-full border border-white/20">
          {!isPlaying ? (
            <Play className="h-8 w-8 text-white fill-white" />
          ) : (
            <Pause className="h-8 w-8 text-white fill-white" />
          )}
        </div>
      </div>

      {/* Bottom Controls Overlay */}
      <div className={cn(
        "absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-300 flex items-center justify-between z-20",
        showControls ? "opacity-100" : "opacity-0 sm:group-hover:opacity-100"
      )}>
        <button
          onClick={togglePlay}
          className="p-2 rounded-full hover:bg-white/20 transition-colors text-white"
        >
          {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
        </button>

        <button
          onClick={toggleMute}
          className="p-2 rounded-full hover:bg-white/20 transition-colors text-white"
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      </div>

      {/* Progress Bar (mini) */}
      <div 
        className="absolute bottom-0 left-0 h-1 bg-primary z-30 transition-all duration-100 ease-linear" 
        style={{ width: `${progress}%` }} 
      />
    </div>
  );
}
