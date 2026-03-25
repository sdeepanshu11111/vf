import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { hash } from "bcryptjs";
import { getDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

// GET /api/invites/[code] — validate invite
export async function GET(request, { params }) {
  try {
    const db = await getDb();
    const invite = await db
      .collection("invites")
      .findOne({ code: params.code });

    if (!invite) {
      return NextResponse.json({ valid: false, error: "Invalid invite code" });
    }

    if (invite.usedAt) {
      return NextResponse.json({ valid: false, error: "Invite already used" });
    }

    if (new Date() > invite.expiresAt) {
      return NextResponse.json({ valid: false, error: "Invite expired" });
    }

    return NextResponse.json({
      valid: true,
      email: invite.email,
      tier: invite.tier,
    });
  } catch (error) {
    console.error("Validate invite error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/invites/[code] — register via invite
export async function POST(request, { params }) {
  try {
    const db = await getDb();
    const invite = await db
      .collection("invites")
      .findOne({ code: params.code });

    if (!invite || invite.usedAt || new Date() > invite.expiresAt) {
      return NextResponse.json(
        { error: "Invalid or expired invite" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { name, password, bio, city, niche, gmvRange, avatar } = body;

    if (!name || !password) {
      return NextResponse.json(
        { error: "Name and password required" },
        { status: 400 },
      );
    }

    // Check email not already registered
    const existing = await db
      .collection("users")
      .findOne({ email: invite.email });
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 },
      );
    }

    const passwordHash = await hash(password, 12);
    const diceBearAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;
    const username =
      invite.email.split("@")[0].toLowerCase() + Math.floor(Math.random() * 1000);

    await db.collection("users").insertOne({
      name,
      email: invite.email,
      username,
      passwordHash,
      avatar: avatar || diceBearAvatar,
      bio: bio || "",
      city: city || "",
      niche: niche || "Other",
      gmvRange: gmvRange || "Just starting",
      role: "member",
      tier: invite.tier,
      points: 0,
      postCount: 0,
      followers: [],
      following: [],
      joinedAt: new Date(),
      isBanned: false,
    });

    // Mark invite as used
    await db
      .collection("invites")
      .updateOne({ _id: invite._id }, { $set: { usedAt: new Date() } });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Invite register error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
