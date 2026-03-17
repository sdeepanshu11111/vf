import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

// GET /api/members
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get("sort") || "points";
    const filter = searchParams.get("filter") || "all";
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const db = await getDb();

    const query = { isBanned: { $ne: true } };

    if (filter !== "all" && filter !== "following") {
      if (["starter", "growth", "scale"].includes(filter)) {
        query.tier = filter;
      }
    }

    if (filter === "following" && session) {
      const currentUser = await db
        .collection("users")
        .findOne(
          { email: session.user.email },
          { projection: { following: 1 } },
        );
      if (currentUser?.following?.length) {
        const { ObjectId } = await import("mongodb");
        query._id = {
          $in: currentUser.following.map((id) => new ObjectId(id)),
        };
      } else {
        return NextResponse.json({ members: [], total: 0, page });
      }
    }

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const sortField =
      sort === "postCount"
        ? { postCount: -1 }
        : sort === "joinedAt"
          ? { joinedAt: -1 }
          : { points: -1 };

    const [members, total] = await Promise.all([
      db
        .collection("users")
        .find(query, { projection: { passwordHash: 0, email: 0 } })
        .sort(sortField)
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection("users").countDocuments(query),
    ]);

    return NextResponse.json({ members, total, page });
  } catch (error) {
    console.error("Get members error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
