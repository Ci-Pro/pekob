"use client";

import type { Video } from "@/types/video";
import { useVideoStore } from "@/store/video-store";
import { Play, Eye, Clock, Film } from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";

function ThumbnailImage({ video }: { video: Video }) {
  if (video.thumbnailUrl) {
    return (
      <img
        src={video.thumbnailUrl}
        alt={video.title}
        className="w-full h-full object-cover"
      />
    );
  }

  // Gradient placeholder when no thumbnail
  return (
    <div className="w-full h-full bg-gradient-to-br from-red-900/40 via-orange-900/30 to-black flex items-center justify-center">
      <Film className="w-8 h-8 text-white/20" />
    </div>
  );
}

export function VideoCard({ video, index = 0 }: { video: Video; index?: number }) {
  const { playVideo } = useVideoStore();

  const timeAgo = formatDistanceToNow(new Date(video.createdAt), {
    addSuffix: true,
    locale: localeId,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      onClick={() => playVideo(video)}
      className="group cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video rounded-xl overflow-hidden bg-white/5 mb-3">
        <ThumbnailImage video={video} />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-14 h-14 rounded-full bg-red-600/90 backdrop-blur-sm flex items-center justify-center shadow-2xl shadow-red-600/40"
          >
            <Play className="w-6 h-6 text-white fill-white ml-0.5" />
          </motion.div>
        </div>

        {/* Duration badge */}
        {video.duration && (
          <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 backdrop-blur-sm rounded text-xs font-medium text-white">
            {video.duration}
          </div>
        )}

        {/* Featured badge */}
        {video.isFeatured && (
          <div className="absolute top-2 left-2 px-2 py-0.5 bg-red-600 rounded text-[10px] font-bold text-white uppercase tracking-wider">
            Featured
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-0.5">
        <h3 className="text-sm font-semibold text-white line-clamp-2 group-hover:text-red-400 transition-colors duration-200 mb-1.5">
          {video.title}
        </h3>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {video.views.toLocaleString("id-ID")}
          </span>
          {video.duration && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {video.duration}
            </span>
          )}
          <span>{timeAgo}</span>
        </div>
        <div className="mt-1.5">
          <span className="inline-block px-2 py-0.5 text-[10px] font-medium text-white/40 bg-white/5 rounded-full border border-white/5">
            {video.category}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
