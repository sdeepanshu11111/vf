import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { ObjectId } from "mongodb";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { serializeIds } from "@/lib/serializers";

export const dynamic = "force-dynamic";

// GET /api/posts/[postId]/comments
export async function GET(request, { params }) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const db = await getDb();

    const comments = await db
      .collection("comments")
      .aggregate([
        { $match: { postId: params.postId } },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $addFields: { authorObjectId: { $toObjectId: "$authorId" } },
        },
        {
          $lookup: {
            from: "users",
            localField: "authorObjectId",
            foreignField: "_id",
            as: "author",
          },
        },
        { $unwind: "$author" },
        {
          $project: {
            _id: 1,
            postId: 1,
            authorId: 1,
            content: 1,
            upvotes: 1,
            parentId: 1,
            createdAt: 1,
            "author.name": 1,
            "author.avatar": 1,
            "author.tier": 1,
            "author._id": 1,
          },
        },
      ])
      .toArray();

    // Structure as top-level + replies
    const topLevel = comments.filter((c) => !c.parentId);
    const replies = comments.filter((c) => c.parentId);

    const structured = topLevel.map((comment) => ({
      ...comment,
      replies: replies.filter((r) => r.parentId === comment._id.toString()),
    }));

    return NextResponse.json({ comments: structured.map(serializeIds) });
  } catch (error) {
    console.error("Get comments error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/posts/[postId]/comments
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { content, parentId } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 },
      );
    }

    const db = await getDb();

    const newComment = {
      postId: params.postId,
      authorId: session.user.id,
      content: content.trim(),
      upvotes: [],
      parentId: parentId || null,
      createdAt: new Date(),
    };

    const result = await db.collection("comments").insertOne(newComment);

    // Increment post commentCount
    await db
      .collection("posts")
      .updateOne(
        { _id: new ObjectId(params.postId) },
        { $inc: { commentCount: 1 } },
      );

    // Award commenter +3 points
    await db
      .collection("users")
      .updateOne(
        { _id: new ObjectId(session.user.id) },
        { $inc: { points: 3 } },
      );

    // Award post author +2 points and create notification
    const post = await db
      .collection("posts")
      .findOne({ _id: new ObjectId(params.postId) });

    let notificationTargetUserId = null;

    if (parentId) {
      // If it's a reply, notify the parent comment author
      const parentComment = await db
        .collection("comments")
        .findOne({ _id: new ObjectId(parentId) });
      if (parentComment && parentComment.authorId !== session.user.id) {
        notificationTargetUserId = parentComment.authorId;
      }
    } else if (post && post.authorId !== session.user.id) {
      // If it's a top-level comment, notify the post author
      notificationTargetUserId = post.authorId;
    }

    if (post && post.authorId !== session.user.id) {
      // Still award points to post author for the interaction regardless of reply depth
      await db
        .collection("users")
        .updateOne(
          { _id: new ObjectId(post.authorId) },
          { $inc: { points: 2 } },
        );
    }

    if (notificationTargetUserId) {
      await db.collection("notifications").insertOne({
        userId: notificationTargetUserId,
        actorId: session.user.id,
        type: parentId ? "reply" : "comment",
        postId: params.postId,
        read: false,
        createdAt: new Date(),
      });
    }

    return NextResponse.json(
      { commentId: result.insertedId.toString() },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create comment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
