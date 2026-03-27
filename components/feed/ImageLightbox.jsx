"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

export default function ImageLightbox({ images, activeIndex, onClose, onNext, onPrev }) {
  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") {
        e.preventDefault();
        onNext();
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        onPrev();
      }
    };

    if (activeIndex !== null) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [activeIndex, onClose, onNext, onPrev]);

  if (activeIndex === null || !images || images.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 sm:p-8"
        onClick={onClose}
      >
        {/* Close Button */}
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="absolute top-6 right-6 h-12 w-12 flex items-center justify-center rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all z-[110] outline-none active:scale-90"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Counter */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white/90 text-xs font-black uppercase tracking-widest z-[110]">
          {activeIndex + 1} / {images.length}
        </div>

        {/* Image Container */}
        <div 
          className="relative w-full h-full flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: -20 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className="relative max-w-full max-h-full flex items-center justify-center"
            >
              <img
                src={images[activeIndex]}
                alt={`Image ${activeIndex + 1}`}
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl select-none"
                draggable={false}
              />
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); onPrev(); }}
                className="absolute left-0 sm:-left-16 h-14 w-14 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all outline-none active:scale-90"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onNext(); }}
                className="absolute right-0 sm:-right-16 h-14 w-14 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all outline-none active:scale-90"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            </>
          )}
        </div>

        {/* Visual Tip */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 text-white/30 text-[10px] font-bold uppercase tracking-[0.2em] pointer-events-none">
          <Maximize2 className="h-3 w-3" />
          <span>Use Arrow Keys to Navigate</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
