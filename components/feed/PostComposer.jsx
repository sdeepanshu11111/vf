"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Image as ImageIcon, Hash, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/ui/UserAvatar";
import { cn } from "@/lib/utils";

const postTypes = [
  { value: "tip", label: "Tip", icon: Zap, color: "text-blue-500 bg-blue-50 border-blue-100" },
  { value: "win", label: "Win", icon: Zap, color: "text-green-500 bg-green-50 border-green-100" },
  { value: "question", label: "Ask", icon: Zap, color: "text-purple-500 bg-purple-50 border-purple-100" },
  { value: "sourcing", label: "Source", icon: Zap, color: "text-amber-500 bg-amber-50 border-amber-100" },
];

export default function PostComposer({ onPostCreated }) {
  const { data: session } = useSession();
  const [content, setContent] = useState("");
  const [type, setType] = useState("tip");
  const [tags, setTags] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [showImageInput, setShowImageInput] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() || !type) return;
    setIsSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          content: content.trim(),
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
          images: imageUrl.trim() ? [imageUrl.trim()] : [],
        }),
      });
      if (res.ok) {
        setContent(""); setTags(""); setImageUrl("");
        setShowImageInput(false); setIsExpanded(false);
        onPostCreated?.();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create post.");
      }
    } catch { setError("Network error."); }
    finally { setIsSubmitting(false); }
  };

  if (!session) return null;

  return (
    <div className="bg-white dark:bg-[#0f172a] mb-8 overflow-visible rounded-3xl shadow-sm border border-gray-100 dark:border-white/5 relative z-10">
      <div className="p-5 sm:p-6 transition-all">
        <div className="flex items-start gap-4">
          <UserAvatar src={session.user.avatar} name={session.user.name} size="md" className="shrink-0 ring-4 ring-gray-50 dark:ring-white/5 shadow-sm mt-1" />
          <div className="flex-1 min-w-0">
            <textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setIsExpanded(true)}
              className="w-full resize-none border-0 bg-transparent text-lg font-medium placeholder:text-muted-foreground/60 text-foreground focus:outline-none focus:ring-0 transition-all min-h-[50px] leading-relaxed pt-2"
              rows={isExpanded ? 3 : 1}
            />

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 pt-5 border-t border-gray-100 dark:border-white/5 space-y-5">
                    
                    {/* Tags Selection */}
                    <div className="flex flex-wrap gap-2">
                      {postTypes.map((pt) => {
                        const isSelected = type === pt.value;
                        return (
                          <button
                            key={pt.value}
                            onClick={() => setType(pt.value)}
                            className={cn(
                              "relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 overflow-hidden outline-none",
                              isSelected ? "text-white shadow-md scale-[1.02]" : "text-muted-foreground bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-100 dark:border-transparent"
                            )}
                          >
                            {isSelected && (
                              <motion.div 
                                layoutId="composerTypeBg"
                                className="absolute inset-0 bg-primary -z-10"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.2 }}
                              />
                            )}
                            {pt.label}
                          </button>
                        )
                      })}
                    </div>

                    {/* Inputs */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1 relative group">
                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                        <input
                          type="text"
                          placeholder="Tags (comma separated)"
                          value={tags}
                          onChange={(e) => setTags(e.target.value)}
                          className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-transparent rounded-2xl pl-10 pr-4 py-3.5 text-sm font-medium focus:outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all"
                        />
                      </div>
                      <button
                        onClick={() => setShowImageInput(!showImageInput)}
                        className={cn(
                          "h-[52px] px-5 sm:w-[52px] sm:px-0 flex items-center justify-center rounded-2xl transition-all font-bold text-sm gap-2 border", 
                          showImageInput 
                            ? "bg-primary/10 text-primary border-primary/20 shadow-inner" 
                            : "bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-transparent text-muted-foreground hover:text-foreground hover:bg-gray-100 dark:hover:bg-white/10"
                        )}
                      >
                        <ImageIcon className="h-5 w-5" />
                        <span className="sm:hidden">Add Image</span>
                      </button>
                    </div>

                    <AnimatePresence>
                      {showImageInput && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <input
                            type="text"
                            placeholder="Paste high-res image URL..."
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-transparent rounded-2xl px-5 py-3.5 text-sm font-medium focus:outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all mt-1"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-3">
                      <p className="hidden sm:block text-[11px] text-muted-foreground/60 font-bold uppercase tracking-wider">
                        Press <kbd className="bg-gray-100 dark:bg-white/10 px-2 py-1 rounded-md border border-gray-200 dark:border-white/10 font-bold mx-1 text-[10px] text-muted-foreground">Cmd + Enter</kbd> to post
                      </p>
                      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                        {error && <p className="text-xs text-red-500 font-bold bg-red-50/50 dark:bg-red-500/10 px-3 py-1.5 rounded-lg">{error}</p>}
                        <Button
                          onClick={handleSubmit}
                          disabled={!content.trim() || isSubmitting}
                          className="bg-primary hover:bg-primary/90 text-white rounded-2xl px-8 h-12 font-black shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95 disabled:opacity-50 disabled:shadow-none w-full sm:w-auto text-sm tracking-wide"
                        >
                          {isSubmitting ? "Sending..." : "Share Post"}
                          {!isSubmitting && <Send className="w-4 h-4 ml-2 opacity-80" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
