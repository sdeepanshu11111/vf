"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ReelItem from "./ReelItem";
import { Loader2 } from "lucide-react";

export default function ReelsFeed({ initialProducts }) {
  const containerRef = useRef(null);
  const observerRef = useRef(null); // Sentinel
  
  const [activeIndex, setActiveIndex] = useState(0);
  const [products, setProducts] = useState(initialProducts);
  
  // Pagination states
  const [page, setPage] = useState(2); // initial payload is page 1
  const [hasMore, setHasMore] = useState(initialProducts.length === 5);
  const [isLoading, setIsLoading] = useState(false);

  // Observer to track which reel is active in viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target.dataset.index !== undefined) {
            setActiveIndex(Number(entry.target.dataset.index));
          }
        });
      },
      {
        root: containerRef.current,
        threshold: 0.6,
      }
    );

    const items = containerRef.current?.querySelectorAll(".reel-item");
    items?.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, [products]);

  // Fetch logic for subsequent pages
  const fetchMoreData = useCallback(async () => {
    if (isLoading || !hasMore) return;
    
    try {
      setIsLoading(true);
      const res = await fetch(`/api/reels?page=${page}&limit=5`);
      const json = await res.json();
      
      if (json.success) {
        setProducts(prev => [...prev, ...json.data]);
        setPage(prev => prev + 1);
        setHasMore(json.hasMore);
      }
    } catch (err) {
      console.error("Failed to append reels", err);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, page]);

  // Observer to trigger load more when sentinel is visible
  useEffect(() => {
    const sentinelObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchMoreData();
        }
      },
      { root: containerRef.current, rootMargin: "0px 0px 400px 0px" } // preemptive loading threshold
    );

    if (observerRef.current) {
      sentinelObserver.observe(observerRef.current);
    }

    return () => sentinelObserver.disconnect();
  }, [fetchMoreData]);

  return (
    <div 
      className="fixed top-0 bottom-0 left-0 right-0 lg:left-[280px] xl:right-[340px] bg-black z-20 overflow-y-auto snap-y snap-mandatory touch-pan-y hide-scrollbar"
      ref={containerRef}
    >
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
      
      {products.map((product, index) => (
        <div 
          key={`${product.vfprodid}-${index}`} 
          data-index={index}
          className="reel-item w-full h-[100dvh] snap-start snap-always"
        >
          <ReelItem product={product} isActive={activeIndex === index} />
        </div>
      ))}
      
      {/* Load More Sentinel */}
      <div 
        ref={observerRef} 
        className="w-full h-24 flex flex-col items-center justify-center snap-start bg-black text-white"
      >
        {isLoading && <Loader2 className="w-8 h-8 animate-spin text-gray-500 mb-2" />}
        {!hasMore && products.length > 0 && (
          <span className="text-xs font-bold text-gray-600">You've viewed all the trending reels!</span>
        )}
      </div>
    </div>
  );
}
