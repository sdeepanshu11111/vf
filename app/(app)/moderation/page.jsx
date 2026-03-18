"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Shield,
  AlertTriangle,
  EyeOff,
  Ban,
  CheckCircle,
  Clock,
} from "lucide-react";
import UserAvatar from "@/components/ui/UserAvatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

export default function ModerationPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({});
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQueue = useCallback(async () => {
    try {
      const res = await fetch("/api/moderation");
      if (!res.ok) throw new Error("Unauthorized");
      const data = await res.json();
      setStats(data.stats);
      setQueue(data.flaggedPosts || []);
    } catch (e) {
      router.push("/feed");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const handleAction = async (postId, action) => {
    try {
      const res = await fetch(`/api/moderation/${postId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) fetchQueue();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Shield className="h-6 w-6 text-[#FF6B35]" />
          Moderation Dashboard
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Review flagged content and maintain community standards
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Pending Flags",
            count: stats.pendingFlags,
            icon: AlertTriangle,
            color: "text-amber-500",
            bg: "bg-amber-50",
          },
          {
            label: "Banned Users",
            count: stats.bannedUsers,
            icon: Ban,
            color: "text-red-500",
            bg: "bg-red-50",
          },
          {
            label: "Removed Content",
            count: stats.removedPosts,
            icon: EyeOff,
            color: "text-gray-500",
            bg: "bg-gray-50",
          },
        ].map((item) => (
          <div
            key={item.label}
            className={`${item.bg} p-6 rounded-2xl border border-white shadow-sm`}
          >
            <div className="flex items-center justify-between mb-2">
              <item.icon className={`h-5 w-5 ${item.color}`} />
              <span className={`text-2xl font-bold ${item.color}`}>
                {item.count || 0}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-600">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-gray-900 flex items-center gap-2 px-1">
          <Clock className="h-4 w-4" />
          Review Queue
        </h3>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-48 w-full rounded-2xl" />
            ))}
          </div>
        ) : queue.length > 0 ? (
          <div className="space-y-4">
            {queue.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                  <div className="flex items-center gap-2">
                    <UserAvatar
                      src={item.author?.avatar}
                      name={item.author?.name}
                      size="sm"
                    />
                    <div>
                      <p className="text-sm font-semibold">
                        {item.author?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Flagged {item.flagCount} times •{" "}
                        {formatDistanceToNow(new Date(item.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg h-8"
                      onClick={() => handleAction(item._id, "dismiss")}
                    >
                      <CheckCircle className="h-4 w-4 mr-1.5" />
                      Dismiss
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg h-8"
                      onClick={() => handleAction(item._id, "hide")}
                    >
                      <EyeOff className="h-4 w-4 mr-1.5" />
                      Hide
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="rounded-lg h-8 shadow-none"
                      onClick={() => handleAction(item._id, "ban")}
                    >
                      <Ban className="h-4 w-4 mr-1.5" />
                      Ban User
                    </Button>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-800 line-clamp-3 italic mb-2">
                    &quot;{item.content}&quot;
                  </p>
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {item.tags.map((t) => (
                        <span key={t} className="text-[10px] text-gray-400">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
            <div className="h-16 w-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <p className="font-semibold text-gray-900">Queue Clear!</p>
            <p className="text-gray-500 text-sm mt-1">
              There are no pending reports to review.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
