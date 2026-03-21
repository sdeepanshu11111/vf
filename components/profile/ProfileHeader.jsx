"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  MapPin,
  Calendar,
  UserPlus,
  UserMinus,
  Edit3,
  LogOut,
  Zap,
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import UserAvatar from "@/components/ui/UserAvatar";
import TierBadge from "@/components/ui/TierBadge";
import PointsBadge from "@/components/ui/PointsBadge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthPrompt } from "@/components/auth/AuthPromptProvider";

export default function ProfileHeader({ user, isOwnProfile }) {
  const { data: session } = useSession();
  const { requestAuth } = useAuthPrompt();
  const [isFollowing, setIsFollowing] = useState(user?.followers?.includes(session?.user?.id));
  const [followerCount, setFollowerCount] = useState(user?.followerCount || user?.followers?.length || 0);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    setIsFollowing(user?.followers?.includes(session?.user?.id));
    setFollowerCount(user?.followerCount || user?.followers?.length || 0);
  }, [session?.user?.id, user]);

  const handleFollow = async () => {
    if (followLoading) return;
    if (!session?.user?.id) {
      requestAuth({ actionText: "follow this founder" });
      return;
    }
    setFollowLoading(true);
    try {
      const res = await fetch(`/api/users/${user._id}/follow`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setIsFollowing(data.following);
        setFollowerCount((prev) => data.following ? prev + 1 : Math.max(prev - 1, 0));
      }
    } catch (e) { console.error(e); }
    setFollowLoading(false);
  };

  return (
    <div className="bento-card overflow-hidden mb-8">
      {/* Cover Area */}
      <div className="relative h-48 sm:h-64 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-primary/40" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
        
        {/* Floating Profile Info (Desktop Only Overlay) */}
        <div className="absolute bottom-6 right-6 hidden sm:flex gap-3">
           {isOwnProfile ? (
              <>
                <Link href="/profile/edit">
                  <Button className="glass-card bg-white/20 border-white/40 text-white font-bold rounded-2xl hover:bg-white/30 px-6 backdrop-blur-xl transition-all">
                    <Edit3 className="h-4 w-4 mr-2" /> EDIT PROFILE
                  </Button>
                </Link>
                <Button 
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="glass-card bg-red-500/20 border-red-500/40 text-white font-bold rounded-2xl hover:bg-red-500/40 px-6 backdrop-blur-xl transition-all"
                >
                  <LogOut className="h-4 w-4 mr-2" /> LOGOUT
                </Button>
              </>
           ) : (
              <>
                <Button 
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={cn(
                    "font-bold rounded-2xl px-6 transition-all shadow-xl",
                    isFollowing 
                      ? "glass-card bg-white/20 border-white/40 text-white hover:bg-white/30" 
                      : "bg-white text-primary hover:bg-gray-100"
                  )}
                >
                  {isFollowing ? <><UserMinus className="h-4 w-4 mr-2" /> UNFOLLOW</> : <><UserPlus className="h-4 w-4 mr-2" /> FOLLOW</>}
                </Button>
              </>
           )}
        </div>
      </div>

      <div className="px-6 sm:px-10 pb-10">
        {/* Avatar & Basic Info */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-6 -mt-16 sm:-mt-20 relative z-10">
          <div className="relative group">
            <UserAvatar src={user?.avatar} name={user?.name} size="2xl" className="ring-8 ring-white shadow-2xl" />
            <div className="absolute -bottom-1 -right-1 h-8 w-8 bg-green-500 rounded-full border-4 border-white shadow-lg" />
          </div>

          <div className="flex-1 pb-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">{user?.name}</h1>
              <TierBadge tier={user?.tier} size="md" className="py-1.5 px-3" />
            </div>
            <div className="flex flex-wrap items-center gap-5 mt-3">
              {user?.niche && (
                <div className="flex items-center gap-2 bg-primary/5 px-3 py-1.5 rounded-xl border border-primary/10">
                   <Zap className="h-3.5 w-3.5 text-primary" />
                   <span className="text-[11px] font-black text-primary uppercase tracking-widest">{user.niche}</span>
                </div>
              )}
              {user?.city && (
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <MapPin className="h-3.5 w-3.5" />
                  {user.city}
                </div>
              )}
              {user?.joinedAt && (
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <Calendar className="h-3.5 w-3.5" />
                  HUSTLING SINCE {format(new Date(user.joinedAt), "MMM yyyy").toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Actions */}
        {!isOwnProfile && (
          <div className="flex sm:hidden gap-2 mt-6">
             <Button 
               onClick={handleFollow}
               disabled={followLoading}
               className={cn(
                 "flex-1 font-black text-[11px] rounded-xl h-12 shadow-lg transition-all",
                 isFollowing
                   ? "bg-gray-100 text-gray-600 shadow-none border border-gray-200"
                   : "bg-primary text-white shadow-primary/20"
               )}
             >
               {isFollowing ? "UNFOLLOW" : "FOLLOW"}
             </Button>
          </div>
        )}

        {/* Bio */}
        {user?.bio && (
          <div className="mt-8 p-6 bg-gray-50/50 rounded-2xl border border-gray-100/50">
            <p className="text-[15px] text-gray-700 leading-relaxed font-medium">
              {user.bio}
            </p>
          </div>
        )}

        {/* Stats Grid - Bento Style */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
           <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:border-primary/20 transition-all group">
              <p className="text-2xl font-black text-gray-900 group-hover:text-primary transition-colors">{user?.postCount || 0}</p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Insights Shared</p>
           </div>
           <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:border-primary/20 transition-all group">
              <p className="text-2xl font-black text-gray-900 group-hover:text-primary transition-colors">{followerCount}</p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Followers</p>
           </div>
           <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:border-primary/20 transition-all group">
              <p className="text-2xl font-black text-gray-900 group-hover:text-primary transition-colors">{user?.followingCount || user?.following?.length || 0}</p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Following</p>
           </div>
           <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:border-primary/20 transition-all group">
              <div className="flex items-center gap-2">
                 <p className="text-2xl font-black text-gray-900 group-hover:text-primary transition-colors">{user?.points || 0}</p>
                 <Zap className="h-5 w-5 text-primary" />
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Hustle Points</p>
           </div>
        </div>
      </div>
    </div>
  );
}
