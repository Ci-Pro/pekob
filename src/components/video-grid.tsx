"use client";

import type { Video } from "@/types/video";
import { VideoCard } from "./video-card";
import { Skeleton } from "@/components/ui/skeleton";

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
        <h2 className="text-xl sm:text-2xl font-bold text-white">{title}</h2>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-video w-full rounded-xl bg-white/5" />
              <Skeleton className="h-4 w-3/4 bg-white/5" />
              <Skeleton className="h-3 w-1/2 bg-white/5" />
            </div>
          ))}
        </div>
      ) : videos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {videos.map((video, index) => (
            <VideoCard key={video.id} video={video} index={index} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <span className="text-2xl">🎬</span>
          </div>
          <p className="text-muted-foreground text-sm">{emptyMessage}</p>
        </div>
      )}
    </section>
  );
}
