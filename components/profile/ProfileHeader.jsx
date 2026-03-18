"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  MapPin,
  Calendar,
  MessageCircle,
  UserPlus,
  UserMinus,
  Edit3,
  LogOut,
} from "lucide-react";
import { format } from "date-fns";
import UserAvatar from "@/components/ui/UserAvatar";
import TierBadge from "@/components/ui/TierBadge";
import PointsBadge from "@/components/ui/PointsBadge";
import { Button } from "@/components/ui/button";

export default function ProfileHeader({ user, isOwnProfile }) {
  const { data: session } = useSession();
  const [isFollowing, setIsFollowing] = useState(
    user?.followers?.includes(session?.user?.id),
  );
  const [followerCount, setFollowerCount] = useState(
    user?.followerCount || user?.followers?.length || 0,
  );
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    setIsFollowing(user?.followers?.includes(session?.user?.id));
    setFollowerCount(user?.followerCount || user?.followers?.length || 0);
  }, [session?.user?.id, user]);

  const handleFollow = async () => {
    if (followLoading) return;
    setFollowLoading(true);
    try {
      const res = await fetch(`/api/users/${user._id}/follow`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setIsFollowing(data.following);
        setFollowerCount((prev) =>
          data.following ? prev + 1 : Math.max(prev - 1, 0),
        );
      }
    } catch (e) {
      console.error(e);
    }
    setFollowLoading(false);
  };

  const handleMessage = async () => {
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId: user._id.toString() }),
      });
      if (res.ok) {
        const data = await res.json();
        window.location.href = `/messages/${data.conversationId}`;
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
      {/* Cover */}
      <div className="h-32 sm:h-40 bg-gradient-to-r from-[#FF6B35] via-[#FF8F65] to-[#FFB088]" />

      <div className="px-4 sm:px-6 pb-6">
        {/* Avatar */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 sm:-mt-14">
          <div className="ring-4 ring-white rounded-full">
            <UserAvatar src={user?.avatar} name={user?.name} size="2xl" />
          </div>

          <div className="flex-1 sm:pb-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold text-gray-900">
                    {user?.name}
                  </h1>
                  <TierBadge tier={user?.tier} />
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                  {user?.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {user.city}
                    </span>
                  )}
                  {user?.joinedAt && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Joined {format(new Date(user.joinedAt), "MMM yyyy")}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {isOwnProfile ? (
                  <div className="flex items-center gap-2">
                    <Link href="/profile/edit">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full shadow-sm hover:bg-gray-50"
                      >
                        <Edit3 className="h-4 w-4 mr-1.5" />
                        Edit Profile
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 shadow-sm"
                      onClick={() => signOut({ callbackUrl: "/login" })}
                    >
                      <LogOut className="h-4 w-4 mr-1.5" />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <>
                    <Button
                      onClick={handleFollow}
                      variant={isFollowing ? "outline" : "default"}
                      size="sm"
                      className={`rounded-full ${
                        !isFollowing
                          ? "bg-[#FF6B35] hover:bg-[#e55a2b] text-white"
                          : ""
                      }`}
                      disabled={followLoading}
                    >
                      {isFollowing ? (
                        <>
                          <UserMinus className="h-4 w-4 mr-1.5" />
                          Unfollow
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-1.5" />
                          Follow
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleMessage}
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                    >
                      <MessageCircle className="h-4 w-4 mr-1.5" />
                      Message
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        {user?.bio && (
          <p className="mt-4 text-sm text-gray-600 leading-relaxed">
            {user.bio}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">
              {user?.postCount || 0}
            </p>
            <p className="text-xs text-gray-500">Posts</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">
              {followerCount}
            </p>
            <p className="text-xs text-gray-500">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">
              {user?.followingCount || user?.following?.length || 0}
            </p>
            <p className="text-xs text-gray-500">Following</p>
          </div>
          <div>
            <PointsBadge points={user?.points} />
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-4">
          {user?.niche && (
            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
              {user.niche}
            </span>
          )}
          {user?.gmvRange && (
            <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
              {user.gmvRange}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
