import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { serializePost } from "@/lib/serializers";

export const dynamic = "force-dynamic";

// GET /api/moderation — flag queue
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["moderator", "admin"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const db = await getDb();

    const posts = await db
      .collection("posts")
      .aggregate([
        { $match: { $or: [{ flagCount: { $gte: 1 } }, { status: "hidden" }] } },
        { $sort: { flagCount: -1 } },
        {
          $addFields: { authorObjectId: { $toObjectId: "$authorId" } },
        },
        {
          $lookup: {
            from: "users",
            localField: "authorObjectId",
            foreignField: "_id",
            as: "author",
          },
        },
        { $unwind: "$author" },
        {
          $project: {
            _id: 1,
            authorId: 1,
            type: 1,
            content: 1,
            flagCount: 1,
            flaggedBy: 1,
            status: 1,
            createdAt: 1,
            "author.name": 1,
            "author.avatar": 1,
            "author.tier": 1,
          },
        },
      ])
      .toArray();

    // Get stats
    const stats = {
      pendingFlags: await db
        .collection("posts")
        .countDocuments({ flagCount: { $gte: 1 } }),
      removedPosts: await db
        .collection("posts")
        .countDocuments({ status: { $in: ["hidden", "removed"] } }),
      bannedUsers: await db
        .collection("users")
        .countDocuments({ isBanned: true }),
    };

    return NextResponse.json({
      flaggedPosts: posts.map(serializePost),
      stats,
    });
  } catch (error) {
    console.error("Get moderation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
