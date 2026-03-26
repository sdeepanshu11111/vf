"use client";

import { useState } from "react";
import { Link } from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProductCard({ product }) {
  const title = product?.name || "Premium Product";
  
  // Parse cost
  let rawCost = product?.product_cost || product?.custom_pricing?.min || "120";
  if (typeof rawCost === "string" && rawCost.includes("-")) {
    rawCost = rawCost.split("-")[0].trim();
  }
  const numericCost = parseFloat(rawCost.toString().replace(/[^0-9.]/g, "")) || 120;
  
  // Deterministic mock for price and pc ratio if not provided by backend
  const multiplier = 4.0 + (title.length % 10) / 10; // e.g. 4.0 to 4.9
  const price = product?.selling_price || Math.floor(numericCost * multiplier);
  const pcRatio = product?.pc_ratio || (price / numericCost).toFixed(2);

  // Badge mapping
  const rawStage = product?.stage ? product.stage.replace(/_/g, " ") : (product?.classification?.replace(/_/g, " ") || "VALIDATED");
  const getStageConfig = (stageText) => {
    const text = stageText.toUpperCase();
    if (text.includes("VALIDATED")) return { bg: "bg-emerald-500", text: "text-white" };
    if (text.includes("INNER CIRCLE")) return { bg: "bg-primary", text: "text-white" };
    if (text.includes("RESEARCHED")) return { bg: "bg-slate-500", text: "text-white" };
    if (text.includes("WINNER")) return { bg: "bg-amber-500", text: "text-gray-900" };
    return { bg: "bg-[#10b981]", text: "text-white" }; // default green
  };
  const stageConfig = getStageConfig(rawStage);

  // Flag logic (fallback to China since dropship dominates there, or IN if specified)
  const flag = product?.country === "IN" ? "🇮🇳" : "🇨🇳";

  // Image
  const initialThumbnail = product?.primary_image || "https://placehold.co/600x600/f8fafc/94a3b8?text=Product";
  const [imgSrc, setImgSrc] = useState(initialThumbnail);

  const handleExplore = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const vfpd = product?.vfprodid || "N/A";
    const message = `Hi, I am interested in exploring this product: ${title} (ID: ${vfpd}). Can you provide more details?`;
    
    if (typeof window !== "undefined" && window.Intercom) {
      window.Intercom('showNewMessage', message);
    }
  };

  return (
    <div 
      onClick={handleExplore}
      className="bg-white group flex flex-col rounded-[20px] border border-gray-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full relative overflow-hidden"
    >
      
      {/* Image Area */}
      <div className="relative h-[220px] w-full shrink-0 overflow-hidden bg-gray-50">
        <img
          src={imgSrc}
          onError={() => setImgSrc("https://placehold.co/600x600/f8fafc/94a3b8?text=Image+Unavailable")}
          alt={title}
          loading="lazy"
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        
        {/* Top Badges */}
        <div className={cn(
          "absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm",
          stageConfig.bg,
          stageConfig.text
        )}>
          {rawStage}
        </div>
        
        <div className="absolute top-3 right-3 z-10 text-lg shadow-sm drop-shadow-md">
          {flag}
        </div>

        {/* Bottom Badges */}
        <div className="absolute bottom-3 left-3 z-10 bg-[#10b981] text-white px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm flex items-center gap-1">
          ⚡ 48hrs
        </div>
        
        <div className="absolute bottom-3 right-3 z-10 bg-[#f59e0b] text-white px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm flex items-center gap-1">
          ⭐ {product?.star_rating || "9.0"}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5 flex flex-col flex-1">
        
        <h3 className="font-bold text-gray-900 text-[15px] leading-tight line-clamp-2 mb-2" title={title}>
          {title}
        </h3>

        <div className="mt-auto pt-3">
          {/* Stats Row */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex flex-col items-center flex-1">
              <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">Cost</span>
              <span className="text-gray-900 font-bold text-[13px]">₹{numericCost}</span>
            </div>
            <div className="flex flex-col items-center flex-1">
              <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">Price</span>
              <span className="text-gray-900 font-bold text-[13px]">₹{price}</span>
            </div>
            <div className="flex flex-col items-center flex-1">
              <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">P/C</span>
              <span className="text-[#10b981] font-bold text-[13px]">{pcRatio}x</span>
            </div>
          </div>

          {/* Action Button */}
          <button 
            onClick={handleExplore}
            className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl py-2.5 font-bold text-[13px] tracking-wide flex items-center justify-center gap-1.5 transition-colors"
          >
            Explore <ArrowRight className="w-4 h-4 ml-0.5" />
          </button>
        </div>
      </div>
      
    </div>
  );
}
