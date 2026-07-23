"use client";

import { useVideoStore } from "@/store/video-store";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export function CategoryBar() {
  const { activeCategory, setActiveCategory, categories } = useVideoStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      const amount = dir === "left" ? -200 : 200;
      scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  // Only show categories from admin input — no hardcoded values
  if (categories.length === 0) return null;

  return (
    <div className="relative group/cat">
      {/* Scroll Arrows */}
      <button
        onClick={() => scroll("left")}
        className="hidden sm:flex absolute -left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 items-center justify-center bg-[#111] border border-white/[0.08] rounded-full text-white/60 opacity-0 group-hover/cat:opacity-100 transition-all duration-200 hover:bg-white/10 hover:text-white shadow-lg"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => scroll("right")}
        className="hidden sm:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 items-center justify-center bg-[#111] border border-white/[0.08] rounded-full text-white/60 opacity-0 group-hover/cat:opacity-100 transition-all duration-200 hover:bg-white/10 hover:text-white shadow-lg"
      >
        <ChevronRight className="w-3.5 h-3.5" />
      </button>

      {/* Categories */}
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto pb-1 px-0.5"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {/* "Semua" chip */}
        <CategoryChip
          label="Semua"
          isActive={!activeCategory}
          onClick={() => setActiveCategory("")}
        />
        {categories.map((category) => (
          <CategoryChip
            key={category}
            label={category}
            isActive={activeCategory === category}
            onClick={() =>
              setActiveCategory(activeCategory === category ? "" : category)
            }
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
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`flex-shrink-0 px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 whitespace-nowrap ${
        isActive
          ? "bg-red-600 text-white shadow-lg shadow-red-600/25"
          : "bg-white/[0.04] text-white/50 hover:bg-white/[0.08] hover:text-white border border-white/[0.06]"
      }`}
    >
      {label}
    </motion.button>
  );
}
