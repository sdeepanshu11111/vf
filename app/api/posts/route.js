import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { ObjectId } from "mongodb";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

// GET /api/posts — fetch feed
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const db = await getDb();
    const filter = { status: "active" };
    if (type && ["win", "tip", "question", "sourcing"].includes(type)) {
      filter.type = type;
    }

    console.log("Fetching posts with filter:", filter);
    const pipeline = [
      { $match: filter },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
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

    const [posts, totalResult] = await Promise.all([
      db.collection("posts").aggregate(pipeline).toArray(),
      db.collection("posts").countDocuments(filter),
    ]);

    return NextResponse.json({ posts, total: totalResult, page });
  } catch (error) {
    console.error("Get posts error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/posts — create post
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, content, tags, images } = body;
    console.log("POST /api/posts - session user:", session.user);
    console.log("POST /api/posts - body:", body);

    if (!type || !["win", "tip", "question", "sourcing"].includes(type)) {
      return NextResponse.json(
        { error: "Valid post type required (win, tip, question, sourcing)" },
        { status: 400 },
      );
    }

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 },
      );
    }

    const db = await getDb();

    const newPost = {
      authorId: session.user.id,
      type,
      content: content.trim(),
      images: images || [],
      tags: tags || [],
      upvotes: [],
      commentCount: 0,
      flagCount: 0,
      flaggedBy: [],
      status: "active",
      createdAt: new Date(),
    };

    const result = await db.collection("posts").insertOne(newPost);

    // Increment postCount, points, and specific type counts
    const incUpdate = { postCount: 1, points: 10 };
    if (type === "win") incUpdate.winCount = 1;
    if (type === "tip") incUpdate.tipCount = 1;
    if (type === "question") incUpdate.questionCount = 1;
    if (type === "sourcing") incUpdate.sourcingCount = 1;

    await db
      .collection("users")
      .updateOne({ _id: new ObjectId(session.user.id) }, { $inc: incUpdate });

    // Notify followers
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(session.user.id) });
    if (user?.followers?.length > 0) {
      const notifications = user.followers.map((followerId) => ({
        userId: followerId,
        actorId: session.user.id,
        type: "mention",
        postId: result.insertedId.toString(),
        read: false,
        createdAt: new Date(),
      }));
      await db.collection("notifications").insertMany(notifications);
    }

    return NextResponse.json(
      { postId: result.insertedId.toString() },
      { status: 201 },
    );
  } catch (error) {
    console.error("CRITICAL: Create post error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
