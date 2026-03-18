"use client";

import Link from "next/link";
import UserAvatar from "@/components/ui/UserAvatar";
import TierBadge from "@/components/ui/TierBadge";
import PointsBadge from "@/components/ui/PointsBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";

export default function MemberCard({ member, onFollow, followLabel = "Follow" }) {
  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex flex-col items-center text-center">
          <Link href={`/profile/${member._id}`}>
            <UserAvatar src={member.avatar} name={member.name} size="xl" />
          </Link>
          <Link href={`/profile/${member._id}`} className="mt-3">
            <h3 className="font-semibold text-sm hover:underline">
              {member.name}
            </h3>
          </Link>
          <TierBadge tier={member.tier} size="sm" />
          {member.city && (
            <p className="flex items-center gap-1 text-xs text-gray-500 mt-1">
              <MapPin className="h-3 w-3" />
              {member.city}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">{member.niche}</p>
          <PointsBadge points={member.points} size="sm" />
          {onFollow && (
            <Button
              variant="outline"
              size="sm"
              className="mt-3 rounded-full w-full text-xs"
              onClick={() => onFollow(member._id)}
            >
              {followLabel}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
