import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { ObjectId } from "mongodb";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    const postId = new ObjectId(params.postId);

    const originalPost = await db.collection("posts").findOne({ _id: postId });
    if (!originalPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const newPost = {
      authorId: session.user.id,
      type: originalPost.type,
      content: originalPost.content,
      images: originalPost.images || [],
      tags: originalPost.tags || [],
      upvotes: [],
      commentCount: 0,
      flagCount: 0,
      flaggedBy: [],
      status: "active",
      createdAt: new Date(),
      repostOf: params.postId,
      originalAuthorId: originalPost.authorId,
    };

    const result = await db.collection("posts").insertOne(newPost);
    
    // Increment post count and points
    await db.collection("users").updateOne(
      { _id: new ObjectId(session.user.id) },
      { $inc: { postCount: 1, points: 5 } }
    );

    return NextResponse.json({ postId: result.insertedId.toString() }, { status: 201 });
  } catch (error) {
    console.error("Repost error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
