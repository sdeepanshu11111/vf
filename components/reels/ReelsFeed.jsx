"use client";

import { useState, useRef, useEffect } from "react";
import ReelItem from "./ReelItem";

export default function ReelsFeed({ products }) {
  const containerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Intersection observer to track which reel is active
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveIndex(Number(entry.target.dataset.index));
          }
        });
      },
      {
        root: containerRef.current,
        threshold: 0.6, // Fire when at least 60% of the item is visible
      }
    );

    const items = containerRef.current?.querySelectorAll(".reel-item");
    items?.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, [products]);

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
          key={product.vfprodid || index} 
          data-index={index}
          className="reel-item w-full h-[100dvh] snap-start snap-always"
        >
          <ReelItem product={product} isActive={activeIndex === index} />
        </div>
      ))}
    </div>
  );
}
