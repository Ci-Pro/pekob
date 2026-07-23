import { create } from "zustand";
import type { Video } from "@/types/video";

interface VideoStore {
  videos: Video[];
  featuredVideo: Video | null;
  selectedVideo: Video | null;
  isPlayerOpen: boolean;
  activeCategory: string;
  categories: string[];
  searchQuery: string;
  isLoading: boolean;
  lastSyncVersion: number;

  setVideos: (videos: Video[]) => void;
  setFeaturedVideo: (video: Video | null) => void;
  playVideo: (video: Video) => void;
  closePlayer: () => void;
  setActiveCategory: (category: string) => void;
  setCategories: (categories: string[]) => void;
  setSearchQuery: (query: string) => void;
  setLoading: (loading: boolean) => void;
  incrementView: (id: string) => void;
  setLastSyncVersion: (version: number) => void;
}

export const useVideoStore = create<VideoStore>((set, get) => ({
  videos: [],
  featuredVideo: null,
  selectedVideo: null,
  isPlayerOpen: false,
  activeCategory: "",
  categories: [],
  searchQuery: "",
  isLoading: true,
  lastSyncVersion: -1,

  setVideos: (videos) => set({ videos }),

  setFeaturedVideo: (video) => set({ featuredVideo: video }),

  playVideo: (video) => {
    const { videos } = get();
    set({
      selectedVideo: video,
      isPlayerOpen: true,
    });
    set({
      videos: videos.map((v) =>
        v.id === video.id ? { ...v, views: v.views + 1 } : v
      ),
    });
    fetch("/api/videos", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: video.id, views: video.views }),
    }).catch(() => {});
  },

  closePlayer: () => set({ isPlayerOpen: false, selectedVideo: null }),

  setActiveCategory: (category) => set({ activeCategory: category }),

  setCategories: (categories) => set({ categories }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setLoading: (loading) => set({ isLoading: loading }),

  incrementView: (id) => {
    const { videos } = get();
    set({
      videos: videos.map((v) =>
        v.id === id ? { ...v, views: v.views + 1 } : v
      ),
    });
  },

  setLastSyncVersion: (version) => set({ lastSyncVersion: version }),
}));
