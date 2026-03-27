"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PostComposer from "@/components/feed/PostComposer";
import PostCard from "@/components/feed/PostCard";
import PostTypeFilter from "@/components/feed/PostTypeFilter";
import FeedStories from "@/components/feed/FeedStories";
import FeedReelCard from "@/components/feed/FeedReelCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

// Inject reel strip after every N posts
const REEL_INJECT_EVERY = 3;

const itemVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] }
  }
};

function PostSkeleton() {
  return (
    <div className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-[0_10px_30px_-20px_rgba(15,23,42,0.35)] space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="h-20 w-full rounded-xl" />
      <div className="flex gap-4">
        <Skeleton className="h-8 w-16 rounded-xl" />
        <Skeleton className="h-8 w-16 rounded-xl" />
        <Skeleton className="h-8 w-16 rounded-xl" />
      </div>
    </div>
  );
}

export default function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filterType, setFilterType] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef(null);
  const sentinelRef = useRef(null);

  const fetchPosts = useCallback(async (reset = false, currentPage = null) => {
    const nextPage = reset ? 1 : currentPage;
    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const url = new URL("/api/posts", window.location.origin);
      if (filterType) url.searchParams.set("type", filterType);
      url.searchParams.set("page", nextPage.toString());
      url.searchParams.set("limit", "3");

      const res = await fetch(url);
      const data = await res.json();

      if (reset) {
        setPosts(data.posts || []);
        setPage(2);
      } else {
        setPosts((prev) => [...prev, ...(data.posts || [])]);
        setPage(nextPage + 1);
      }

      setHasMore((data.posts?.length || 0) === 3);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filterType]);

  // Reset on filter change
  useEffect(() => {
    fetchPosts(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType]);

  // Fetch reels for inline injection
  useEffect(() => {
    fetch("/api/reels?limit=10&random=true")
      .then((r) => r.json())
      .then((d) => setReels(d.data || []))
      .catch(() => {});
  }, []);

  // Set up IntersectionObserver for infinite scroll
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          setPage((prevPage) => {
            fetchPosts(false, prevPage);
            return prevPage;
          });
        }
      },
      { threshold: 0.1 }
    );

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [hasMore, loadingMore, loading, fetchPosts]);

  // Build the combined feed items with reel cards injected
  const feedItems = [];
  let reelIndex = 0;
  posts.forEach((post, index) => {
    feedItems.push({ type: "post", data: post, key: post._id });
    // Inject a reel after every Nth post (but not after the very last post)
    if ((index + 1) % REEL_INJECT_EVERY === 0 && index !== posts.length - 1 && reels.length > 0) {
      const reel = reels[reelIndex % reels.length];
      feedItems.push({ type: "reel", data: reel, key: `reel-${index}-${reel._id}` });
      reelIndex++;
    }
  });

  return (
    <div className="space-y-4 sm:space-y-5 pb-6">
      <section className="rounded-3xl border border-slate-200/70 bg-gradient-to-b from-white to-slate-50/70 p-3 sm:p-4 shadow-[0_20px_50px_-35px_rgba(15,23,42,0.4)]">
        <FeedStories />
      </section>

      <PostComposer onPostCreated={() => fetchPosts(true)} />

      <div className="sticky top-[70px] sm:top-2 z-20 py-1">
        <div className="rounded-2xl bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/70 shadow-[0_10px_30px_-22px_rgba(15,23,42,0.45)] border border-slate-200/70 p-1.5">
          <PostTypeFilter activeType={filterType} onTypeChange={setFilterType} />
        </div>
      </div>

      <div className="space-y-4 sm:space-y-5">
        {loading ? (
          // Initial load skeletons
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <PostSkeleton key={i} />)}
          </div>
        ) : posts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-white rounded-3xl border border-slate-200/70 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.35)]"
          >
            <p className="text-gray-500 font-bold text-lg">No posts yet</p>
            <p className="text-sm text-gray-400 mt-2">Be the first to share something!</p>
          </motion.div>
        ) : (
          <AnimatePresence>
            {feedItems.map((item) =>
              item.type === "post" ? (
                <motion.div
                  key={item.key}
                  variants={itemVariants}
                >
                  <PostCard post={item.data} onUpdate={() => fetchPosts(true)} />
                </motion.div>
              ) : item.type === "reel" ? (
                <motion.div
                  key={item.key}
                  variants={itemVariants}
                >
                  <FeedReelCard reel={item.data} />
                </motion.div>
              ) : null
            )}
          </AnimatePresence>
        )}

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} className="h-4" />

        {/* Loading more spinner */}
        {loadingMore && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
          </div>
        )}

        {/* End of feed */}
        {!hasMore && posts.length > 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              You&apos;re all caught up! 🎉
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
