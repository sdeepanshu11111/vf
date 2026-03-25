import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { ObjectId } from "mongodb";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId } = params;
    const body = await request.json();
    const { optionIndex } = body;

    if (optionIndex === undefined || optionIndex === null) {
      return NextResponse.json({ error: "Option index required" }, { status: 400 });
    }

    const db = await getDb();
    const post = await db.collection("posts").findOne({ _id: new ObjectId(postId) });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (!post.poll || !post.poll.options) {
      return NextResponse.json({ error: "Post does not contain a poll" }, { status: 400 });
    }

    const userId = session.user.id;
    let hasVoted = false;
    post.poll.options.forEach((opt) => {
      if (opt.votes && opt.votes.includes(userId)) {
        hasVoted = true;
      }
    });

    if (hasVoted) {
      return NextResponse.json({ error: "Already voted" }, { status: 400 });
    }

    if (optionIndex < 0 || optionIndex >= post.poll.options.length) {
      return NextResponse.json({ error: "Invalid option index" }, { status: 400 });
    }

    const updateQuery = {};
    updateQuery[`poll.options.${optionIndex}.votes`] = userId;

    await db.collection("posts").updateOne(
      { _id: new ObjectId(postId) },
      { $addToSet: updateQuery }
    );

    const updatedPost = await db.collection("posts").findOne({ _id: new ObjectId(postId) });

    return NextResponse.json({ success: true, poll: updatedPost.poll });
  } catch (error) {
    console.error("Vote error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
