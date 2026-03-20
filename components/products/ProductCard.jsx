"use client";

import { useState } from "react";
import { Link } from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function ProductCard({ product }) {
  const title = product?.name || "Premium Product";
  
  // Intelligently parse cost range to save horizontal space (e.g. "759 - 3332" -> "759+")
  let cost = product?.product_cost || product?.custom_pricing?.min || "N/A";
  if (typeof cost === "string" && cost.includes("-")) {
    cost = `${cost.split("-")[0].trim()}+`;
  }

  // Round margin to whole number
  let margin = 0;
  if (product?.profit_margin !== undefined && product?.profit_margin !== null) {
    margin = Math.round(Number(product.profit_margin));
  }

  // Clean tags - horizontal joined string rather than heavy vertical pills
  const pros = product?.product_features?.pros?.slice(0, 2) || [];
  const joinedPros = pros.join(" • ");

  // Handle stage/class intelligently for the primary badge
  const badgeText = product?.stage ? product.stage.replace(/_/g, " ") : (product?.classification?.replace(/_/g, " ") || "NEW");

  // Image fallback state
  const initialThumbnail = product?.primary_image || "https://placehold.co/600x600/111827/ffffff?text=Product";
  const [imgSrc, setImgSrc] = useState(initialThumbnail);

  return (
    <div className="bg-white dark:bg-[#0f172a] group flex flex-col rounded-[24px] border border-gray-200/60 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-500 cursor-pointer h-full relative overflow-hidden">
      
      {/* Sleek Image Header with bottom fade */}
      <div className="relative h-[220px] w-full shrink-0 overflow-hidden bg-gray-50 dark:bg-black/40">
        <img
          src={imgSrc}
          onError={() => setImgSrc("https://placehold.co/600x600/f8fafc/94a3b8?text=Image+Unavailable")}
          alt={title}
          loading="lazy"
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        
        {/* Modern Minimal Badge with subtle ping animation indicator */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-white/95 dark:bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-gray-200/50 dark:border-white/10 shadow-sm max-w-[180px]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          <span className="text-[9px] font-black uppercase tracking-widest text-gray-900 dark:text-white truncate">
            {badgeText}
          </span>
        </div>

        {/* Gradient Fade to Content */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white dark:from-[#0f172a] to-transparent pointer-events-none" />
      </div>

      {/* Content flows seamlessly from the faded image */}
      <div className="px-6 pb-6 flex flex-col flex-1 relative z-10 -mt-6">
        
        {/* Title */}
        <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-snug mb-1.5 line-clamp-2" title={title}>
          {title}
        </h3>

        {/* Pros subtle list */}
        {joinedPros && (
          <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 tracking-wider uppercase mb-5 truncate max-w-full">
            {joinedPros}
          </p>
        )}

        <div className="mt-auto"></div>

        {/* Modern Economy Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-gray-50 dark:bg-white/5 rounded-[16px] p-3.5 border border-gray-100 dark:border-white/5 flex flex-col justify-center transition-colors group-hover:bg-gray-100 dark:group-hover:bg-white/10">
             <span className="text-gray-400 dark:text-gray-500 text-[9px] font-bold uppercase tracking-widest mb-1">Cost</span>
             <span className="font-black text-gray-900 dark:text-white text-[15px] truncate">₹{cost}</span>
          </div>
          
          <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-[16px] p-3.5 border border-emerald-100 dark:border-emerald-500/20 flex flex-col justify-center transition-colors group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20">
             <span className="text-emerald-500 dark:text-emerald-400 text-[9px] font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
               <Sparkles className="h-3 w-3" /> Profit
             </span>
             <span className="font-black text-emerald-600 dark:text-emerald-400 text-[15px] truncate">{margin}%</span>
          </div>
        </div>

        {/* Premium Dark Action Button */}
        <button className="w-full bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-black dark:hover:bg-gray-100 text-white rounded-[14px] py-3.5 px-6 flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest shadow-md transition-all active:scale-[0.98]">
          Analyze Product
          <ArrowRight className="w-4 h-4 ml-0.5" />
        </button>
      </div>
    </div>
  );
}
