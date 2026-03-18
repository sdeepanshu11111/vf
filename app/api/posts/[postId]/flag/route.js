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

    const body = await request.json();
    const { reason } = body;

    const db = await getDb();
    const userId = session.user.id;

    // Idempotent flagging
    const result = await db.collection("posts").updateOne(
      { _id: new ObjectId(params.postId), flaggedBy: { $ne: userId } },
      {
        $addToSet: { flaggedBy: userId },
        $inc: { flagCount: 1 },
      },
    );

    // Auto-hide if 3+ flags
    const post = await db
      .collection("posts")
      .findOne({ _id: new ObjectId(params.postId) });
    if (post && post.flagCount >= 3) {
      await db
        .collection("posts")
        .updateOne(
          { _id: new ObjectId(params.postId) },
          { $set: { status: "hidden" } },
        );
    }

    return NextResponse.json({ flagged: true });
  } catch (error) {
    console.error("Flag error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
