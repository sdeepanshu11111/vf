"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bookmark, Loader2, Heart, Film, ShoppingCart } from "lucide-react";
import PostCard from "@/components/feed/PostCard";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "posts", label: "Saved Posts", icon: Bookmark },
  { id: "saved-reels", label: "Saved Reels", icon: Film },
  { id: "liked-reels", label: "Liked Reels", icon: Heart },
];

const itemVariants = {
  initial: { opacity: 0, scale: 0.98, y: 6 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { duration: 0.3, ease: [0.23, 1, 0.32, 1] }
  },
  exit: { opacity: 0, scale: 0.98, y: -6 }
};

export default function SavedPage() {
  const { data: session } = useSession();
  const user = session?.user;

  const [activeTab, setActiveTab] = useState("posts");
  const [posts, setPosts] = useState([]);
  const [savedReels, setSavedReels] = useState([]);
  const [likedReels, setLikedReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async (tab) => {
    try {
      setLoading(true);
      setError(null);
      if (tab === "posts") {
        const res = await fetch("/api/posts/saved");
        if (!res.ok) throw new Error("Failed to fetch saved posts");
        const data = await res.json();
        setPosts(data.posts || []);
      } else if (tab === "saved-reels") {
        const res = await fetch("/api/reels/saved");
        if (!res.ok) throw new Error("Failed to fetch saved reels");
        const data = await res.json();
        setSavedReels(data.reels || []);
      } else if (tab === "liked-reels") {
        const res = await fetch("/api/reels/liked");
        if (!res.ok) throw new Error("Failed to fetch liked reels");
        const data = await res.json();
        setLikedReels(data.reels || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  return (
    <div className="w-full space-y-6 max-w-4xl mx-auto">
      {/* Header Profile Header Alternative */}
      <div className="glass-card p-6 sm:p-8 rounded-[2rem] border-white/20 dark:border-white/5 shadow-2xl relative overflow-hidden flex flex-col items-center text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50 pointer-events-none" />
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 ring-4 ring-primary/5">
          <Bookmark className="h-8 w-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
          Your Collection
        </h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm">
          Everything you interact with, neatly organized in one place for future reference.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-center p-1.5 glass-card rounded-2xl border-white/20 dark:border-white/5 w-fit mx-auto relative z-10">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 outline-none",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute inset-0 bg-primary/10 rounded-xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <tab.icon className={cn("w-4 h-4 relative z-10", isActive && "fill-primary/20")} />
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-20"
            >
              <Loader2 className="h-10 w-10 animate-spin text-primary/80" />
            </motion.div>
          ) : error && posts.length === 0 && savedReels.length === 0 && likedReels.length === 0 ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 text-red-500 p-5 rounded-[1.5rem] text-sm font-semibold border border-red-500/20 text-center"
            >
              {error}
            </motion.div>
          ) : (
            <motion.div
              key={`content-${activeTab}`}
              variants={itemVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              { activeTab === "posts" ? (
                posts.length === 0 ? (
                  <EmptyState 
                    icon={Bookmark} 
                    title="No saved posts yet" 
                    desc='When you see a post you want to remember, click the More menu and select "Save Post".' 
                  />
                ) : (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <PostCard key={post._id} post={post} onUpdate={() => fetchData("posts")} />
                    ))}
                  </div>
                )
              ) : activeTab === "saved-reels" ? (
                savedReels.length === 0 ? (
                  <EmptyState 
                    icon={Film} 
                    title="No saved reels yet" 
                    desc="Reels you save will appear here for easy access." 
                  />
                ) : (
                  <ReelGrid reels={savedReels} user={user} />
                )
              ) : (
                likedReels.length === 0 ? (
                  <EmptyState 
                    icon={Heart} 
                    title="No liked reels yet" 
                    desc="Show some love to your favorite reels by double-tapping them. They'll show up here." 
                  />
                ) : (
                  <ReelGrid reels={likedReels} user={user} />
                )
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Reel Grid Component
function ReelGrid({ reels, user }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {reels.map((reel) => {
        let mediaUrl = reel.primary_video || reel.video || reel.primary_image || reel.primary_gif;
        const vList = reel.carousel?.videos || reel.videos;
        if (!mediaUrl && Array.isArray(vList) && vList.length > 0) {
          mediaUrl = typeof vList[0] === "string" ? vList[0] : vList[0]?.url;
        }

        return (
          <div key={reel._id} className="group relative aspect-[9/16] bg-black/5 dark:bg-white/5 rounded-2xl overflow-hidden border border-white/10 shadow-sm hover:shadow-xl transition-all duration-300">
            {mediaUrl ? (
              mediaUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                <video src={mediaUrl} className="w-full h-full object-cover" />
              ) : (
                <img src={mediaUrl} alt={reel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground font-medium">No Media</div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-100 transition-opacity duration-300 pointer-events-none flex flex-col justify-end p-3">
              <h3 className="text-white text-xs font-bold line-clamp-2 drop-shadow-md mb-2">
                {reel.name}
              </h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // open in new tab
                  const email = user?.email || "";
                  window.open(
                    `https://dash.vfulfill.io/signup?email=${email}`,
                    "_blank",
                  );
                }}
                className="pointer-events-auto w-full px-3 py-1.5 bg-white text-black font-black uppercase tracking-wider text-[10px] rounded-lg flex items-center justify-center gap-1.5 shadow-[0_4px_15px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95 transition-all duration-300"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                Get Quote
              </button>
            </div>
            
            {reel.product_cost && (
              <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/20 text-[10px] font-bold text-white z-10">
                ₹{reel.product_cost}
              </div>
            )}
          </div>
        )
      })}
    </div>
  );
}

// Reusable Empty State Component
function EmptyState({ icon: Icon, title, desc }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-24 glass-card rounded-[2rem] border-white/20 dark:border-white/5 shadow-sm">
      <div className="h-20 w-20 bg-black/5 dark:bg-white/5 rounded-[1.5rem] flex items-center justify-center mb-6 ring-1 ring-black/5 dark:ring-white/10 shadow-inner rotate-3">
        <Icon className="h-10 w-10 text-muted-foreground opacity-60 -rotate-3" />
      </div>
      <h3 className="text-xl font-black text-foreground mb-2">
        {title}
      </h3>
      <p className="text-muted-foreground text-[15px] font-medium max-w-sm mx-auto leading-relaxed">
        {desc}
      </p>
    </div>
  );
}
