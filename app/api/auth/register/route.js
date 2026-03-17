import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { getDb } from "@/lib/mongodb";

function deriveTier(gmvRange) {
  switch (gmvRange) {
    case "₹50L+":
      return "scale";
    case "₹10L–50L":
      return "growth";
    default:
      return "starter";
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password, bio, city, niche, gmvRange, avatar } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email and password are required" },
        { status: 400 },
      );
    }

    const db = await getDb();

    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 },
      );
    }

    const passwordHash = await hash(password, 12);
    const tier = deriveTier(gmvRange);

    const diceBearAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;

    const newUser = {
      name,
      email,
      passwordHash,
      avatar: avatar || diceBearAvatar,
      bio: bio || "",
      city: city || "",
      niche: niche || "Other",
      gmvRange: gmvRange || "Just starting",
      role: "member",
      tier,
      points: 0,
      postCount: 0,
      followers: [],
      following: [],
      joinedAt: new Date(),
      isBanned: false,
    };

    const result = await db.collection("users").insertOne(newUser);

    return NextResponse.json(
      { userId: result.insertedId.toString() },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
