import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { ObjectId } from "mongodb";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { serializePost } from "@/lib/serializers";

export const dynamic = "force-dynamic";

// GET /api/posts/[postId]
export async function GET(request, { params }) {
  try {
    const db = await getDb();
    const post = await db
      .collection("posts")
      .aggregate([
        { $match: { _id: new ObjectId(params.postId) } },
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
            authorId: 1,
            type: 1,
            content: 1,
            images: 1,
            tags: 1,
            upvotes: 1,
            commentCount: 1,
            flagCount: 1,
            status: 1,
            createdAt: 1,
            "author.name": 1,
            "author.avatar": 1,
            "author.tier": 1,
            "author._id": 1,
          },
        },
      ])
      .toArray();

    if (!post.length) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(serializePost(post[0]));
  } catch (error) {
    console.error("Get post error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE /api/posts/[postId]
export async function DELETE(request, { params }) {
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

    // Must be author or mod/admin
    if (
      post.authorId !== session.user.id &&
      !["moderator", "admin"].includes(session.user.role)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db
      .collection("posts")
      .updateOne(
        { _id: new ObjectId(params.postId) },
        { $set: { status: "removed" } },
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete post error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
