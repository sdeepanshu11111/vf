"use client";

import Link from "next/link";
import UserAvatar from "@/components/ui/UserAvatar";
import TierBadge from "@/components/ui/TierBadge";
import PointsBadge from "@/components/ui/PointsBadge";

export default function LeaderboardTable({ members = [] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-100">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
            <th className="px-4 py-3 text-left">Rank</th>
            <th className="px-4 py-3 text-left">Member</th>
            <th className="px-4 py-3 text-left">Tier</th>
            <th className="px-4 py-3 text-left">Niche</th>
            <th className="px-4 py-3 text-right">Wins</th>
            <th className="px-4 py-3 text-right">Tips</th>
            <th className="px-4 py-3 text-right">Q&A</th>
            <th className="px-4 py-3 text-right">Points</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {members.map((member, i) => (
            <tr key={member._id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 text-sm font-bold text-gray-400">
                #{i + 1}
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/profile/${member._id}`}
                  className="flex items-center gap-3"
                >
                  <UserAvatar
                    src={member.avatar}
                    name={member.name}
                    size="sm"
                  />
                  <span className="text-sm font-medium hover:underline">
                    {member.name}
                  </span>
                </Link>
              </td>
              <td className="px-4 py-3">
                <TierBadge tier={member.tier} size="sm" />
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">
                {member.niche}
              </td>
              <td className="px-4 py-3 text-sm text-right font-medium text-green-600">
                {member.winCount || 0}
              </td>
              <td className="px-4 py-3 text-sm text-right font-medium text-blue-600">
                {member.tipCount || 0}
              </td>
              <td className="px-4 py-3 text-sm text-right font-medium text-purple-600">
                {member.questionCount || 0}
              </td>
              <td className="px-4 py-3 text-right">
                <PointsBadge points={member.points} size="sm" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
