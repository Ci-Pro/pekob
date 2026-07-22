"use client";

import { useVideoStore } from "@/store/video-store";
import { CATEGORIES, type Category } from "@/types/video";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export function CategoryBar() {
  const { activeCategory, setActiveCategory } = useVideoStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      const amount = dir === "left" ? -200 : 200;
      scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  return (
    <div className="relative group">
      {/* Scroll Arrows */}
      <button
        onClick={() => scroll("left")}
        className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 items-center justify-center bg-black/80 backdrop-blur-sm border border-white/10 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white/10"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        onClick={() => scroll("right")}
        className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 items-center justify-center bg-black/80 backdrop-blur-sm border border-white/10 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white/10"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Categories */}
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-none pb-2 px-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {CATEGORIES.map((category) => (
          <CategoryChip
            key={category}
            label={category}
            isActive={activeCategory === category}
            onClick={() => setActiveCategory(category)}
          />
        ))}
      </div>
    </div>
  );
}

function CategoryChip({
  label,
  isActive,
  onClick,
}: {
  label: Category;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`flex-shrink-0 px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
        isActive
          ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
          : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/5"
      }`}
    >
      {label}
    </motion.button>
  );
}
