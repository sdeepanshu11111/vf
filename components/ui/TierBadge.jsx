"use client";

import { cn } from "@/lib/utils";

const tierConfig = {
  starter: {
    label: "Starter",
    className: "bg-[#514de2]/10 text-[#514de2] border-[#514de2]/20 shadow-[0_0_12px_rgba(81,77,226,0.1)]",
  },
  growth: {
    label: "Growth",
    className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.1)]",
  },
  scale: {
    label: "Scale",
    className: "bg-amber-500/10 text-amber-600 border-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.1)]",
  },
};

export default function TierBadge({ tier, size = "sm", className }) {
  const config = tierConfig[tier] || tierConfig.starter;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-xl border font-black uppercase tracking-widest",
        size === "xs" ? "px-2 py-0.5 text-[8px]" : 
        size === "sm" ? "px-3 py-1 text-[10px]" : 
        "px-4 py-1.5 text-[12px]",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
