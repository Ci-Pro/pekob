"use client";

import { useEffect, useMemo, useRef, useCallback, Suspense } from "react";
import { useVideoStore } from "@/store/video-store";
import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import { CategoryBar } from "@/components/category-bar";
import { VideoGrid } from "@/components/video-grid";
import { TrendingSection } from "@/components/trending-section";
import { Footer } from "@/components/footer";
import { VideoPlayerModal } from "@/components/video-player-modal";
import { BelowHeroAd, BetweenSectionsAd } from "@/components/ads";
import { Sparkles } from "lucide-react";

// Poll interval: 8 seconds
const SYNC_INTERVAL_MS = 8000;

function HomePage() {
  const {
    videos,
    featuredVideo,
    activeCategory,
    searchQuery,
    lastSyncVersion,
    setVideos,
    setFeaturedVideo,
    setCategories,
    setLoading,
    setLastSyncVersion,
    isLoading,
  } = useVideoStore();

  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isFirstSyncRef = useRef(true);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data.categories || []);
    } catch {
      console.error("Failed to fetch categories");
    }
  }, [setCategories]);

  // Fetch videos
  const fetchVideos = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeCategory) params.set("category", activeCategory);
      if (searchQuery) params.set("search", searchQuery);

      const res = await fetch(`/api/videos?${params.toString()}`);
      const data = await res.json();
      setVideos(data.videos || []);

      // Refresh categories
      await fetchCategories();
    } catch (err) {
      console.error("Failed to fetch videos:", err);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, searchQuery, setVideos, setCategories, setLoading, fetchCategories]);

  // Fetch featured
  const fetchFeatured = useCallback(async () => {
    try {
      const res = await fetch("/api/videos?featured=true&limit=1");
      const data = await res.json();
      if (data.videos && data.videos.length > 0) {
        setFeaturedVideo(data.videos[0]);
      }
    } catch (err) {
      console.error("Failed to fetch featured:", err);
    }
  }, [setFeaturedVideo]);

  // Initial fetch: categories + videos + featured
  useEffect(() => {
    fetchCategories();
    fetchVideos();
    fetchFeatured();
    // Runs on mount only; fetchVideos re-triggers on category/search changes
  }, []);

  // Re-fetch when category or search changes
  useEffect(() => {
    fetchVideos();
  }, [activeCategory, searchQuery, fetchVideos]);

  // Re-fetch featured when videos change
  useEffect(() => {
    if (videos.length > 0 && !featuredVideo) {
      fetchFeatured();
    }
  }, [videos, featuredVideo, fetchFeatured]);

  // ── Real-time polling: check /api/sync every 8 seconds ──
  useEffect(() => {
    pollTimerRef.current = setInterval(async () => {
      // Skip when tab is not visible
      if (document.hidden) return;

      try {
        const res = await fetch("/api/sync");
        const data = await res.json();

        // First sync: just record the version, skip re-fetch
        if (isFirstSyncRef.current) {
          isFirstSyncRef.current = false;
          setLastSyncVersion(data.version);
          return;
        }

        // Version changed → admin made a change → re-fetch everything
        if (data.version !== lastSyncVersion) {
          setLastSyncVersion(data.version);
          fetchVideos();
          fetchFeatured();
        }
      } catch {
        // Silently ignore sync errors (network hiccups, etc.)
      }
    }, SYNC_INTERVAL_MS);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [lastSyncVersion, setLastSyncVersion, fetchVideos, fetchFeatured]);

  const filteredVideos = useMemo(() => {
    return videos.filter((v) => v.id !== featuredVideo?.id);
  }, [videos, featuredVideo]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
      <Header />

      {/* Hero Section — has its own top padding for the fixed header */}
      {featuredVideo && <HeroSection />}

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 pb-10 pt-20 sm:pt-24">
        <div className="max-w-7xl mx-auto space-y-8 sm:space-y-10">
          {/* Category Bar */}
          <CategoryBar />

          {/* Ad — below hero / category bar (high visibility) */}
          <BelowHeroAd />

          {/* Search indicator */}
          {searchQuery && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="w-4 h-4 text-red-400" />
              <span>
                Hasil pencarian untuk &quot;{searchQuery}&quot;
              </span>
            </div>
          )}

          {/* Video Grid — in-feed ad every 6 cards */}
          <VideoGrid
            videos={filteredVideos}
            isLoading={isLoading}
            title={activeCategory || "Video Terbaru"}
            emptyMessage="Tidak ada video ditemukan"
            adInterval={6}
          />

          {/* Ad — between Video Terbaru and Trending sections */}
          {!searchQuery && !activeCategory && <BetweenSectionsAd />}

          {/* Trending Section */}
          {!searchQuery && !activeCategory && <TrendingSection />}
        </div>
      </main>

      <Footer />

      {/* Video Player Modal */}
      <VideoPlayerModal />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-orange-500 animate-pulse" />
            <span className="text-white font-black tracking-tight text-xl">
              PEKOB
            </span>
          </div>
        </div>
      }
    >
      <HomePage />
    </Suspense>
  );
}
