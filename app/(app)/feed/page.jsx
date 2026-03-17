"use client";

import { useState, useEffect } from "react";
import PostComposer from "@/components/feed/PostComposer";
import PostCard from "@/components/feed/PostCard";
import PostTypeFilter from "@/components/feed/PostTypeFilter";
import FeedStories from "@/components/feed/FeedStories";
import { Skeleton } from "@/components/ui/skeleton";

export default function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = async (reset = false) => {
    const nextPage = reset ? 1 : page;
    setLoading(true);
    try {
      const url = new URL("/api/posts", window.location.origin);
      if (filterType) url.searchParams.set("type", filterType);
      url.searchParams.set("page", nextPage.toString());

      const res = await fetch(url);
      const data = await res.json();

      if (reset) {
        setPosts(data.posts || []);
      } else {
        setPosts((prev) => [...prev, ...(data.posts || [])]);
      }

      setHasMore((data.posts?.length || 0) === 20);
      setPage(nextPage + 1);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(true);
  }, [filterType]);

  return (
    <div className="space-y-6">
      <FeedStories />

      <PostComposer onPostCreated={() => fetchPosts(true)} />

      <div className="sticky top-0 z-10 bg-[#F5F5F5] py-2">
        <PostTypeFilter activeType={filterType} onTypeChange={setFilterType} />
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            onUpdate={() => fetchPosts(true)}
          />
        ))}

        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-4 space-y-3 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-20 w-full rounded-lg" />
              </div>
            ))}
          </div>
        )}

        {!loading && posts.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <p className="text-gray-500 font-medium">
              No posts found in this category.
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Be the first to share something!
            </p>
          </div>
        )}

        {hasMore && !loading && posts.length > 0 && (
          <button
            onClick={() => fetchPosts()}
            className="w-full py-3 text-sm font-medium text-gray-500 hover:text-[#FF6B35] transition-colors"
          >
            Load more posts
          </button>
        )}
      </div>
    </div>
  );
}
