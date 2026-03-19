import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { ObjectId } from "mongodb";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { serializePost } from "@/lib/serializers";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    const user = await db.collection("users").findOne({ _id: new ObjectId(session.user.id) });
    const savedPostIds = user?.savedPosts || [];

    if (savedPostIds.length === 0) {
      return NextResponse.json({ posts: [], total: 0 });
    }

    // Convert string IDs to ObjectIds where valid
    const objectIds = savedPostIds
      .map(id => {
        try {
          return new ObjectId(id);
        } catch {
          return null;
        }
      })
      .filter(Boolean);
      
    // Include both ObjectId and string representations just in case
    const idFilters = [...objectIds, ...savedPostIds];

    const pipeline = [
      { $match: { _id: { $in: idFilters }, status: "active" } },
      { $sort: { createdAt: -1 } },
      {
        $addFields: {
          authorObjectId: {
            $cond: {
              if: { $eq: [{ $type: "$authorId" }, "string"] },
              then: { $toObjectId: "$authorId" },
              else: "$authorId",
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "authorObjectId",
          foreignField: "_id",
          as: "author",
        },
      },
      { $unwind: { path: "$author", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          authorId: 1,
          type: 1,
          content: 1,
          images: 1,
          tags: 1,
          upvotes: 1,
          commentCount: 1,
          flagCount: 1,
          status: 1,
          createdAt: 1,
          "author.name": { $ifNull: ["$author.name", "Unknown Member"] },
          "author.avatar": 1,
          "author.tier": 1,
          "author._id": 1,
        },
      },
    ];

    const posts = await db.collection("posts").aggregate(pipeline).toArray();

    return NextResponse.json({
      posts: posts.map(serializePost),
      total: posts.length,
    });
  } catch (error) {
    console.error("Get saved posts error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
