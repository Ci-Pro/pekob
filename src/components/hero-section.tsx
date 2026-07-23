"use client";

import { useVideoStore } from "@/store/video-store";
import { Play, TrendingUp, Clock, Eye, Film } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Video } from "@/types/video";

// Generate auto-thumbnail from Cloudinary video URL (first frame)
function getAutoThumbnail(video: Video): string | null {
  if (!video.videoUrl) return null;
  try {
    const cloudMatch = video.videoUrl.match(/res\.cloudinary\.com\/([^/]+)\/video\/upload\/(?:v\d+\/)(.+)\.\w+$/);
    if (cloudMatch) {
      return `https://res.cloudinary.com/${cloudMatch[1]}/video/upload/so_0,w_1280,h_720,c_fill,q_auto/${cloudMatch[2]}.jpg`;
    }
  } catch { /* fallback */ }
  // YouTube
  const ytMatch = video.videoUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return `https://img.youtube.com/vi/${ytMatch[1]}/maxresdefault.jpg`;
  // Vimeo
  const vimeoMatch = video.videoUrl.match(/(?:player\.vimeo\.com\/video\/|vimeo\.com\/(?:video\/)?)(\d+)/);
  if (vimeoMatch) return `https://vumbnail.com/${vimeoMatch[1]}.jpg`;
  return null;
}

export function HeroSection() {
  const { featuredVideo, playVideo } = useVideoStore();

  if (!featuredVideo) return null;

  const heroThumb = featuredVideo.thumbnailUrl || getAutoThumbnail(featuredVideo);

  return (
    <section className="relative w-full min-h-[75vh] sm:min-h-[85vh] pt-16 sm:pt-20 overflow-hidden">
      {/* Background Image or Placeholder */}
      <div className="absolute inset-0">
        {heroThumb ? (
          <>
            <img
              src={heroThumb}
              alt={featuredVideo.title}
              className="absolute inset-0 w-full h-full object-cover scale-105"
            />
            {/* Multi-layer gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-black/50 to-black/20" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-red-950 via-[#0a0a0a] to-black" />
        )}
        {/* Red accent glow */}
        <div className="absolute bottom-20 left-0 w-96 h-96 bg-red-600/15 rounded-full blur-[120px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-end min-h-[calc(75vh-4rem)] sm:min-h-[calc(85vh-5rem)] pb-10 sm:pb-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={featuredVideo.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="max-w-2xl"
            >
              {/* Badge */}
              <div className="flex items-center gap-3 mb-4">
                <span className="flex items-center gap-1.5 px-3 py-1 bg-red-600 rounded-full text-xs font-semibold text-white uppercase tracking-wider">
                  <TrendingUp className="w-3 h-3" />
                  Featured
                </span>
                <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium text-white/80 border border-white/10">
                  {featuredVideo.category}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-3 sm:mb-4 tracking-tight">
                {featuredVideo.title}
              </h1>

              {/* Description */}
              {featuredVideo.description && (
                <p className="text-sm sm:text-base text-white/60 mb-4 sm:mb-6 line-clamp-2 max-w-xl">
                  {featuredVideo.description}
                </p>
              )}

              {/* Meta + CTA */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                <button
                  onClick={() => playVideo(featuredVideo)}
                  className="group flex items-center gap-3 px-5 sm:px-8 py-2.5 sm:py-3.5 bg-red-600 hover:bg-red-700 rounded-full text-white font-bold text-sm sm:text-base transition-all duration-300 hover:shadow-xl hover:shadow-red-600/30 hover:scale-105 active:scale-95"
                >
                  <Play className="w-5 h-5 fill-current" />
                  Tonton Sekarang
                </button>
                <div className="flex items-center gap-3 sm:gap-4 text-white/50 text-xs sm:text-sm">
                  {featuredVideo.duration && (
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {featuredVideo.duration}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4" />
                    {featuredVideo.views.toLocaleString("id-ID")} views
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom fade to content */}
      <div className="absolute bottom-0 left-0 right-0 h-32 sm:h-40 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
    </section>
  );
}
