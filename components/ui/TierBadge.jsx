"use client";

import { cn } from "@/lib/utils";

const tierConfig = {
  starter: {
    label: "Starter",
    className: "bg-gray-100 text-gray-600 border-gray-200",
  },
  growth: {
    label: "Growth",
    className: "bg-blue-100 text-blue-600 border-blue-200",
  },
  scale: {
    label: "Scale",
    className: "bg-orange-100 text-orange-600 border-orange-200",
  },
};

export default function TierBadge({ tier, size = "sm" }) {
  const config = tierConfig[tier] || tierConfig.starter;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        config.className,
      )}
    >
      {config.label}
    </span>
  );
}
