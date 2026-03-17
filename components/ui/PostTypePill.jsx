"use client";

import { cn } from "@/lib/utils";

const typeConfig = {
  win: {
    label: "🏆 Win",
    className: "bg-green-100 text-green-700 border-green-200",
  },
  tip: {
    label: "💡 Tip",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  question: {
    label: "❓ Question",
    className: "bg-purple-100 text-purple-700 border-purple-200",
  },
  sourcing: {
    label: "📦 Sourcing",
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
};

export default function PostTypePill({ type }) {
  const config = typeConfig[type] || typeConfig.tip;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        config.className,
      )}
    >
      {config.label}
    </span>
  );
}
