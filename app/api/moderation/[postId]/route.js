import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { ObjectId } from "mongodb";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

// POST /api/moderation/[postId] — take action
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["moderator", "admin"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { action, reason } = body;

    if (!["warn", "hide", "ban", "dismiss"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const db = await getDb();
    const post = await db
      .collection("posts")
      .findOne({ _id: new ObjectId(params.postId) });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Take action
    switch (action) {
      case "hide":
        await db
          .collection("posts")
          .updateOne(
            { _id: new ObjectId(params.postId) },
            { $set: { status: "hidden" } },
          );
        break;
      case "ban":
        await db
          .collection("posts")
          .updateOne(
            { _id: new ObjectId(params.postId) },
            { $set: { status: "removed" } },
          );
        await db
          .collection("users")
          .updateOne(
            { _id: new ObjectId(post.authorId) },
            { $set: { isBanned: true } },
          );
        break;
      case "dismiss":
        await db
          .collection("posts")
          .updateOne(
            { _id: new ObjectId(params.postId) },
            { $set: { flagCount: 0, flaggedBy: [], status: "active" } },
          );
        break;
      // warn: log only, no changes
    }

    // Log moderation action
    await db.collection("moderation").insertOne({
      targetType: "post",
      targetId: params.postId,
      reason: reason || "",
      action,
      resolvedBy: session.user.id,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Moderation action error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
