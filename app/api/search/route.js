import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { serializePost, serializeUser } from "@/lib/serializers";

// GET /api/search
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const type = searchParams.get("type") || "all";

    if (!q.trim()) {
      return NextResponse.json({ posts: [], users: [] });
    }

    const db = await getDb();
    const regex = { $regex: q, $options: "i" };

    let posts = [];
    let users = [];

    if (type === "all" || type === "posts") {
      posts = await db
        .collection("posts")
        .aggregate([
          {
            $match: {
              status: "active",
              $or: [{ content: regex }, { tags: regex }],
            },
          },
          { $sort: { createdAt: -1 } },
          { $limit: 20 },
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
              tags: 1,
              upvotes: 1,
              commentCount: 1,
              createdAt: 1,
              "author.name": 1,
              "author.avatar": 1,
              "author.tier": 1,
            },
          },
        ])
        .toArray();
    }

    if (type === "all" || type === "users") {
      users = await db
        .collection("users")
        .find(
          {
            isBanned: { $ne: true },
            $or: [{ name: regex }, { bio: regex }, { niche: regex }],
          },
          { projection: { passwordHash: 0, email: 0 } },
        )
        .limit(20)
        .toArray();
    }

    return NextResponse.json({
      posts: posts.map(serializePost),
      users: users.map(serializeUser),
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
