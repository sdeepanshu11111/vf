import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { ObjectId } from "mongodb";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { serializeNotification } from "@/lib/serializers";

// GET /api/notifications
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 20;
    const skip = (page - 1) * limit;

    const db = await getDb();
    const filter = { userId: session.user.id };
    if (type && type !== "all") {
      filter.type = type;
    }

    const notifications = await db
      .collection("notifications")
      .aggregate([
        { $match: filter },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $addFields: { actorObjectId: { $toObjectId: "$actorId" } },
        },
        {
          $lookup: {
            from: "users",
            localField: "actorObjectId",
            foreignField: "_id",
            as: "actor",
          },
        },
        { $unwind: { path: "$actor", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1,
            userId: 1,
            actorId: 1,
            type: 1,
            postId: 1,
            read: 1,
            createdAt: 1,
            "actor.name": 1,
            "actor.avatar": 1,
            "actor.tier": 1,
          },
        },
      ])
      .toArray();

    const unreadCount = await db.collection("notifications").countDocuments({
      userId: session.user.id,
      read: false,
    });

    return NextResponse.json({
      notifications: notifications.map(serializeNotification),
      unreadCount,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PATCH /api/notifications — mark as read
export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request
      .json()
      .catch(() => ({ all: true }));
    const db = await getDb();

    if (body.all || (!body.ids?.length && Object.keys(body).length === 0)) {
      await db
        .collection("notifications")
        .updateMany(
          { userId: session.user.id, read: false },
          { $set: { read: true } },
        );
    } else if (body.ids?.length) {
      await db.collection("notifications").updateMany(
        {
          _id: { $in: body.ids.map((id) => new ObjectId(id)) },
          userId: session.user.id,
        },
        { $set: { read: true } },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Mark notifications error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
