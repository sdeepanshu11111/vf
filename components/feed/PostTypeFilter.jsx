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
    <div className="flex items-center justify-start sm:justify-center w-full mb-6 relative z-10 pt-2">
      <div className="flex gap-1 p-1 bg-white dark:bg-[#0f172a] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm overflow-x-auto hide-scrollbar w-max max-w-full">
        {types.map((t) => {
          const isActive = activeType === t.value;
          return (
            <button
              key={t.value || "all"}
              onClick={() => onTypeChange(t.value)}
              className={cn(
                "relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 outline-none shrink-0",
                isActive 
                  ? "text-primary dark:text-white" 
                  : "text-muted-foreground hover:text-foreground hover:bg-gray-50 dark:hover:bg-white/5"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="feedTypeIndicator"
                  className="absolute inset-0 bg-primary/10 dark:bg-white/10 rounded-xl"
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
