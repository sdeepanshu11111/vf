"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ReelItem from "./ReelItem";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ReelsFeed({ initialProducts }) {
  const containerRef = useRef(null);
  const observerRef = useRef(null); // Sentinel
  
  const [activeIndex, setActiveIndex] = useState(0);
  const [products, setProducts] = useState(initialProducts || []);
  
  // Pagination states
  const [page, setPage] = useState(2); // initial payload is page 1
  const [hasMore, setHasMore] = useState((initialProducts?.length || 0) >= 5);
  const [isLoading, setIsLoading] = useState(false);

  // Observer to track which reel is active in viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target.dataset.index !== undefined) {
            const next = Number(entry.target.dataset.index);
            setActiveIndex((prev) => (prev === next ? prev : next));
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
      const url = `/api/reels?page=${page}&limit=5`;
      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const json = await res.json();
      
      if (json.success) {
        setProducts(prev => [...prev, ...json.data]);
        setPage(prev => prev + 1);
        setHasMore(json.hasMore);
      } else {
        toast.error("Failed to load more reels.");
      }
    } catch (err) {
      console.error("Failed to append reels", err);
      toast.error("Network error: Could not load more reels.");
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
      className="fixed inset-0 w-full h-[100dvh] bg-black z-30 lg:relative lg:max-w-[420px] lg:mx-auto lg:h-[calc(100vh-120px)] lg:bg-black lg:z-20 overflow-y-auto overflow-x-hidden snap-y snap-mandatory touch-pan-y hide-scrollbar lg:rounded-[2.5rem] lg:shadow-[0_0_50px_rgba(0,0,0,0.5)] lg:border-[8px] lg:border-black/80 lg:ring-1 lg:ring-white/10 lg:mt-4"
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
          className="reel-item w-full h-full snap-start snap-always"
        >
          {Math.abs(index - activeIndex) <= 2 ? (
            <ReelItem product={product} isActive={activeIndex === index} />
          ) : (
            <div className="w-full h-full bg-black" />
          )}
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
