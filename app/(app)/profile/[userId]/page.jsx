"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import ProfileHeader from "@/components/profile/ProfileHeader";
import PostCard from "@/components/feed/PostCard";
import { Skeleton } from "@/components/ui/skeleton";
import UserAvatar from "@/components/ui/UserAvatar";
import TierBadge from "@/components/ui/TierBadge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { UserPlus, UserMinus, Users } from "lucide-react";
import { useAuthPrompt } from "@/components/auth/AuthPromptProvider";

function UserCard({ person, sessionUserId, onFollowChange }) {
  const [isFollowing, setIsFollowing] = useState(person.isFollowing);
  const [loading, setLoading] = useState(false);
  const isOwnCard = person._id === sessionUserId;
  const { requestAuth } = useAuthPrompt();

  const handleFollow = async () => {
    if (loading) return;
    if (!sessionUserId) {
      requestAuth({ actionText: "follow this founder" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${person._id}/follow`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setIsFollowing(data.following);
        if (onFollowChange) onFollowChange(person._id, data.following);
      }
    } catch {}
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-primary/20 transition-all"
    >
      <Link href={`/profile/${person._id}`} className="shrink-0">
        <UserAvatar src={person.avatar} name={person.name} size="md" className="ring-2 ring-white shadow-sm" />
      </Link>
      <div className="flex-1 min-w-0">
        <Link href={`/profile/${person._id}`} className="block">
          <p className="font-bold text-gray-900 text-sm truncate hover:text-primary transition-colors">{person.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <TierBadge tier={person.tier} size="xs" />
            {person.niche && <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">• {person.niche}</span>}
          </div>
        </Link>
      </div>
      {!isOwnCard && (
        <Button
          size="sm"
          onClick={handleFollow}
          disabled={loading}
          className={cn(
            "rounded-xl font-bold text-xs shrink-0 h-9 px-4 transition-all",
            isFollowing
              ? "bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600 border border-gray-200"
              : "bg-primary text-white shadow-sm shadow-primary/20 hover:bg-primary/90"
          )}
        >
          {isFollowing ? (
            <><UserMinus className="h-3.5 w-3.5 mr-1.5" />Following</>
          ) : (
            <><UserPlus className="h-3.5 w-3.5 mr-1.5" />Follow</>
          )}
        </Button>
      )}
    </motion.div>
  );
}

export default function ProfilePage() {
  const { userId } = useParams();
  const { data: session } = useSession();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");
  const [connections, setConnections] = useState([]);
  const [connectionsLoading, setConnectionsLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/users/${userId}`);
        const data = await res.json();
        setUser(data.user);
        setPosts(data.posts || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  useEffect(() => {
    if (activeTab === "posts") return;
    const type = activeTab === "followers" ? "followers" : "following";
    setConnectionsLoading(true);
    fetch(`/api/users/${userId}/followers?type=${type}`)
      .then((r) => r.json())
      .then((d) => setConnections(d.users || []))
      .catch(() => setConnections([]))
      .finally(() => setConnectionsLoading(false));
  }, [activeTab, userId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64 w-full rounded-2xl" />
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return <div className="text-center py-20">User not found</div>;
  }

  const TABS = [
    { id: "posts", label: "Posts", count: user.postCount || posts.length },
    { id: "followers", label: "Followers", count: user.followerCount || 0 },
    { id: "following", label: "Following", count: user.followingCount || 0 },
  ];

  return (
    <div className="space-y-6 pb-12">
      <ProfileHeader user={user} isOwnProfile={session?.user?.id === userId} />

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-white dark:bg-[#0f172a] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-200",
              activeTab === tab.id
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-gray-50 dark:hover:bg-white/5"
            )}
          >
            {tab.label}
            <span className={cn(
              "text-[11px] font-black px-2 py-0.5 rounded-full",
              activeTab === tab.id ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
            )}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === "posts" && (
          <motion.div
            key="posts"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            {posts.length > 0 ? (
              posts.map((post) => (
                <PostCard key={post._id} post={{ ...post, author: post.author || user }} />
              ))
            ) : (
              <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <p className="text-gray-400 font-medium">No posts yet.</p>
              </div>
            )}
          </motion.div>
        )}

        {(activeTab === "followers" || activeTab === "following") && (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-2"
          >
            {connectionsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100">
                    <Skeleton className="h-11 w-11 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                    <Skeleton className="h-9 w-24 rounded-xl" />
                  </div>
                ))}
              </div>
            ) : connections.length > 0 ? (
              connections.map((person) => (
                <UserCard
                  key={person._id}
                  person={person}
                  sessionUserId={session?.user?.id}
                />
              ))
            ) : (
              <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-7 w-7 text-gray-300" />
                </div>
                <p className="font-bold text-gray-700">
                  {activeTab === "followers" ? "No followers yet" : "Not following anyone yet"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {activeTab === "followers"
                    ? "Share your insights to grow your audience."
                    : "Start following fellow hustlers!"}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
