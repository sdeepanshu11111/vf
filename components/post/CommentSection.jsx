"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { formatDistanceToNow } from "date-fns";
import { ArrowBigUp, Reply } from "lucide-react";
import UserAvatar from "@/components/ui/UserAvatar";
import TierBadge from "@/components/ui/TierBadge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function CommentCard({ comment, postId, onReplyAdded }) {
  const { data: session } = useSession();
  const [showReply, setShowReply] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [upvotes, setUpvotes] = useState(comment.upvotes || []);
  const [submitting, setSubmitting] = useState(false);

  const isUpvoted = upvotes.includes(session?.user?.id);

  const handleUpvote = async () => {
    if (!session) return;
    try {
      const res = await fetch(`/api/comments/${comment._id}/upvote`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setUpvotes(
          data.upvoted
            ? [...upvotes, session.user.id]
            : upvotes.filter((id) => id !== session.user.id),
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleReply = async () => {
    if (!replyContent.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyContent, parentId: comment._id }),
      });
      if (res.ok) {
        setReplyContent("");
        setShowReply(false);
        onReplyAdded?.();
      }
    } catch (e) {
      console.error(e);
    }
    setSubmitting(false);
  };

  const author = comment.author || {};
  const timeAgo = comment.createdAt
    ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })
    : "";

  return (
    <div className="space-y-2">
      <div className="flex gap-3">
        <UserAvatar src={author.avatar} name={author.name} size="sm" />
        <div className="flex-1">
          <div className="bg-gray-50 rounded-xl px-3.5 py-2.5">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold">
                {author.name || "User"}
              </span>
              <TierBadge tier={author.tier} size="sm" />
              <span className="text-xs text-gray-400">{timeAgo}</span>
            </div>
            <p className="text-sm text-gray-700">{comment.content}</p>
          </div>
          <div className="flex items-center gap-3 mt-1 ml-1">
            <button
              onClick={handleUpvote}
              className={cn(
                "flex items-center gap-1 text-xs font-medium transition-colors",
                isUpvoted
                  ? "text-primary"
                  : "text-gray-400 hover:text-gray-600",
              )}
            >
              <ArrowBigUp
                className={cn("h-4 w-4", isUpvoted && "fill-primary")}
              />
              {upvotes.length || ""}
            </button>
            <button
              onClick={() => setShowReply(!showReply)}
              className="flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-gray-600"
            >
              <Reply className="h-3.5 w-3.5" />
              Reply
            </button>
          </div>

          {showReply && (
            <div className="flex gap-2 mt-2 ml-1">
              <input
                type="text"
                placeholder="Write a reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleReply()}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <Button
                size="sm"
                onClick={handleReply}
                disabled={submitting}
                className="bg-primary hover:bg-primary/90 text-white rounded-lg h-8"
              >
                Reply
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Nested Replies */}
      {comment.replies?.length > 0 && (
        <div className="ml-10 space-y-2 border-l-2 border-gray-100 pl-3">
          {comment.replies.map((reply) => (
            <CommentCard
              key={reply._id}
              comment={reply}
              postId={postId}
              onReplyAdded={onReplyAdded}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CommentSection({ postId }) {
  const { data: session } = useSession();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/posts/${postId}/comments`);
      const data = await res.json();
      setComments(data.comments || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [postId]);

  useEffect(() => {
    setLoading(true);
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async () => {
    if (!newComment.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });
      if (res.ok) {
        setNewComment("");
        fetchComments();
      }
    } catch (e) {
      console.error(e);
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-4">
      {/* Composer */}
      {session && (
        <div className="flex gap-3">
          <UserAvatar
            src={session.user.avatar}
            name={session.user.name}
            size="sm"
          />
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <Button
              onClick={handleSubmit}
              disabled={submitting || !newComment.trim()}
              className="bg-primary hover:bg-primary/90 text-white rounded-xl"
              size="sm"
            >
              Post
            </Button>
          </div>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="h-8 w-8 rounded-full bg-gray-200" />
              <div className="flex-1 h-16 bg-gray-100 rounded-xl" />
            </div>
          ))}
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-3">
          {comments.map((comment) => (
            <CommentCard
              key={comment._id}
              comment={comment}
              postId={postId}
              onReplyAdded={fetchComments}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-sm text-gray-400 py-4">
          No comments yet. Be the first to share your thoughts!
        </p>
      )}
    </div>
  );
}
