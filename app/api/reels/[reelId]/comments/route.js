import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { ObjectId } from "mongodb";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

export async function GET(request, { params }) {
  try {
    const db = await getDb();
    const reelIdStr = params.reelId;

    const comments = await db.collection("reelComments")
      .find({ reelId: reelIdStr })
      .sort({ createdAt: -1 })
      .toArray();

    // Map _id to id for serialization
    const safeComments = comments.map(c => ({
      ...c,
      id: c._id.toString(),
      _id: undefined
    }));

    return NextResponse.json({ success: true, comments: safeComments });
  } catch (error) {
    console.error("Get reel comments error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { text } = await request.json();
    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Comment text is required" }, { status: 400 });
    }

    const db = await getDb();
    const reelIdStr = params.reelId;

    const newComment = {
      reelId: reelIdStr,
      userId: session.user.id,
      user: session.user.name || "Anonymous",
      userAvatar: session.user.image,
      text: text.trim(),
      createdAt: new Date()
    };

    const result = await db.collection("reelComments").insertOne(newComment);
    
    return NextResponse.json({ 
      success: true, 
      comment: {
        ...newComment,
        id: result.insertedId.toString()
      } 
    });
  } catch (error) {
    console.error("Post reel comment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
