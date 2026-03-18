import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { ObjectId } from "mongodb";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { serializeMessage } from "@/lib/serializers";

export const dynamic = "force-dynamic";

// GET /api/messages/[conversationId] — get messages
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    const sessionId = session.user.id;
    const conv = await db.collection("conversations").findOne({
      _id: new ObjectId(params.conversationId),
    });

    const participantIds =
      conv?.participantIds ||
      conv?.participants?.map((participant) => participant?.toString()) ||
      [];

    if (!conv || !participantIds.includes(sessionId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    const messages = await db
      .collection("messages")
      .find({ conversationId: params.conversationId })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Mark all as read
    await db.collection("messages").updateMany(
      {
        conversationId: params.conversationId,
        senderId: { $ne: sessionId },
        readAt: null,
      },
      { $set: { readAt: new Date() } },
    );

    return NextResponse.json({ messages: messages.map(serializeMessage) });
  } catch (error) {
    console.error("Get messages error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/messages/[conversationId] — send message
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    const sessionId = session.user.id;
    const conv = await db.collection("conversations").findOne({
      _id: new ObjectId(params.conversationId),
    });

    const participantIds =
      conv?.participantIds ||
      conv?.participants?.map((participant) => participant?.toString()) ||
      [];

    if (!conv || !participantIds.includes(sessionId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { content } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 },
      );
    }

    const message = {
      conversationId: params.conversationId,
      senderId: sessionId,
      content: content.trim(),
      readAt: null,
      createdAt: new Date(),
    };

    const result = await db.collection("messages").insertOne(message);

    // Update conversation
    await db
      .collection("conversations")
      .updateOne(
        { _id: new ObjectId(params.conversationId) },
        { $set: { lastMessage: content.trim(), lastAt: new Date() } },
      );

    // Trigger Pusher event (silent fail if not configured)
    try {
      const { pusherServer } = await import("@/lib/pusher");
      if (process.env.PUSHER_APP_ID) {
        await pusherServer.trigger(
          `conversation-${params.conversationId}`,
          "new-message",
          {
            message: { ...message, _id: result.insertedId },
            sender: {
              id: sessionId,
              name: session.user.name,
              avatar: session.user.avatar,
            },
          },
        );
      }
    } catch (e) {
      // Pusher not configured, continue silently
    }

    return NextResponse.json(
      { messageId: result.insertedId.toString() },
      { status: 201 },
    );
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
