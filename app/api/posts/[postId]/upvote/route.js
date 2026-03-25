import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { ObjectId } from "mongodb";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { pusherServer } from "@/lib/pusher";

export const dynamic = "force-dynamic";

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    const post = await db
      .collection("posts")
      .findOne({ _id: new ObjectId(params.postId) });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const userId = session.user.id;
    const hasUpvoted = post.upvotes?.includes(userId);

    if (hasUpvoted) {
      // Remove upvote
      await db
        .collection("posts")
        .updateOne(
          { _id: new ObjectId(params.postId) },
          { $pull: { upvotes: userId } },
        );
      // Remove points from author
      if (post.authorId !== userId) {
        await db
          .collection("users")
          .updateOne(
            { _id: new ObjectId(post.authorId) },
            { $inc: { points: -5 } },
          );
      }
      return NextResponse.json({
        upvoted: false,
        count: (post.upvotes?.length || 1) - 1,
      });
    } else {
      // Add upvote
      await db
        .collection("posts")
        .updateOne(
          { _id: new ObjectId(params.postId) },
          { $addToSet: { upvotes: userId } },
        );
      // Award points to author
      if (post.authorId !== userId) {
        await db
          .collection("users")
          .updateOne(
            { _id: new ObjectId(post.authorId) },
            { $inc: { points: 5 } },
          );
        // Create notification
        await db.collection("notifications").insertOne({
          userId: post.authorId,
          actorId: userId,
          type: "upvote",
          postId: params.postId,
          read: false,
          createdAt: new Date(),
        });
        // Real-time notification
        try {
          await pusherServer.trigger(`user-${post.authorId}`, "new-notification", {
            type: "upvote",
            actorId: userId,
            postId: params.postId,
          });
        } catch (err) {
          console.error("Pusher error:", err);
        }
      }
      return NextResponse.json({
        upvoted: true,
        count: (post.upvotes?.length || 0) + 1,
      });
    }
  } catch (error) {
    console.error("Upvote error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
