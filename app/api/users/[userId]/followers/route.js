import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { ObjectId } from "mongodb";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

// GET /api/users/[userId]/followers?type=followers|following
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "followers";

    const db = await getDb();
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(params.userId) }, { projection: { followers: 1, following: 1 } });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const ids = (type === "following" ? user.following : user.followers) || [];

    if (ids.length === 0) {
      return NextResponse.json({ users: [] });
    }

    const users = await db
      .collection("users")
      .find(
        { _id: { $in: ids.map((id) => { try { return new ObjectId(id); } catch { return null; } }).filter(Boolean) } },
        { projection: { passwordHash: 0, email: 0 } }
      )
      .toArray();

    const currentUserFollowing = session
      ? (await db.collection("users").findOne({ _id: new ObjectId(session.user.id) }, { projection: { following: 1 } }))?.following || []
      : [];

    const serialized = users.map((u) => ({
      _id: u._id.toString(),
      name: u.name,
      avatar: u.avatar,
      tier: u.tier,
      niche: u.niche,
      bio: u.bio,
      followerCount: u.followers?.length || 0,
      isFollowing: currentUserFollowing.includes(u._id.toString()),
    }));

    return NextResponse.json({ users: serialized });
  } catch (error) {
    console.error("Get followers error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
