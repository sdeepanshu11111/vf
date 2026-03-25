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
import {
  UserPlus,
  UserMinus,
  Users,
  Trophy,
  Lightbulb,
  HelpCircle,
  ShoppingBag,
  Bookmark,
  BarChart3,
  FileText,
} from "lucide-react";
import { useAuthPrompt } from "@/components/auth/AuthPromptProvider";

const POST_TYPE_FILTERS = [
  { value: null, label: "All" },
  { value: "win", label: "Wins", icon: Trophy },
  { value: "tip", label: "Tips", icon: Lightbulb },
  { value: "question", label: "Questions", icon: HelpCircle },
  { value: "sourcing", label: "Sourcing", icon: ShoppingBag },
];

const ACTIVITY_STATS = [
  { key: "winCount", label: "Wins Shared", icon: Trophy, color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-100" },
  { key: "tipCount", label: "Growth Tips", icon: Lightbulb, color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-100" },
  { key: "questionCount", label: "Questions Asked", icon: HelpCircle, color: "text-purple-500", bg: "bg-purple-50", border: "border-purple-100" },
  { key: "sourcingCount", label: "Sourcing Tips", icon: ShoppingBag, color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-100" },
];

function UserCard({ person, sessionUserId }) {
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

function ActivityTab({ user }) {
  const total = (user.winCount || 0) + (user.tipCount || 0) + (user.questionCount || 0) + (user.sourcingCount || 0);

  return (
    <motion.div
      key="activity"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="space-y-4"
    >
      {/* Summary Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 bg-primary/10 rounded-2xl flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-black text-gray-900">Post Activity</h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{total} total posts</p>
          </div>
        </div>

        <div className="space-y-4">
          {ACTIVITY_STATS.map(({ key, label, icon: Icon, color, bg, border }) => {
            const count = user[key] || 0;
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className={cn("h-7 w-7 rounded-xl flex items-center justify-center", bg, border, "border")}>
                      <Icon className={cn("h-3.5 w-3.5", color)} />
                    </div>
                    <span className="text-sm font-bold text-gray-700">{label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-gray-400">{pct}%</span>
                    <span className="text-sm font-black text-gray-900 min-w-[24px] text-right">{count}</span>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
                    className={cn("h-full rounded-full", bg.replace("bg-", "bg-").replace("-50", "-400"))}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Milestone Cards */}
      <div className="grid grid-cols-2 gap-3">
        {ACTIVITY_STATS.map(({ key, label, icon: Icon, color, bg, border }) => (
          <div key={key} className={cn("bg-white rounded-2xl border p-4 shadow-sm", border)}>
            <Icon className={cn("h-5 w-5 mb-2", color)} />
            <p className="text-2xl font-black text-gray-900">{user[key] || 0}</p>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{label}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function SavedTab() {
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/posts/saved")
      .then((r) => r.json())
      .then((d) => setSavedPosts(d.posts || []))
      .catch(() => setSavedPosts([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-40 w-full rounded-3xl" />
        ))}
      </div>
    );
  }

  if (savedPosts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm"
      >
        <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Bookmark className="h-7 w-7 text-gray-300" />
        </div>
        <p className="font-black text-gray-700">No saved posts yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Save posts from the feed to revisit them here.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="saved"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="space-y-4"
    >
      {savedPosts.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}
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
  const [postTypeFilter, setPostTypeFilter] = useState(null);

  const isOwnProfile = session?.user?.id === userId;

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

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    if (activeTab !== "followers" && activeTab !== "following") return;
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

  const filteredPosts = postTypeFilter
    ? posts.filter((p) => p.type === postTypeFilter)
    : posts;

  const TABS = [
    { id: "posts", label: "Posts", icon: FileText, count: user.postCount || posts.length },
    { id: "saved", label: "Saved", icon: Bookmark, count: null, onlyOwn: true },
    { id: "activity", label: "Activity", icon: BarChart3, count: null },
    { id: "followers", label: "Followers", icon: Users, count: user.followerCount || 0 },
    { id: "following", label: "Following", icon: null, count: user.followingCount || 0 },
  ].filter((t) => !t.onlyOwn || isOwnProfile);

  return (
    <div className="space-y-6 pb-12">
      <ProfileHeader user={user} isOwnProfile={isOwnProfile} />

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-shrink-0 flex items-center justify-center gap-1.5 py-2.5 px-3 sm:px-4 rounded-xl text-sm font-bold transition-all duration-200 whitespace-nowrap",
              activeTab === tab.id
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-gray-50"
            )}
          >
            {tab.icon && <tab.icon className="h-3.5 w-3.5 shrink-0" />}
            {tab.label}
            {tab.count !== null && (
              <span className={cn(
                "text-[11px] font-black px-1.5 py-0.5 rounded-full",
                activeTab === tab.id ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
              )}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {/* Posts Tab */}
        {activeTab === "posts" && (
          <motion.div
            key="posts"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            {/* Post type filter pills */}
            <div className="flex gap-2 flex-wrap">
              {POST_TYPE_FILTERS.map((f) => (
                <button
                  key={String(f.value)}
                  onClick={() => setPostTypeFilter(f.value)}
                  className={cn(
                    "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider border transition-all",
                    postTypeFilter === f.value
                      ? "bg-primary text-white border-transparent shadow-sm"
                      : "bg-white text-gray-500 border-gray-200 hover:border-primary/30 hover:text-primary"
                  )}
                >
                  {f.icon && <f.icon className="h-3 w-3" />}
                  {f.label}
                </button>
              ))}
            </div>

            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <PostCard
                  key={post._id}
                  post={{ ...post, author: post.author || user }}
                  onUpdate={fetchProfile}
                />
              ))
            ) : (
              <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <FileText className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 font-medium">No posts yet.</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Saved Tab — only for own profile */}
        {activeTab === "saved" && isOwnProfile && (
          <SavedTab key="saved" />
        )}

        {/* Activity Tab */}
        {activeTab === "activity" && (
          <ActivityTab key="activity" user={user} />
        )}

        {/* Followers / Following Tabs */}
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
