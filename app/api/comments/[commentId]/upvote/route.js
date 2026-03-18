import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { ObjectId } from "mongodb";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    const commentId = params.commentId;
    const userId = session.user.id;

    const comment = await db
      .collection("comments")
      .findOne({ _id: new ObjectId(commentId) });
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    const hasUpvoted = comment.upvotes?.includes(userId);

    if (hasUpvoted) {
      await db
        .collection("comments")
        .updateOne(
          { _id: new ObjectId(commentId) },
          { $pull: { upvotes: userId } },
        );
      return NextResponse.json({
        upvoted: false,
        count: (comment.upvotes?.length || 1) - 1,
      });
    } else {
      await db
        .collection("comments")
        .updateOne(
          { _id: new ObjectId(commentId) },
          { $addToSet: { upvotes: userId } },
        );
      return NextResponse.json({
        upvoted: true,
        count: (comment.upvotes?.length || 0) + 1,
      });
    }
  } catch (error) {
    console.error("Comment upvote error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
