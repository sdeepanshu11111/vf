"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "@/components/products/ProductCard";
import { Sparkles, ArrowDownToLine, Loader2 } from "lucide-react";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const observerRef = useRef(null);
  const sentinelRef = useRef(null);

  const fetchProducts = useCallback(
    async (reset = false, currentPage = null) => {
      const targetPage = reset ? 1 : currentPage || page;

      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const url = new URL("/api/reels", window.location.origin);
        url.searchParams.set("page", targetPage.toString());
        url.searchParams.set("limit", "12");

        const res = await fetch(url.toString());
        const data = await res.json();

        const newProducts = data.data || [];

        if (reset) {
          setProducts(newProducts);
          setPage(2);
        } else {
          setProducts((prev) => [...prev, ...newProducts]);
          setPage(targetPage + 1);
        }

        setHasMore(newProducts.length === 12);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [page],
  );

  // Initial Fetch
  useEffect(() => {
    fetchProducts(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Infinite Scroll Observer
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          setPage((prevPage) => {
            fetchProducts(false, prevPage);
            return prevPage;
          });
        }
      },
      { threshold: 0.1 },
    );

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [hasMore, loadingMore, loading, fetchProducts]);

  return (
    <div className="w-full pb-20">
      {/* Page Header */}
      <div className="mb-10 sm:mb-14 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest mb-4 shadow-sm animate-pulse">
          <Sparkles className="h-3.5 w-3.5" />
          VIP Dropship Access
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-foreground tracking-tight leading-tight">
          Winning Products
        </h1>
        <p className="text-muted-foreground mt-4 text-sm sm:text-base font-medium max-w-2xl leading-relaxed">
          Exclusive access to high-margin dropship products. Sourced, verified,
          and heavily analyzed by our experts for optimal scaling.
        </p>
      </div>

      {loading ? (
        // Loading Grid Skeletons
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="animate-pulse bg-black/5 dark:bg-white/5 rounded-[2rem] h-[600px] w-full"
            />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-24 bg-white dark:bg-black/20 rounded-[2rem] border border-gray-100 dark:border-white/5">
          <p className="text-gray-500 font-bold text-lg">No products found</p>
          <p className="text-sm text-gray-400 mt-2">
            Come back later for high-margin drops!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <AnimatePresence>
            {products.map((product, i) => (
              <motion.div
                key={`${product._id}-${i}`}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Infinite Scroll Sentinel */}
      <div ref={sentinelRef} className="h-10 mt-8" />

      {/* Loading More Spinner */}
      {loadingMore && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      )}

      {/* End of Feed Message */}
      {!hasMore && products.length > 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest bg-gray-100 dark:bg-white/5 inline-block py-2 px-4 rounded-full">
            You've viewed all winning products! 🚀
          </p>
        </div>
      )}
    </div>
  );
}
