import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

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
      flagged: await db
        .collection("posts")
        .countDocuments({ flagCount: { $gte: 1 } }),
      hidden: await db.collection("posts").countDocuments({ status: "hidden" }),
      banned: await db.collection("users").countDocuments({ isBanned: true }),
      actionsToday: await db.collection("moderation").countDocuments({
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      }),
    };

    return NextResponse.json({ posts, stats });
  } catch (error) {
    console.error("Get moderation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
