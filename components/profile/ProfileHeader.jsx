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
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthPrompt } from "@/components/auth/AuthPromptProvider";

function StatCard({ label, value, icon }) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)] flex flex-col justify-between min-h-[120px] hover:border-blue-100 hover:shadow-md transition-all">
       <div className="flex items-center gap-2">
         <h3 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">{value}</h3>
         {icon && icon}
       </div>
       <p className="text-[10px] sm:text-[11px] font-black text-gray-400 uppercase tracking-widest leading-[1.4] pr-4 mt-2">
          {label}
       </p>
    </div>
  );
}

export default function ProfileHeader({ user, isOwnProfile }) {
  const { data: session } = useSession();
  const { requestAuth } = useAuthPrompt();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
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
    } catch (e) {
      console.error(e);
    }
    setFollowLoading(false);
  };

  const avatarUrl = user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || "User")}`;

  return (
    <div className="mb-8">
      {/* Cover Section */}
      <div className="relative rounded-3xl overflow-visible bg-gradient-to-r from-blue-500 via-blue-500 to-[#5a7bc4] z-10 transition-all duration-300">
        {/* Dotted Pattern Overlay */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_white_1.5px,_transparent_1px)] bg-[size:10px_10px] mix-blend-overlay rounded-3xl pointer-events-none"></div>

        <div className="relative px-6 sm:px-10 pt-16 pb-8 flex flex-col sm:flex-row sm:items-end gap-6 sm:gap-8">
          
          {/* Avatar Area */}
          <div className="relative shrink-0 sm:mb-[-60px] z-20">
             <div className="bg-white p-1.5 sm:p-2 shadow-xl inline-block -rotate-1 hover:rotate-0 transition-transform duration-300 rounded-sm">
                <img 
                  src={avatarUrl} 
                  alt={user?.name} 
                  className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-sm" 
                />
             </div>
             <div className="absolute -bottom-2 -right-2 h-7 w-7 sm:h-9 sm:w-9 bg-[#10b981] rounded-full border-[3px] border-white shadow-sm z-30" />
          </div>

          <div className="flex flex-col flex-1 pb-1">
             {/* Name & Badges Row */}
             <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                   <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight uppercase drop-shadow-sm truncate max-w-[280px] sm:max-w-none">
                     {user?.name}
                   </h1>
                   <span className="bg-white/95 text-blue-600 font-bold px-4 py-1.5 rounded-full text-xs sm:text-sm shadow-sm opacity-90 backdrop-blur-md">
                     {user?.tier || 'Growth'}
                   </span>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-2 relative z-30">
                   {isOwnProfile ? (
                      <>
                         <Link href="/profile/edit">
                            <Button variant="outline" className="bg-white/20 hover:bg-white/30 border-white/40 text-white shadow-sm rounded-full backdrop-blur-md h-9 text-xs sm:text-sm font-bold px-5">
                               <Edit3 className="h-3.5 w-3.5 mr-2" /> EDIT PROFILE
                            </Button>
                         </Link>
                         <Button 
                            onClick={() => signOut({ callbackUrl: "/login" })}
                            variant="outline" 
                            className="bg-[#6b5b8d]/70 hover:bg-[#6b5b8d]/90 border-transparent text-white shadow-sm rounded-full backdrop-blur-md h-9 text-xs sm:text-sm font-bold px-5"
                         >
                            <LogOut className="h-3.5 w-3.5 mr-2" /> LOGOUT
                         </Button>
                      </>
                   ) : (
                      <Button 
                        onClick={handleFollow}
                        disabled={followLoading}
                        className={cn(
                          "font-bold rounded-full h-9 text-xs sm:text-sm px-6 shadow-sm backdrop-blur-md border transition-all",
                          isFollowing 
                            ? "bg-white/20 border-white/40 text-gray-900 hover:bg-white/30" 
                            : "bg-gray-900 text-white border-transparent hover:bg-gray-800"
                        )}
                      >
                        {isFollowing ? <><UserMinus className="h-3.5 w-3.5 mr-2" /> UNFOLLOW</> : <><UserPlus className="h-3.5 w-3.5 mr-2" /> FOLLOW</>}
                      </Button>
                   )}
                </div>
             </div>

             {/* Details Info Row */}
             <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-4 opacity-90 text-[#1e3a8a] font-bold text-[10px] sm:text-xs tracking-widest">
                {user?.niche && (
                  <div className="flex items-center gap-1.5 uppercase">
                    <Zap className="h-3.5 w-3.5" strokeWidth={3} /> {user.niche}
                  </div>
                )}
                {user?.city && (
                  <div className="flex items-center gap-1.5 uppercase">
                    <MapPin className="h-3.5 w-3.5" strokeWidth={3} /> {user.city}
                  </div>
                )}
                {user?.joinedAt && (
                  <div className="flex items-center gap-1.5 uppercase">
                    <Calendar className="h-3.5 w-3.5" strokeWidth={3} /> HUSTLING SINCE {format(new Date(user.joinedAt), "MMM yyyy").toUpperCase()}
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>

      {/* Content Area Below Cover */}
      <div className="relative mt-12 sm:mt-16 z-0 space-y-4">
          
          {/* Bio Box */}
          <div className="bg-white/70 backdrop-blur-md rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)] transition-all hover:bg-white">
             <p className="text-gray-800 font-medium text-[15px] sm:text-lg leading-relaxed">
               {user?.bio || "D2C founder."}
             </p>
          </div>

          {/* Stats Box Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
             <StatCard 
                label="Insights Shared" 
                value={user?.postCount || 0} 
             />
             <StatCard 
                label="Followers" 
                value={followerCount} 
             />
             <StatCard 
                label="Following" 
                value={user?.followingCount || user?.following?.length || 0} 
             />
             <StatCard 
                label="Hustle Points" 
                value={user?.points || 0} 
                icon={<Zap className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500 shrink-0" fill="currentColor" />} 
             />
          </div>
      </div>
    </div>
  );
}
