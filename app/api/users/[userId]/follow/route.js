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
    const currentUserId = session.user.id;
    const targetUserId = params.userId;

    if (currentUserId === targetUserId) {
      return NextResponse.json(
        { error: "Cannot follow yourself" },
        { status: 400 },
      );
    }

    const currentUser = await db
      .collection("users")
      .findOne({ _id: new ObjectId(currentUserId) });
    const isFollowing = currentUser?.following?.includes(targetUserId);

    if (isFollowing) {
      // Unfollow
      await db
        .collection("users")
        .updateOne(
          { _id: new ObjectId(currentUserId) },
          { $pull: { following: targetUserId } },
        );
      await db
        .collection("users")
        .updateOne(
          { _id: new ObjectId(targetUserId) },
          { $pull: { followers: currentUserId } },
        );
      return NextResponse.json({ following: false });
    } else {
      // Follow
      await db
        .collection("users")
        .updateOne(
          { _id: new ObjectId(currentUserId) },
          { $addToSet: { following: targetUserId } },
        );
      await db
        .collection("users")
        .updateOne(
          { _id: new ObjectId(targetUserId) },
          { $addToSet: { followers: currentUserId } },
        );
      // Award +1 point to follower
      await db
        .collection("users")
        .updateOne(
          { _id: new ObjectId(currentUserId) },
          { $inc: { points: 1 } },
        );
      // Notification
      await db.collection("notifications").insertOne({
        userId: targetUserId,
        actorId: currentUserId,
        type: "follow",
        postId: null,
        read: false,
        createdAt: new Date(),
      });
      return NextResponse.json({ following: true });
    }
  } catch (error) {
    console.error("Follow error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
