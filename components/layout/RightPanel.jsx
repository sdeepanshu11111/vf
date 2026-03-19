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
    <aside className="hidden xl:flex flex-col w-[320px] shrink-0 p-6 gap-6 sticky top-0 h-screen overflow-y-auto no-scrollbar">
      {/* Trending Topics */}
      <div className="bento-card group">
        <div className="p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-orange-100 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">Trending</h3>
            </div>
            <button className="text-[10px] font-bold text-gray-400 hover:text-primary transition-colors">VIEW ALL</button>
          </div>
          <div className="space-y-4">
            {trendingTopics.map((topic, i) => (
              <div key={i} className="flex items-center justify-between group/item cursor-pointer">
                <div>
                  <p className="text-[13px] font-bold text-gray-800 group-hover/item:text-primary transition-colors">
                    #{topic.tag}
                  </p>
                  <p className="text-[10px] font-medium text-gray-400">{topic.count} DISCUSSIONS</p>
                </div>
                <span className="text-[10px] font-black text-green-500 bg-green-50 px-2 py-1 rounded-lg">{topic.growth}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Suggested People */}
      {suggestedUsers.length > 0 && (
        <div className="bento-card">
          <div className="p-5">
            <div className="flex items-center gap-2 mb-5">
              <div className="h-8 w-8 rounded-xl bg-blue-100 flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">Hustlers</h3>
            </div>
            <div className="space-y-4">
              {suggestedUsers.map((user) => (
                <div key={user._id} className="flex items-center gap-3">
                  <Link href={`/profile/${user._id}`}>
                    <UserAvatar src={user.avatar} name={user.name} size="sm" className="ring-2 ring-white" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/profile/${user._id}`}>
                      <p className="text-[13px] font-bold truncate text-gray-900 hover:text-primary transition-colors">
                        {user.name}
                      </p>
                    </Link>
                    <p className="text-[10px] font-medium text-gray-400 truncate uppercase tracking-tighter">{user.niche}</p>
                  </div>
                  <Button
                    onClick={() => handleFollow(user._id)}
                    className={cn(
                      "h-8 px-3 text-[10px] font-black rounded-xl transition-all",
                      user.followers?.includes(session?.user?.id)
                        ? "bg-gray-100 text-gray-500"
                        : "bg-primary text-white shadow-lg shadow-primary/20"
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
        <div className="bento-card bg-gradient-to-br from-gray-900 to-gray-800 border-0">
          <div className="p-5">
            <div className="flex items-center gap-2 mb-5">
              <div className="h-8 w-8 rounded-xl bg-white/10 flex items-center justify-center">
                <Trophy className="h-4 w-4 text-yellow-400" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-white">Top Hustlers</h3>
            </div>
            <div className="space-y-4">
              {topUsers.map((user, i) => (
                <Link
                  key={user._id}
                  href={`/profile/${user._id}`}
                  className="flex items-center gap-3 group/user"
                >
                  <div className="relative">
                    <UserAvatar src={user.avatar} name={user.name} size="sm" className="ring-2 ring-white/10" />
                    <span className="absolute -top-1 -left-1 h-5 w-5 bg-white rounded-full flex items-center justify-center text-[10px] font-black shadow-lg">
                      {i + 1}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold truncate text-white group-hover/user:text-primary transition-colors">{user.name}</p>
                    <PointsBadge points={user.points} size="sm" className="text-white/60" />
                  </div>
                  <ExternalLink className="h-3 w-3 text-white/20 group-hover/user:text-white transition-colors" />
                </Link>
              ))}
            </div>
            <Link href="/members" className="mt-5 block w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-center text-[11px] font-black text-white hover:bg-white/10 transition-all uppercase tracking-widest">
              View Leaderboard
            </Link>
          </div>
        </div>
      )}
    </aside>
  );
}
