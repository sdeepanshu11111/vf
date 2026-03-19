import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "5", 10);
    const skip = (page - 1) * limit;
    
    console.log("Reels API Request:", { page, limit });
    const db = await getDb();
    if (!db) {
      console.error("Database connection failed");
      return NextResponse.json({ success: false, error: "Database not available" }, { status: 500 });
    }

    // MongoDB query to find products exactly with `.mp4` string
    const query = {
      $or: [
        { "carousel.videos": { $regex: "\\.mp4", $options: "i" } },
        { "videos": { $regex: "\\.mp4", $options: "i" } },
        { "video": { $regex: "\\.mp4", $options: "i" } },
        { "primary_video": { $regex: "\\.mp4", $options: "i" } },
      ]
    };

    const totalDocs = await db.collection("products").countDocuments(query);
    console.log("Reels API Query Result:", { found: totalDocs });

    const products = await db.collection("products")
      .find(query)
      .skip(skip)
      .limit(limit)
      .toArray();

    // Serialize ObjectId to pass down to Client Components
    const serialized = products.map((p) => ({
      ...p,
      _id: p._id.toString()
    }));

    return NextResponse.json({
      success: true,
      data: serialized,
      page,
      limit,
      hasMore: products.length === limit,
      count: products.length,
      totalMatched: totalDocs,
      dbName: db.databaseName,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error fetching reels:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch reels" }, { status: 500 });
  }
}
