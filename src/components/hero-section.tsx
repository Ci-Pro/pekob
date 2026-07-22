"use client";

import { useVideoStore } from "@/store/video-store";
import { Play, TrendingUp, Clock, Eye } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export function HeroSection() {
  const { featuredVideo, playVideo } = useVideoStore();

  if (!featuredVideo) return null;

  return (
    <section className="relative w-full h-[70vh] sm:h-[80vh] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={featuredVideo.thumbnailUrl}
          alt={featuredVideo.title}
          fill
          priority
          className="object-cover scale-105"
        />
        {/* Multi-layer gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
        {/* Red accent glow */}
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-600/20 rounded-full blur-[120px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-end pb-16 sm:pb-24 px-4 sm:px-6">
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
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-4 tracking-tight">
                {featuredVideo.title}
              </h1>

              {/* Description */}
              {featuredVideo.description && (
                <p className="text-sm sm:text-base text-white/60 mb-6 line-clamp-2 max-w-xl">
                  {featuredVideo.description}
                </p>
              )}

              {/* Meta + CTA */}
              <div className="flex items-center gap-4 sm:gap-6 mb-8">
                <button
                  onClick={() => playVideo(featuredVideo)}
                  className="group flex items-center gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-red-600 hover:bg-red-700 rounded-full text-white font-bold text-sm sm:text-base transition-all duration-300 hover:shadow-xl hover:shadow-red-600/30 hover:scale-105 active:scale-95"
                >
                  <Play className="w-5 h-5 fill-current" />
                  Tonton Sekarang
                </button>
                <div className="flex items-center gap-4 text-white/50 text-xs sm:text-sm">
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
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
    </section>
  );
}
