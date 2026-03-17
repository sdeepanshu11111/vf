"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import ProfileHeader from "@/components/profile/ProfileHeader";
import PostCard from "@/components/feed/PostCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
  const { userId } = useParams();
  const { data: session } = useSession();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/users/${userId}`);
        const data = await res.json();
        setUser(data.user);
        setPosts(data.posts || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64 w-full rounded-2xl" />
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return <div className="text-center py-20">User not found</div>;
  }

  return (
    <div className="space-y-6 pb-12">
      <ProfileHeader user={user} isOwnProfile={session?.user?.id === userId} />

      <div className="space-y-4">
        <h3 className="font-bold text-gray-900 px-1">Posts</h3>
        {posts.length > 0 ? (
          posts.map((post) => (
            <PostCard key={post._id} post={{ ...post, author: user }} />
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
            <p className="text-gray-500">No posts yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
