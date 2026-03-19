import ReelsFeed from "@/components/reels/ReelsFeed";
import { getDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Reels - vF Community",
  description: "Swipe to discover trending products.",
};

export default async function ReelsPage() {
  const db = await getDb();
  
  // Use a native MongoDB query for fast initial load
  const query = {
    $or: [
      { "carousel.videos": { $regex: "\\.mp4", $options: "i" } },
      { "videos": { $regex: "\\.mp4", $options: "i" } },
      { "video": { $regex: "\\.mp4", $options: "i" } },
      { "primary_video": { $regex: "\\.mp4", $options: "i" } },
    ]
  };

  const productData = await db.collection("products")
    .find(query)
    .limit(5)
    .toArray();

  const initialReels = productData.map(p => ({
    ...p,
    _id: p._id.toString()
  }));

  // Initial render handles just 5 items for immediate UX paint
  return (
    <>
      <ReelsFeed initialProducts={initialReels} />
    </>
  );
}
