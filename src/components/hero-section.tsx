"use client";

import { useVideoStore } from "@/store/video-store";
import { Play, TrendingUp, Clock, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Video } from "@/types/video";

// Generate auto-thumbnail from Cloudinary video URL (first frame)
function getAutoThumbnail(video: Video): string | null {
  if (!video.videoUrl) return null;
  try {
    const cloudMatch = video.videoUrl.match(/res\.cloudinary\.com\/([^/]+)\/video\/upload\/(?:v\d+\/)(.+)\.\w+$/);
    if (cloudMatch) {
      // Use c_fill,g_faces (face-aware crop) for better portrait handling
      return `https://res.cloudinary.com/${cloudMatch[1]}/video/upload/so_0,w_960,h_540,c_fill,g_faces,q_auto,f_auto/${cloudMatch[2]}.jpg`;
    }
  } catch { /* fallback */ }
  // YouTube
  const ytMatch = video.videoUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
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
    <section className="relative w-full min-h-[45vh] sm:min-h-[50vh] lg:min-h-[55vh] pt-14 sm:pt-16 overflow-hidden">
      {/* Background Image or Placeholder */}
      <div className="absolute inset-0">
        {heroThumb ? (
          <>
            <img
              src={heroThumb}
              alt={featuredVideo.title}
              className="absolute inset-0 w-full h-full object-cover"
              loading="eager"
            />
            {/* Multi-layer gradient overlay — darker for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-[#0a0a0a]/20" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/80 via-[#0a0a0a]/40 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-red-950 via-[#0a0a0a] to-black" />
        )}
        {/* Red accent glow — smaller and more subtle */}
        <div className="absolute bottom-8 left-4 w-64 h-64 sm:w-80 sm:h-80 bg-red-600/10 rounded-full blur-[100px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-end min-h-[calc(45vh-3.5rem)] sm:min-h-[calc(50vh-4rem)] lg:min-h-[calc(55vh-4rem)] pb-6 sm:pb-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={featuredVideo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="max-w-2xl lg:max-w-3xl"
            >
              {/* Badge */}
              <div className="flex items-center gap-2 mb-3">
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 bg-red-600 rounded-full text-[10px] sm:text-xs font-semibold text-white uppercase tracking-wider">
                  <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  Featured
                </span>
                <span className="px-2.5 py-0.5 bg-white/10 backdrop-blur-sm rounded-full text-[10px] sm:text-xs font-medium text-white/70 border border-white/10">
                  {featuredVideo.category}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-3xl lg:text-4xl font-black text-white leading-tight mb-2 sm:mb-3 tracking-tight">
                {featuredVideo.title}
              </h1>

              {/* Description */}
              {featuredVideo.description && (
                <p className="text-xs sm:text-sm text-white/50 mb-3 sm:mb-5 line-clamp-2 max-w-lg">
                  {featuredVideo.description}
                </p>
              )}

              {/* Meta + CTA */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-5">
                <button
                  onClick={() => playVideo(featuredVideo)}
                  className="group flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 bg-red-600 hover:bg-red-700 rounded-full text-white font-bold text-xs sm:text-sm transition-all duration-300 hover:shadow-xl hover:shadow-red-600/25 hover:scale-[1.03] active:scale-95"
                >
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                  <span>Tonton Sekarang</span>
                </button>
                <div className="flex items-center gap-3 text-white/40 text-[11px] sm:text-xs">
                  {featuredVideo.duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      {featuredVideo.duration}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    {featuredVideo.views.toLocaleString("id-ID")} views
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom fade to content */}
      <div className="absolute bottom-0 left-0 right-0 h-20 sm:h-28 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
    </section>
  );
}
