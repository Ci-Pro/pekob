"use client";

import type { Video } from "@/types/video";
import { VideoCard } from "./video-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Flame } from "lucide-react";

interface VideoGridProps {
  videos: Video[];
  isLoading: boolean;
  title?: string;
  emptyMessage?: string;
}

export function VideoGrid({
  videos,
  isLoading,
  title,
  emptyMessage = "Belum ada video",
}: VideoGridProps) {
  return (
    <section className="space-y-5">
      {title && (
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-gradient-to-b from-red-500 to-orange-500 rounded-full" />
          <h2 className="text-lg sm:text-xl font-bold text-white">{title}</h2>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-video w-full rounded-xl bg-white/[0.04]" />
              <Skeleton className="h-3.5 w-3/4 bg-white/[0.04]" />
              <Skeleton className="h-3 w-1/2 bg-white/[0.04]" />
            </div>
          ))}
        </div>
      ) : videos.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
          {videos.map((video, index) => (
            <VideoCard key={video.id} video={video} index={index} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-4">
            <Flame className="w-7 h-7 text-white/10" />
          </div>
          <p className="text-muted-foreground/70 text-sm">{emptyMessage}</p>
        </div>
      )}
    </section>
  );
}
