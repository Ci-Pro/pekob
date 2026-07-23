"use client";

import { useVideoStore } from "@/store/video-store";
import { VideoGrid } from "./video-grid";

export function TrendingSection() {
  const { videos } = useVideoStore();
  const trending = [...videos]
    .sort((a, b) => b.views - a.views)
    .slice(0, 8);

  if (trending.length === 0) return null;

  return (
    <section className="space-y-5">
      {/* Section header */}
      <div className="flex items-center gap-3">
        <div className="w-1 h-8 bg-gradient-to-b from-red-500 to-orange-500 rounded-full" />
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Trending Sekarang 🔥
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Video paling banyak ditonton minggu ini
          </p>
        </div>
      </div>

      <VideoGrid videos={trending} isLoading={false} />
    </section>
  );
}
