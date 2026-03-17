import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { ObjectId } from "mongodb";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

// GET /api/messages — list conversations
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    const userId = session.user.id;

    const conversations = await db
      .collection("conversations")
      .find({ participants: userId })
      .sort({ lastAt: -1 })
      .toArray();

    // Enrich with other participant info and unread count
    const enriched = await Promise.all(
      conversations.map(async (conv) => {
        const otherId = conv.participants.find((p) => p !== userId);
        const otherUser = otherId
          ? await db
              .collection("users")
              .findOne(
                { _id: new ObjectId(otherId) },
                { projection: { name: 1, avatar: 1, tier: 1 } },
              )
          : null;

        const unreadCount = await db.collection("messages").countDocuments({
          conversationId: conv._id.toString(),
          senderId: { $ne: userId },
          readAt: null,
        });

        return {
          ...conv,
          otherUser,
          unreadCount,
        };
      }),
    );

    return NextResponse.json({ conversations: enriched });
  } catch (error) {
    console.error("Get conversations error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/messages — create conversation
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { participantId } = body;
    const userId = session.user.id;

    if (!participantId || participantId === userId) {
      return NextResponse.json(
        { error: "Invalid participant" },
        { status: 400 },
      );
    }

    const db = await getDb();

    // Idempotent: check both orderings
    const existing = await db.collection("conversations").findOne({
      $or: [
        { participants: [userId, participantId] },
        { participants: [participantId, userId] },
      ],
    });

    if (existing) {
      return NextResponse.json({ conversationId: existing._id.toString() });
    }

    const result = await db.collection("conversations").insertOne({
      participants: [userId, participantId],
      lastMessage: "",
      lastAt: new Date(),
    });

    return NextResponse.json(
      { conversationId: result.insertedId.toString() },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create conversation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
