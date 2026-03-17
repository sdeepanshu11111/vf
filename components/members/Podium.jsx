"use client";

import Link from "next/link";
import UserAvatar from "@/components/ui/UserAvatar";
import TierBadge from "@/components/ui/TierBadge";
import PointsBadge from "@/components/ui/PointsBadge";

export default function Podium({ users = [] }) {
  if (users.length < 3) return null;

  const order = [users[1], users[0], users[2]]; // 2nd, 1st, 3rd
  const heights = ["h-24", "h-32", "h-20"];
  const medals = ["🥈", "🥇", "🥉"];
  const gradients = [
    "from-gray-100 to-gray-200",
    "from-amber-100 to-yellow-200",
    "from-orange-100 to-amber-200",
  ];

  return (
    <div className="flex items-end justify-center gap-2 mb-8">
      {order.map((user, i) => (
        <div key={user._id} className="flex flex-col items-center">
          <Link
            href={`/profile/${user._id}`}
            className="flex flex-col items-center"
          >
            <div className="relative">
              <UserAvatar src={user.avatar} name={user.name} size="lg" />
              <span className="absolute -top-1 -right-1 text-lg">
                {medals[i]}
              </span>
            </div>
            <p className="text-sm font-semibold mt-2 text-center truncate max-w-[100px]">
              {user.name?.split(" ")[0]}
            </p>
            <TierBadge tier={user.tier} size="sm" />
            <PointsBadge points={user.points} size="sm" />
          </Link>
          <div
            className={`${heights[i]} w-24 bg-gradient-to-t ${gradients[i]} rounded-t-xl mt-2 flex items-end justify-center pb-2`}
          >
            <span className="text-2xl font-bold text-gray-400">
              {[2, 1, 3][i]}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
