"use client";

import { useRef } from "react";
import Image from "next/image";
import { Heart, MessageCircle, Share2, Bookmark } from "lucide-react";

export default function ReelItem({ product, isActive }) {
  const containerRef = useRef(null);
  
  // Choose the best media to show
  const mediaUrl = product.primary_video || product.primary_gif || product.primary_image;
  // Let's assume some urls might be actual video, but standard images otherwise.
  const isVideo = mediaUrl?.match(/\.(mp4|webm|ogg)$/i) || product.videos_available;

  return (
    <div 
      ref={containerRef}
      className="w-full h-full relative bg-gray-950 flex items-center justify-center overflow-hidden"
    >
      {/* Media Layer */}
      {mediaUrl ? (
        isVideo ? (
          <video
            src={mediaUrl}
            className="w-full h-full object-cover opacity-95"
            playsInline
            loop
            muted
            autoPlay={isActive}
            // If it's not active, we can pause it to save resources (handled implicitly if autoplay triggers, but better managed via custom hook in production)
          />
        ) : (
          <Image 
            src={mediaUrl} 
            alt={product.name || "Reel"} 
            fill
            className="object-cover opacity-95 transition-opacity duration-700"
            priority={isActive}
            unoptimized // Useful for external URLs without next.config.js whitelisting
          />
        )
      ) : (
        <div className="text-gray-500 font-bold">No Media Available</div>
      )}

      {/* Bottom Gradient for text readability */}
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

      {/* Overlay controls - Right side (TikTok style) */}
      <div className="absolute right-4 bottom-[100px] lg:bottom-12 flex flex-col items-center gap-6 z-10 pb-env(safe-area-inset-bottom)">
        <button className="flex flex-col items-center gap-1 group transition-transform active:scale-90">
          <div className="p-3 rounded-full bg-black/40 backdrop-blur-md group-hover:bg-white/20 transition-all border border-white/10">
            <Heart className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
          </div>
          <span className="text-white text-xs lg:text-sm font-bold drop-shadow-md">
            {product.star_rating > 0 ? (product.star_rating * 1.2).toFixed(1) + "k" : "Like"}
          </span>
        </button>
        <button className="flex flex-col items-center gap-1 group transition-transform active:scale-90">
          <div className="p-3 rounded-full bg-black/40 backdrop-blur-md group-hover:bg-white/20 transition-all border border-white/10">
            <MessageCircle className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
          </div>
          <span className="text-white text-xs lg:text-sm font-bold drop-shadow-md">
            12
          </span>
        </button>
        <button className="flex flex-col items-center gap-1 group transition-transform active:scale-90">
          <div className="p-3 rounded-full bg-black/40 backdrop-blur-md group-hover:bg-white/20 transition-all border border-white/10">
            <Bookmark className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
          </div>
          <span className="text-white text-xs lg:text-sm font-bold drop-shadow-md">
            Save
          </span>
        </button>
        <button className="flex flex-col items-center gap-1 group transition-transform active:scale-90">
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
        <h2 className="text-xl lg:text-2xl font-black line-clamp-2 mb-2">{product.name}</h2>
        
        {product.product_features?.pros && (
          <p className="text-sm font-medium opacity-90 line-clamp-2 text-primary-50">
            ✨ {product.product_features.pros.join(" • ")}
          </p>
        )}
        
        <div className="flex items-center gap-2 mt-3">
          <span className="px-2 py-1 bg-primary/80 backdrop-blur-sm rounded-lg text-xs font-bold shadow-lg border border-primary/50">
            {product.stage.replace(/_/g, " ")}
          </span>
          {product.product_cost && (
            <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-xs font-bold shadow-lg border border-white/20">
              ₹{product.product_cost}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
