import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { ObjectId } from "mongodb";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { serializePost, serializeUser } from "@/lib/serializers";

// GET /api/users/[userId]
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    const db = await getDb();

    const user = await db
      .collection("users")
      .findOne(
        { _id: new ObjectId(params.userId) },
        { projection: { passwordHash: 0 } },
      );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Hide email unless own profile
    if (!session || session.user.id !== params.userId) {
      delete user.email;
    }

    // Get user's posts
    const posts = await db
      .collection("posts")
      .find({ authorId: params.userId, status: "active" })
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();

    return NextResponse.json({
      user: serializeUser(user),
      posts: posts.map(serializePost),
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
// PATCH /api/users/[userId]
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.id !== params.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, bio, city, niche } = await request.json();
    const db = await getDb();

    const updateData = {};
    if (name) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (city !== undefined) updateData.city = city;
    if (niche !== undefined) updateData.niche = niche;

    // Update avatar if name changes
    if (name) {
      updateData.avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;
    }

    await db
      .collection("users")
      .updateOne({ _id: new ObjectId(params.userId) }, { $set: updateData });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Patch user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
