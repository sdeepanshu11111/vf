import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { ObjectId } from "mongodb";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    const userId = new ObjectId(session.user.id);

    const user = await db.collection("users").findOne({ _id: userId });
    const likedReelIds = user?.likedReels || [];

    if (likedReelIds.length === 0) {
      return NextResponse.json({ success: true, reels: [] });
    }

    // Products collection uses string _ids often, or ObjectIds. 
    // From api/posts/saved/route.js, they try both objectIds and strings.
    const objectIds = likedReelIds
      .filter((id) => /^[0-9a-fA-F]{24}$/.test(id))
      .map((id) => new ObjectId(id));
    
    const idFilters = [...objectIds, ...likedReelIds];

    const products = await db.collection("products")
      .find({ _id: { $in: idFilters } })
      .toArray();

    const serialized = products.map(p => ({
      ...p,
      _id: p._id.toString()
    }));

    return NextResponse.json({ success: true, reels: serialized });
  } catch (error) {
    console.error("Get liked reels error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
