"use client";

import { cn } from "@/lib/utils";

const types = [
  { value: null, label: "All" },
  { value: "win", label: "🏆 Wins" },
  { value: "tip", label: "💡 Tips" },
  { value: "question", label: "❓ Questions" },
  { value: "sourcing", label: "📦 Sourcing" },
];

import { motion } from "framer-motion";

export default function PostTypeFilter({ activeType, onTypeChange }) {
  return (
    <div className="flex items-center justify-start w-full relative z-10">
      <div className="flex gap-1.5 p-1 bg-transparent rounded-2xl overflow-x-auto hide-scrollbar w-full max-w-full">
        {types.map((t) => {
          const isActive = activeType === t.value;
          return (
            <button
              key={t.value || "all"}
              onClick={() => onTypeChange(t.value)}
              className={cn(
                "relative flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-[13px] sm:text-sm font-bold transition-all duration-300 outline-none shrink-0 whitespace-nowrap",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/80"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="feedTypeIndicator"
                  className="absolute inset-0 bg-primary/10 rounded-xl border border-primary/15"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
