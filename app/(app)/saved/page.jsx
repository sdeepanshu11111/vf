"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bookmark, Loader2 } from "lucide-react";
import PostCard from "@/components/feed/PostCard";

export default function SavedPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSavedPosts = async () => {
    try {
      const res = await fetch("/api/posts/saved");
      if (!res.ok) throw new Error("Failed to fetch saved posts");
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedPosts();
  }, []);

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center gap-3 bg-white p-5 rounded-2xl border shadow-sm">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <Bookmark className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            Saved Posts
          </h1>
          <p className="text-sm text-gray-500">
            Your personal collection of valuable insights
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm border border-red-100">
          {error}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed">
          <div className="mx-auto h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <Bookmark className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            No saved posts yet
          </h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            When you see a post you want to remember, click the More menu and select &quot;Save Post&quot;.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post, i) => (
            <PostCard 
              key={post._id} 
              post={post} 
              onUpdate={fetchSavedPosts}
            />
          ))}
        </div>
      )}
    </div>
  );
}
