"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { TrendingUp, Users, Trophy, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import UserAvatar from "@/components/ui/UserAvatar";
import PointsBadge from "@/components/ui/PointsBadge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function RightPanel() {
  const { data: session } = useSession();
  const [topUsers, setTopUsers] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);

  useEffect(() => {
    fetch("/api/members?sort=points&limit=8")
      .then((r) => r.json())
      .then((data) => {
        setTopUsers((data.members || []).slice(0, 3));
        setSuggestedUsers(
          (data.members || [])
            .filter((member) => member._id !== session?.user?.id)
            .slice(3, 6),
        );
      })
      .catch(() => {});
  }, [session?.user?.id]);

  const handleFollow = async (userId) => {
    if (!session?.user?.id) return;
    const prevUsers = [...suggestedUsers];
    setSuggestedUsers((prev) =>
      prev.map((user) => {
        if (user._id !== userId) return user;
        const followers = new Set(user.followers || []);
        if (followers.has(session.user.id)) followers.delete(session.user.id);
        else followers.add(session.user.id);
        return { ...user, followers: Array.from(followers) };
      }),
    );

    try {
      const res = await fetch(`/api/users/${userId}/follow`, { method: "POST" });
      if (!res.ok) throw new Error();
    } catch { setSuggestedUsers(prevUsers); }
  };

  const trendingTopics = [
    { tag: "COD Strategy", count: 42, growth: "+12%" },
    { tag: "RTO Reduction", count: 38, growth: "+8%" },
    { tag: "Product Sourcing", count: 31, growth: "+5%" },
  ];

  return (
    <div className="flex flex-col w-full h-full py-8 gap-6 overflow-y-auto no-scrollbar pr-2">
      {/* Trending Topics */}
      <div className="bento-card group border-white/20 dark:border-white/5 shadow-xl shadow-primary/5">
        <div className="p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Trending</h3>
            </div>
            <button className="text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors">VIEW ALL</button>
          </div>
          <div className="space-y-4">
            {trendingTopics.map((topic, i) => (
              <div key={i} className="flex items-center justify-between group/item cursor-pointer">
                <div>
                  <p className="text-[13px] font-bold text-foreground group-hover/item:text-primary transition-colors">
                    #{topic.tag}
                  </p>
                  <p className="text-[10px] font-medium text-muted-foreground">{topic.count} DISCUSSIONS</p>
                </div>
                <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-1 rounded-lg">{topic.growth}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Suggested People */}
      {suggestedUsers.length > 0 && (
        <div className="bento-card border-white/20 dark:border-white/5 shadow-xl shadow-primary/5">
          <div className="p-5">
            <div className="flex items-center gap-2 mb-5">
              <div className="h-8 w-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-500" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Hustlers</h3>
            </div>
            <div className="space-y-4">
              {suggestedUsers.map((user) => (
                <div key={user._id} className="flex items-center gap-3 group/user">
                  <Link href={`/profile/${user._id}`}>
                    <UserAvatar src={user.avatar} name={user.name} size="sm" className="ring-2 ring-transparent group-hover/user:ring-primary/50 transition-all duration-300" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/profile/${user._id}`}>
                      <p className="text-[13px] font-bold truncate text-foreground hover:text-primary transition-colors">
                        {user.name}
                      </p>
                    </Link>
                    <p className="text-[10px] font-medium text-muted-foreground truncate uppercase tracking-tighter">{user.niche}</p>
                  </div>
                  <Button
                    onClick={() => handleFollow(user._id)}
                    className={cn(
                      "h-8 px-3 text-[10px] font-black rounded-xl transition-all duration-300 hover:scale-105 active:scale-95",
                      user.followers?.includes(session?.user?.id)
                        ? "bg-black/5 dark:bg-white/5 text-muted-foreground hover:bg-black/10 dark:hover:bg-white/10"
                        : "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/40"
                    )}
                  >
                    {user.followers?.includes(session?.user?.id) ? "FOLLOWING" : "FOLLOW"}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Mini */}
      {topUsers.length > 0 && (
        <div className="bento-card relative overflow-hidden group/board border-white/20 dark:border-white/10 shadow-2xl shadow-yellow-500/10">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent opacity-50 z-0"></div>
          <div className="p-5 relative z-10">
            <div className="flex items-center gap-2 mb-5">
              <div className="h-8 w-8 rounded-xl bg-yellow-500/20 backdrop-blur-sm flex items-center justify-center">
                <Trophy className="h-4 w-4 text-yellow-500" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Top Hustlers</h3>
            </div>
            <div className="space-y-4">
              {topUsers.map((user, i) => (
                <Link
                  key={user._id}
                  href={`/profile/${user._id}`}
                  className="flex items-center gap-3 group/user"
                >
                  <div className="relative">
                    <UserAvatar src={user.avatar} name={user.name} size="sm" className="ring-2 ring-black/5 dark:ring-white/10 group-hover/user:ring-yellow-500/50 transition-all duration-300" />
                    <span className="absolute -top-1 -left-1 h-5 w-5 bg-background border border-border rounded-full flex items-center justify-center text-[10px] font-black shadow-lg text-foreground">
                      {i + 1}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold truncate text-foreground group-hover/user:text-yellow-500 transition-colors">{user.name}</p>
                    <PointsBadge points={user.points} size="sm" className="opacity-80" />
                  </div>
                  <ExternalLink className="h-3 w-3 text-muted-foreground group-hover/user:text-yellow-500 transition-colors opacity-0 group-hover/user:opacity-100 -translate-x-2 group-hover/user:translate-x-0" />
                </Link>
              ))}
            </div>
            <Link href="/members" className="mt-5 block w-full py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-center text-[11px] font-black text-foreground hover:bg-black/10 dark:hover:bg-white/10 hover:shadow-md transition-all uppercase tracking-widest">
              View Leaderboard
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
