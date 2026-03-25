"use client";

import Link from "next/link";
import UserAvatar from "@/components/ui/UserAvatar";
import TierBadge from "@/components/ui/TierBadge";
import PointsBadge from "@/components/ui/PointsBadge";

export default function Podium({ users = [] }) {
  if (users.length < 3) return null;

  const order = [users[1], users[0], users[2]]; // 2nd, 1st, 3rd
  const heights = ["h-32", "h-40", "h-28"];
  const positions = [2, 1, 3];
  
  const gradients = [
    "from-slate-200 via-slate-100 to-slate-200 border-slate-300",
    "from-amber-300 via-yellow-100 to-amber-300 border-amber-300",
    "from-orange-300 via-orange-200 to-orange-300 border-orange-300",
  ];

  const textColors = [
    "text-slate-400",
    "text-amber-500",
    "text-orange-500",
  ];

  const badgeGradients = [
    "from-slate-300 to-slate-400 text-white shadow-slate-300/50",
    "from-amber-400 to-yellow-500 text-white shadow-amber-400/50",
    "from-orange-400 to-orange-500 text-white shadow-orange-400/50",
  ];

  return (
    <div className="flex items-end justify-center gap-4 sm:gap-6 mb-12 mt-12 pt-8">
      {order.map((user, i) => (
        <div key={user._id} className="flex flex-col items-center group">
          <Link
            href={`/profile/${user._id}`}
            className="flex flex-col items-center transition-all duration-300 hover:-translate-y-2 z-10 relative"
          >
            {positions[i] === 1 && (
              <div className="absolute -top-12 inset-x-0 flex justify-center pb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                 <div className="bg-gray-900 border border-gray-800 text-white px-3 py-1 rounded-full shadow-xl text-xs font-semibold whitespace-nowrap">
                   Top Member
                 </div>
              </div>
            )}
            
            <div className="relative mb-3">
              <div className={`p-1 rounded-full bg-gradient-to-tr ${positions[i] === 1 ? 'from-amber-200 to-yellow-400 shadow-xl shadow-amber-200/50' : 'from-gray-100 to-gray-200 shadow-md'}`}>
                <div className="bg-white rounded-full p-0.5">
                  <UserAvatar 
                    src={user.avatar} 
                    name={user.name} 
                    size={positions[i] === 1 ? "xl" : "lg"} 
                  />
                </div>
              </div>
              <div className={`absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${badgeGradients[i]} shadow-lg border-2 border-white font-bold text-sm z-10`}>
                {positions[i]}
              </div>
            </div>
            
            <p className={`text-base font-bold text-center truncate w-full max-w-[100px] mb-1.5 transition-colors ${positions[i] === 1 ? 'text-gray-900 group-hover:text-amber-600' : 'text-gray-700 group-hover:text-gray-900'}`}>
              {user.name?.split(" ")[0]}
            </p>
            
            <div className="flex flex-col items-center gap-1.5 opacity-90 transition-opacity group-hover:opacity-100 mb-1">
               <TierBadge tier={user.tier} size="sm" />
               <div className="shadow-sm border border-gray-100/50 rounded-full px-1.5 py-0.5 bg-white/50 backdrop-blur-sm">
                 <PointsBadge points={user.points} size="sm" />
               </div>
            </div>
          </Link>
          
          <div
            className={`${heights[i]} w-24 sm:w-32 bg-gradient-to-t ${gradients[i]} border-x border-t rounded-t-2xl mt-4 flex items-end justify-center pb-4 shadow-inner relative overflow-hidden transition-all duration-500`}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/60 to-transparent opacity-60 pointer-events-none"></div>
            
            <span 
              className={`text-5xl font-black ${textColors[i]} drop-shadow-sm opacity-80 z-10 pointer-events-none`} 
            >
              {positions[i]}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
