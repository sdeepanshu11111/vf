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

  const query = {
    $or: [
      { "carousel.videos": { $regex: "\\.mp4", $options: "i" } },
      { "videos": { $regex: "\\.mp4", $options: "i" } },
      { "video": { $regex: "\\.mp4", $options: "i" } },
      { "primary_video": { $regex: "\\.mp4", $options: "i" } },
    ]
  };

  // Keep payload lean to improve first paint.
  const projection = {
    name: 1,
    vfprodid: 1,
    star_rating: 1,
    stage: 1,
    product_cost: 1,
    primary_video: 1,
    primary_gif: 1,
    primary_image: 1,
    video: 1,
    videos: 1,
    "carousel.videos": 1,
    "product_features.pros": 1,
  };

  const productData = await db
    .collection("products")
    .find(query, { projection })
    .sort({ _id: -1 })
    .limit(5)
    .toArray();

  const initialReels = productData.map(p => ({
    ...p,
    _id: p._id.toString()
  }));

  return (
    <>
      <ReelsFeed 
        initialProducts={initialReels} 
        serverStats={{
          dbName: db.databaseName,
          initialCount: initialReels.length
        }}
      />
    </>
  );
}
