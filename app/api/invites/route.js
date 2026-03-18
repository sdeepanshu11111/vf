import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { randomBytes } from "crypto";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

// POST /api/invites — generate invite (admin only)
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { email, tier } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const db = await getDb();
    const code = randomBytes(16).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await db.collection("invites").insertOne({
      email,
      tier: tier || "starter",
      code,
      createdBy: session.user.id,
      usedAt: null,
      expiresAt,
      createdAt: new Date(),
    });

    const inviteUrl = `${process.env.NEXTAUTH_URL}/signup?invite=${code}`;

    return NextResponse.json({ inviteUrl, code }, { status: 201 });
  } catch (error) {
    console.error("Create invite error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
