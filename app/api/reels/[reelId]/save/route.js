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
    const savedReels = user.savedReels || [];
    const isSaved = savedReels.includes(reelIdStr);

    let updateDoc;
    if (isSaved) {
      updateDoc = { $pull: { savedReels: reelIdStr } };
    } else {
      updateDoc = { $addToSet: { savedReels: reelIdStr } };
    }

    await db.collection("users").updateOne({ _id: userId }, updateDoc);

    return NextResponse.json({ saved: !isSaved });
  } catch (error) {
    console.error("Save reel error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
