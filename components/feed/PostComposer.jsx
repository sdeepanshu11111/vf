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
    <div className="bento-card mb-6 overflow-hidden">
      <div className="p-5">
        <div className="flex gap-4">
          <UserAvatar src={session.user.avatar} name={session.user.name} size="md" className="ring-2 ring-white shadow-sm" />
          <div className="flex-1">
            <textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setIsExpanded(true)}
              className="w-full resize-none border-0 bg-transparent text-[15px] font-medium placeholder-gray-400 focus:outline-none focus:ring-0 transition-all min-h-[44px]"
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
                  <div className="mt-4 pt-4 border-t border-gray-50 space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {postTypes.map((pt) => (
                        <button
                          key={pt.value}
                          onClick={() => setType(pt.value)}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider border transition-all",
                            type === pt.value ? pt.color : "bg-gray-50 text-gray-400 border-gray-100 hover:bg-gray-100"
                          )}
                        >
                          {pt.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Tags (comma separated)"
                          value={tags}
                          onChange={(e) => setTags(e.target.value)}
                          className="w-full bg-gray-50 border-0 rounded-xl pl-9 pr-4 py-2 text-[13px] font-medium focus:ring-2 focus:ring-primary/10 transition-all"
                        />
                      </div>
                      <button
                        onClick={() => setShowImageInput(!showImageInput)}
                        className={cn("h-10 w-10 flex items-center justify-center rounded-xl transition-all", showImageInput ? "bg-primary/10 text-primary" : "bg-gray-50 text-gray-400 hover:text-gray-600")}
                      >
                        <ImageIcon className="h-5 w-5" />
                      </button>
                    </div>

                    {showImageInput && (
                      <input
                        type="text"
                        placeholder="Paste image URL..."
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="w-full bg-gray-50 border-0 rounded-xl px-4 py-2 text-[13px] font-medium focus:ring-2 focus:ring-primary/10 transition-all"
                      />
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <p className="text-[11px] text-gray-400 font-medium">
                        Press <kbd className="bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">Cmd + Enter</kbd> to post
                      </p>
                      <div className="flex items-center gap-3">
                        {error && <p className="text-[11px] text-red-500 font-bold">{error}</p>}
                        <Button
                          onClick={handleSubmit}
                          disabled={!content.trim() || isSubmitting}
                          className="bg-primary hover:bg-primary/90 text-white rounded-xl px-6 h-10 font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
                        >
                          {isSubmitting ? "Sending..." : "Share Post"}
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
