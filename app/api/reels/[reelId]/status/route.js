import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { ObjectId } from "mongodb";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ isLiked: false, isSaved: false });
    }

    const db = await getDb();
    const userId = new ObjectId(session.user.id);
    const reelIdStr = params.reelId;

    const user = await db.collection("users").findOne({ _id: userId });
    const likedReels = user?.likedReels || [];
    const savedReels = user?.savedReels || [];

    return NextResponse.json({
      isLiked: likedReels.includes(reelIdStr),
      isSaved: savedReels.includes(reelIdStr)
    });
  } catch (error) {
    console.error("Get reel status error:", error);
    return NextResponse.json({ isLiked: false, isSaved: false });
  }
}
