"use client";

import { cn } from "@/lib/utils";

const types = [
  { value: null, label: "All" },
  { value: "win", label: "🏆 Wins" },
  { value: "tip", label: "💡 Tips" },
  { value: "question", label: "❓ Questions" },
  { value: "sourcing", label: "📦 Sourcing" },
];

export default function PostTypeFilter({ activeType, onTypeChange }) {
  return (
    <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
      {types.map((t) => (
        <button
          key={t.value || "all"}
          onClick={() => onTypeChange(t.value)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
            activeType === t.value
              ? "bg-[#FF6B35] text-white shadow-sm"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200",
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
