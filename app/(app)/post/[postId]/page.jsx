"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import PostCard from "@/components/feed/PostCard";
import CommentSection from "@/components/post/CommentSection";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PostDetailPage() {
  const { postId } = useParams();
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/posts/${postId}`);
        if (!res.ok) throw new Error("Post not found");
        const data = await res.json();
        setPost(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [postId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold">Post not found</h2>
        <Button
          variant="link"
          onClick={() => router.back()}
          className="text-[#FF6B35] mt-2"
        >
          Go back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </button>

      <PostCard post={post} onUpdate={() => router.refresh()} />

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
          Comments
          <span className="text-sm font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {post.commentCount || 0}
          </span>
        </h3>
        <CommentSection postId={postId} />
      </div>
    </div>
  );
}
