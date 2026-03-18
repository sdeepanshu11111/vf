"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { TrendingUp } from "lucide-react";
import UserAvatar from "@/components/ui/UserAvatar";
import PointsBadge from "@/components/ui/PointsBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    try {
      const res = await fetch(`/api/users/${userId}/follow`, {
        method: "POST",
      });
      if (!res.ok) return;

      const data = await res.json();
      setSuggestedUsers((prev) =>
        prev.map((user) => {
          if (user._id !== userId) return user;

          const followers = new Set(user.followers || []);
          if (data.following) {
            followers.add(session?.user?.id);
          } else {
            followers.delete(session?.user?.id);
          }

          return { ...user, followers: Array.from(followers) };
        }),
      );
    } catch (error) {
      console.error(error);
    }
  };

  const trendingTopics = [
    { tag: "COD Strategy", count: 42 },
    { tag: "RTO Reduction", count: 38 },
    { tag: "Product Sourcing", count: 31 },
    { tag: "NDR Management", count: 27 },
    { tag: "Hero Product", count: 24 },
  ];

  return (
    <aside className="hidden xl:block w-[300px] shrink-0 space-y-4 py-6 pr-6">
      {/* Trending Topics */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <TrendingUp className="h-4 w-4 text-[#FF6B35]" />
            Trending in D2C
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {trendingTopics.map((topic, i) => (
            <div key={i} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  #{topic.tag}
                </p>
                <p className="text-xs text-gray-500">{topic.count} posts</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Suggested People */}
      {suggestedUsers.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              Suggested for You
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {suggestedUsers.map((user) => (
              <div key={user._id} className="flex items-center gap-3">
                <Link href={`/profile/${user._id}`}>
                  <UserAvatar src={user.avatar} name={user.name} size="sm" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/profile/${user._id}`}>
                    <p className="text-sm font-medium truncate hover:underline">
                      {user.name}
                    </p>
                  </Link>
                  <p className="text-xs text-gray-500">{user.niche}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs rounded-full"
                  onClick={() => handleFollow(user._id)}
                >
                  {user.followers?.includes(session?.user?.id)
                    ? "Following"
                    : "Follow"}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Leaderboard Mini */}
      {topUsers.length > 0 && (
        <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              🏆 Top Contributors
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {topUsers.map((user, i) => (
              <Link
                key={user._id}
                href={`/profile/${user._id}`}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <span className="text-lg font-bold text-gray-400 w-5">
                  {["🥇", "🥈", "🥉"][i]}
                </span>
                <UserAvatar src={user.avatar} name={user.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <PointsBadge points={user.points} size="sm" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </aside>
  );
}
