"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Send, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import UserAvatar from "@/components/ui/UserAvatar";
import { cn } from "@/lib/utils";

const postTypes = [
  {
    value: "tip",
    label: "💡 Tip",
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  {
    value: "win",
    label: "🏆 Win",
    color: "bg-green-100 text-green-700 border-green-200",
  },
  {
    value: "question",
    label: "❓ Question",
    color: "bg-purple-100 text-purple-700 border-purple-200",
  },
  {
    value: "sourcing",
    label: "📦 Sourcing",
    color: "bg-amber-100 text-amber-700 border-amber-200",
  },
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
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          images: imageUrl.trim() ? [imageUrl.trim()] : [],
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setContent("");
        setTags("");
        setImageUrl("");
        setShowImageInput(false);
        setIsExpanded(false);
        onPostCreated?.();
      } else {
        setError(data.error || "Failed to create post. Please try again.");
      }
    } catch (error) {
      console.error("Failed to create post:", error);
      setError("Network error. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session) return null;

  return (
    <Card className="border-0 shadow-sm overflow-hidden">
      <CardContent className="p-4">
        <div className="flex gap-3">
          <UserAvatar
            src={session.user.avatar}
            name={session.user.name}
            size="md"
          />
          <div className="flex-1">
            <textarea
              placeholder="Share a win, tip, or ask the community..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setIsExpanded(true)}
              className="w-full resize-none border-0 bg-gray-50 rounded-xl px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 focus:bg-white transition-all"
              rows={isExpanded ? 4 : 2}
            />

            {isExpanded && (
              <div className="mt-3 space-y-3">
                {/* Post Type Selection */}
                <div className="flex flex-wrap gap-2">
                  {postTypes.map((pt) => (
                    <button
                      key={pt.value}
                      onClick={() => setType(pt.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        type === pt.value
                          ? pt.color + " ring-2 ring-offset-1 ring-gray-300"
                          : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {pt.label}
                    </button>
                  ))}
                </div>

                {/* Tags */}
                <input
                  type="text"
                  placeholder="Tags (comma separated): COD, RTO, sourcing..."
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20"
                />

                {/* Image URL Input */}
                {showImageInput && (
                  <input
                    type="text"
                    placeholder="Paste image URL..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20"
                  />
                )}

                {/* Actions */}
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setShowImageInput(!showImageInput)}
                      className={cn(
                        "transition-colors",
                        showImageInput
                          ? "text-[#FF6B35]"
                          : "text-gray-400 hover:text-gray-600",
                      )}
                    >
                      <Image className="h-5 w-5" />
                    </button>
                    {error && (
                      <p className="text-[11px] text-red-500 font-medium">
                        {error}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={handleSubmit}
                    disabled={!content.trim() || isSubmitting}
                    className="bg-[#FF6B35] hover:bg-[#e55a2b] text-white rounded-full px-5 shadow-sm active:scale-95 transition-transform"
                    size="sm"
                  >
                    <Send className="h-4 w-4 mr-1.5" />
                    {isSubmitting ? "Posting..." : "Post"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
