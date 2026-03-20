"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Users, Trophy, ExternalLink, Sparkles, Package } from "lucide-react";
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

  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [yesterdayProduct, setYesterdayProduct] = useState(null);

  useEffect(() => {
    fetch("/api/reels?limit=1")
      .then((r) => r.json())
      .then((d) => { if (d.data?.length) setYesterdayProduct(d.data[0]); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    // Next drop at the start of the next hour
    const timer = setInterval(() => {
      const now = new Date();
      const nextHour = new Date(now);
      nextHour.setHours(now.getHours() + 1, 0, 0, 0);

      const diff = nextHour.getTime() - now.getTime();
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / 1000 / 60) % 60);
      const s = Math.floor((diff / 1000) % 60);
      setTimeLeft({ hours: h, minutes: m, seconds: s });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col w-full h-full py-8 gap-6 overflow-y-auto no-scrollbar pr-2">
      {/* Product Drop Countdown */}
      <div className="bento-card shrink-0 group border-white/20 dark:border-white/5 shadow-xl shadow-primary/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50 z-0"></div>
        <div className="p-5 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-primary/20 flex items-center justify-center animate-pulse">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Next Drop</h3>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 rounded-lg border border-primary/20">
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-ping"></div>
              <span className="text-[10px] font-black text-primary uppercase tracking-wider">Soon</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <p className="text-[13px] font-medium text-muted-foreground leading-snug">
              A highly researched winning product is dropping in:
            </p>
            
            {/* Interactive Counter */}
            <div className="flex items-center justify-center gap-3 py-3">
              <div className="flex flex-col items-center justify-center bg-black/5 dark:bg-white/5 w-14 h-14 rounded-2xl border border-black/5 dark:border-white/10 shadow-inner">
                <span className="text-xl font-black text-foreground font-mono">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">HRS</span>
              </div>
              <span className="text-xl font-black text-muted-foreground opacity-50 mb-3">:</span>
              <div className="flex flex-col items-center justify-center bg-black/5 dark:bg-white/5 w-14 h-14 rounded-2xl border border-black/5 dark:border-white/10 shadow-inner">
                <span className="text-xl font-black text-foreground font-mono">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">MIN</span>
              </div>
              <span className="text-xl font-black text-muted-foreground opacity-50 mb-3">:</span>
              <div className="flex flex-col items-center justify-center bg-black/5 dark:bg-white/5 w-14 h-14 rounded-2xl border border-black/5 dark:border-white/10 shadow-inner">
                <span className="text-xl font-black text-foreground font-mono">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">SEC</span>
              </div>
            </div>
            
            <button className="w-full mt-2 py-2.5 bg-primary text-primary-foreground text-[11px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] active:scale-95 transition-all duration-300">
              Notify Me
            </button>
          </div>
        </div>
      </div>

      {/* Yesterday's Drop */}
      {yesterdayProduct && (
        <div className="bento-card shrink-0 group border-white/20 dark:border-white/5 shadow-xl shadow-emerald-500/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-50 z-0"></div>
          <div className="p-5 relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Package className="h-4 w-4 text-emerald-500" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Top Researched</h3>
            </div>
            
            <Link href="/reels" className="block focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-2xl">
              <div className="rounded-2xl overflow-hidden relative mb-3 aspect-video bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 transition-all duration-500 shadow-sm group-hover:shadow-md">
                <img 
                  loading="lazy"
                  src={yesterdayProduct.primary_image || yesterdayProduct.image || "https://placehold.co/400x300?text=Product"} 
                  alt={yesterdayProduct.name || yesterdayProduct.title || "Product"} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[9px] font-black px-2 py-1 uppercase tracking-wider rounded-lg shadow-xl backdrop-blur-sm border border-emerald-400">
                  Winning Product
                </div>
              </div>
              
              <h4 className="font-bold text-foreground text-[13px] line-clamp-2 leading-tight group-hover:text-emerald-500 transition-colors">
                {yesterdayProduct.name || yesterdayProduct.title || "Trending Product"}
              </h4>
            </Link>
            
            {(yesterdayProduct.product_features?.pros || yesterdayProduct.product_cost) && (
              <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5">
                {yesterdayProduct.product_features?.pros && (
                  <p className="text-[11px] text-muted-foreground font-medium mb-3 line-clamp-2">
                    ✨ {yesterdayProduct.product_features.pros.slice(0, 2).join(" • ")}
                  </p>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-foreground opacity-60 uppercase tracking-widest">Est. Sourcing</span>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 shadow-inner">
                    ₹{yesterdayProduct.product_cost || "N/A"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recommended Founders */}
      {suggestedUsers.length > 0 && (
        <div className="bento-card shrink-0 border-white/20 dark:border-white/5 shadow-xl shadow-primary/5">
          <div className="p-5">
            <div className="flex items-center gap-2 mb-5">
              <div className="h-8 w-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-500" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Promising Founders</h3>
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
        <div className="bento-card shrink-0 relative overflow-hidden group/board border-white/20 dark:border-white/10 shadow-2xl shadow-yellow-500/10">
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
