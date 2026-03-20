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
    const userId = new ObjectId(session.user.id);
    const reelIdStr = params.reelId;

    const user = await db.collection("users").findOne({ _id: userId });
    const likedReels = user.likedReels || [];
    const isLiked = likedReels.includes(reelIdStr);

    let updateDoc;
    if (isLiked) {
      updateDoc = { $pull: { likedReels: reelIdStr } };
    } else {
      updateDoc = { $addToSet: { likedReels: reelIdStr } };
    }

    await db.collection("users").updateOne({ _id: userId }, updateDoc);

    return NextResponse.json({ liked: !isLiked });
  } catch (error) {
    console.error("Like reel error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
