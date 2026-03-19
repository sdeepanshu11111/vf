import ReelsFeed from "@/components/reels/ReelsFeed";
import productData from "../../../productData.json";

export const metadata = {
  title: "Reels - vF Community",
  description: "Swipe to discover trending products.",
};

export default function ReelsPage() {
  // Pass the raw product data straight to the client component. 
  // In a real scenario, this would be paginated or streamed from an API.
  return (
    <>
      <ReelsFeed products={productData.slice(0, 50)} />
    </>
  );
}
