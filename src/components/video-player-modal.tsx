"use client";

import { useVideoStore } from "@/store/video-store";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { X, Share2, Heart, Eye, Clock, Film, Globe } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";
import type { Video } from "@/types/video";

// ── Embed providers configuration ──
const EMBED_PROVIDERS = [
  {
    name: "YouTube",
    test: (url: string) =>
      /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)/.test(url),
    embed: (url: string) => {
      const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([a-zA-Z0-9_-]{11})/);
      return m ? `https://www.youtube.com/embed/${m[1]}?autoplay=1&rel=0` : null;
    },
  },
  {
    name: "Vimeo",
    test: (url: string) => /vimeo\.com/.test(url),
    embed: (url: string) => {
      const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
      return m ? `https://player.vimeo.com/video/${m[1]}?autoplay=1` : null;
    },
  },
  {
    name: "Dailymotion",
    test: (url: string) => /dailymotion\.com\/video/.test(url),
    embed: (url: string) => {
      const m = url.match(/dailymotion\.com\/video\/([a-zA-Z0-9]+)/);
      return m ? `https://www.dailymotion.com/embed/video/${m[1]}?autoplay=1` : null;
    },
  },
  {
    name: "TikTok",
    test: (url: string) => /tiktok\.com\/@[^/]+\/video/.test(url),
    embed: (url: string) => {
      const m = url.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/);
      return m ? `https://www.tiktok.com/embed/v2/${m[1]}` : null;
    },
  },
  {
    name: "Facebook",
    test: (url: string) => /facebook\.com\/.*\/videos\//.test(url),
    embed: (url: string) => {
      const m = url.match(/facebook\.com\/.*\/videos\/(\d+)/);
      return m ? `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&autoplay=true` : null;
    },
  },
  {
    name: "Instagram",
    test: (url: string) => /instagram\.com\/(?:p|reel)\//.test(url),
    embed: (url: string) => {
      const m = url.match(/instagram\.com\/(?:p|reel)\/([a-zA-Z0-9_-]+)/);
      return m ? `https://www.instagram.com/p/${m[1]}/embed/` : null;
    },
  },
];

function getEmbedUrl(url: string): string | null {
  for (const provider of EMBED_PROVIDERS) {
    if (provider.test(url)) {
      return provider.embed(url);
    }
  }
  return null;
}

export function VideoPlayerModal() {
  const { isPlayerOpen, selectedVideo, closePlayer, videos, playVideo } =
    useVideoStore();
  const videoId = selectedVideo?.id ?? null;
  const [liked, setLiked] = useState(false);
  const [prevVideoId, setPrevVideoId] = useState<string | null>(null);

  // Reset liked when video changes without useEffect setState
  if (videoId && videoId !== prevVideoId) {
    setPrevVideoId(videoId);
    if (liked) setLiked(false);
  }

  const handleClose = useCallback(() => {
    closePlayer();
  }, [closePlayer]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    if (isPlayerOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isPlayerOpen, handleClose]);

  if (!selectedVideo) return null;

  const relatedVideos = videos
    .filter((v) => v.id !== selectedVideo.id)
    .slice(0, 6);

  const timeAgo = formatDistanceToNow(new Date(selectedVideo.createdAt), {
    addSuffix: true,
    locale: localeId,
  });

  // Determine how to render the video
  // If videoSource === "embed", videoUrl is already a valid <iframe src="..."> URL
  // Otherwise, try to detect if it's a legacy YouTube/etc URL saved before embed support
  const isEmbed = selectedVideo.videoSource === "embed";
  const directEmbedUrl = isEmbed ? selectedVideo.videoUrl : null;
  const legacyEmbedUrl = !isEmbed ? getEmbedUrl(selectedVideo.videoUrl) : null;
  const finalEmbedUrl = directEmbedUrl || legacyEmbedUrl;

  return (
    <AnimatePresence>
      {isPlayerOpen && (
        <Dialog open={isPlayerOpen} onOpenChange={() => handleClose()}>
          <DialogContent
            className="max-w-[95vw] lg:max-w-[90vw] xl:max-w-[85vw] h-[90vh] bg-black border-white/10 p-0 gap-0 overflow-hidden"
            showCloseButton={false}
          >
            <DialogTitle className="sr-only">
              {selectedVideo.title}
            </DialogTitle>

            <div className="flex flex-col lg:flex-row h-full">
              {/* Main Player Area */}
              <div className="flex-1 flex flex-col min-w-0">
                {/* Video Player */}
                <div className="relative w-full bg-black flex-shrink-0">
                  <div className="aspect-video w-full bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
                    {/* Embed iframe (YouTube, Vimeo, Dailymotion, etc.) */}
                    {finalEmbedUrl ? (
                      <iframe
                        src={finalEmbedUrl}
                        className="w-full aspect-video"
                        allow="autoplay; encrypted-media; fullscreen"
                        allowFullScreen
                        title={selectedVideo.title}
                      />
                    ) : (
                      /* Direct video player for uploaded files */
                      <video
                        src={selectedVideo.videoUrl}
                        controls
                        autoPlay
                        playsInline
                        className="w-full aspect-video"
                      >
                        Browser Anda tidak mendukung video.
                      </video>
                    )}
                  </div>

                  {/* Close button */}
                  <button
                    onClick={handleClose}
                    className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-black/80 transition-all z-10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Video Info */}
                <div className="p-4 sm:p-6 overflow-y-auto flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-lg sm:text-xl font-bold text-white flex-1">
                      {selectedVideo.title}
                    </h2>
                    {(isEmbed || !!legacyEmbedUrl) && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border border-orange-500/30 text-orange-400">
                        <Globe className="w-2.5 h-2.5 mr-0.5" />
                        Embed
                      </span>
                    )}
                  </div>

                  {/* Meta row */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1.5">
                      <Eye className="w-4 h-4" />
                      {selectedVideo.views.toLocaleString("id-ID")} views
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {timeAgo}
                    </span>
                    <span className="px-2 py-0.5 text-xs bg-white/10 rounded-full border border-white/10">
                      {selectedVideo.category}
                    </span>
                  </div>

                  {/* Description */}
                  {selectedVideo.description && (
                    <p className="text-sm text-white/60 leading-relaxed mb-5">
                      {selectedVideo.description}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setLiked(!liked)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                        liked
                          ? "bg-red-600 text-white"
                          : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/5"
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${liked ? "fill-current" : ""}`}
                      />
                      Suka
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/5 transition-all">
                      <Share2 className="w-4 h-4" />
                      Bagikan
                    </button>
                  </div>
                </div>
              </div>

              {/* Related Videos Sidebar */}
              <div className="hidden lg:flex flex-col w-80 xl:w-96 border-l border-white/5 overflow-y-auto">
                <div className="p-4 border-b border-white/5">
                  <h3 className="text-sm font-bold text-white">
                    Video Terkait
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {relatedVideos.map((video) => (
                    <RelatedVideoItem
                      key={video.id}
                      video={video}
                      onSelect={() => playVideo(video)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}

function RelatedVideoItem({
  video,
  onSelect,
}: {
  video: Video;
  onSelect: () => void;
}) {
  return (
    <motion.button
      whileHover={{ x: 4 }}
      onClick={onSelect}
      className="flex gap-3 w-full p-2 rounded-lg hover:bg-white/5 transition-colors text-left group"
    >
      <div className="relative w-36 flex-shrink-0 aspect-video rounded-lg overflow-hidden bg-white/5">
        {video.thumbnailUrl ? (
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-red-900/40 via-orange-900/30 to-black flex items-center justify-center">
            <Film className="w-5 h-5 text-white/20" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 py-0.5">
        <h4 className="text-sm font-medium text-white line-clamp-2 group-hover:text-red-400 transition-colors">
          {video.title}
        </h4>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
          <span>{video.views.toLocaleString("id-ID")} views</span>
          {video.duration && <span>{video.duration}</span>}
        </div>
      </div>
    </motion.button>
  );
}
