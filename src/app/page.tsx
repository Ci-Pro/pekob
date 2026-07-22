"use client";

import { useEffect, useMemo, Suspense } from "react";
import { useVideoStore } from "@/store/video-store";
import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import { CategoryBar } from "@/components/category-bar";
import { VideoGrid } from "@/components/video-grid";
import { TrendingSection } from "@/components/trending-section";
import { Footer } from "@/components/footer";
import { VideoPlayerModal } from "@/components/video-player-modal";
import { Sparkles } from "lucide-react";

function HomePage() {
  const {
    videos,
    featuredVideo,
    activeCategory,
    searchQuery,
    setVideos,
    setFeaturedVideo,
    setCategories,
    setLoading,
    isLoading,
  } = useVideoStore();

  // Fetch categories on mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        setCategories(data.categories || []);
      } catch {
        console.error("Failed to fetch categories");
      }
    }
    fetchCategories();
  }, [setCategories]);

  // Fetch videos when category or search changes
  useEffect(() => {
    async function fetchVideos() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (activeCategory && activeCategory !== "Semua")
          params.set("category", activeCategory);
        if (searchQuery) params.set("search", searchQuery);

        const res = await fetch(`/api/videos?${params.toString()}`);
        const data = await res.json();
        setVideos(data.videos || []);

        // Refresh categories from latest data
        const catRes = await fetch("/api/categories");
        const catData = await catRes.json();
        setCategories(catData.categories || []);
      } catch (err) {
        console.error("Failed to fetch videos:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchVideos();
  }, [activeCategory, searchQuery, setVideos, setCategories, setLoading]);

  // Fetch featured video
  useEffect(() => {
    async function fetchFeatured() {
      try {
        const res = await fetch("/api/videos?featured=true&limit=1");
        const data = await res.json();
        if (data.videos && data.videos.length > 0) {
          setFeaturedVideo(data.videos[0]);
        } else if (videos.length > 0) {
          setFeaturedVideo(videos[0]);
        }
      } catch (err) {
        console.error("Failed to fetch featured:", err);
        if (videos.length > 0) {
          setFeaturedVideo(videos[0]);
        }
      }
    }
    fetchFeatured();
  }, [videos, setFeaturedVideo]);

  const filteredVideos = useMemo(() => {
    return videos.filter((v) => v.id !== featuredVideo?.id);
  }, [videos, featuredVideo]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
      <Header />

      {/* Hero Section */}
      {featuredVideo && <HeroSection />}

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 pb-8 pt-4">
        <div className="max-w-7xl mx-auto space-y-8 sm:space-y-10">
          {/* Category Bar */}
          <CategoryBar />

          {/* Search indicator */}
          {searchQuery && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="w-4 h-4 text-red-400" />
              <span>
                Hasil pencarian untuk &quot;{searchQuery}&quot;
              </span>
            </div>
          )}

          {/* Video Grid */}
          <VideoGrid
            videos={filteredVideos}
            isLoading={isLoading}
            title={
              activeCategory && activeCategory !== "Semua"
                ? `${activeCategory}`
                : "Video Terbaru"
            }
            emptyMessage="Tidak ada video ditemukan"
          />

          {/* Trending Section */}
          {!searchQuery && activeCategory === "Semua" && <TrendingSection />}
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
