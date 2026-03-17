"use client";

import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PointsBadge({ points, size = "sm" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
      )}
    >
      <Trophy className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />
      {points?.toLocaleString() || 0}
    </span>
  );
}
