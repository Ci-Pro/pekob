"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import type { Video } from "@/types/video";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Upload,
  Trash2,
  Edit2,
  Plus,
  Image as ImageIcon,
  Film,
  Eye,
  Star,
  Search,
  Loader2,
  X,
  ChevronLeft,
  Tv,
  Tag,
  Clock,
  LogOut,
  ShieldCheck,
  Link2,
  Globe,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// ── Embed URL detectors ──
const EMBED_PROVIDERS: { name: string; pattern: RegExp; embedUrl: (id: string) => string }[] = [
  {
    name: "YouTube",
    pattern: /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    embedUrl: (id) => `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`,
  },
  {
    name: "Vimeo",
    pattern: /(?:https?:\/\/)?(?:www\.|player\.)?vimeo\.com\/(?:video\/)?(\d+)/,
    embedUrl: (id) => `https://player.vimeo.com/video/${id}?autoplay=1`,
  },
  {
    name: "Dailymotion",
    pattern: /(?:https?:\/\/)?(?:www\.)?(?:dailymotion\.com\/(?:embed\/)?video\/|dai\.ly\/)([a-zA-Z0-9]+)/,
    embedUrl: (id) => `https://www.dailymotion.com/embed/video/${id}?autoplay=1`,
  },
  {
    name: "TikTok",
    pattern: /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@[^/]+\/video\/(\d+)/,
    embedUrl: (id) => `https://www.tiktok.com/embed/v2/${id}`,
  },
  {
    name: "Facebook",
    pattern: /(?:https?:\/\/)?(?:www\.)?facebook\.com\/.*\/videos\/(\d+)/,
    embedUrl: (id) => `https://www.facebook.com/plugins/video.php?href=https://www.facebook.com/watch/?v=${id}&autoplay=true`,
  },
  {
    name: "Instagram",
    pattern: /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:p|reel)\/([a-zA-Z0-9_-]+)/,
    embedUrl: (id) => `https://www.instagram.com/p/${id}/embed/`,
  },
];

type EmbedInfo = { provider: string; id: string; embedUrl: string } | null;

function detectEmbedUrl(url: string): EmbedInfo {
  if (!url) return null;
  for (const provider of EMBED_PROVIDERS) {
    const match = url.match(provider.pattern);
    if (match && match[1]) {
      return {
        provider: provider.name,
        id: match[1],
        embedUrl: provider.embedUrl(match[1]),
      };
    }
  }
  return null;
}

function isValidUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/admin/check-session");
        const data = await res.json();
        if (!data.authenticated) {
          router.replace("/admin/login");
          return;
        }
      } catch {
        router.replace("/admin/login");
        return;
      } finally {
        setIsChecking(false);
      }
    }
    checkSession();
  }, [router]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-red-500" />
          <p className="text-sm text-muted-foreground">Memverifikasi akses...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}

function detectVideoDuration(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    const url = URL.createObjectURL(file);

    video.onloadedmetadata = () => {
      const duration = formatDuration(video.duration);
      URL.revokeObjectURL(url);
      resolve(duration);
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };

    video.src = url;
  });
}

type VideoInputMode = "upload" | "embed";

function AdminDashboard() {
  const router = useRouter();
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ thumbnail: false, video: false, percent: 0 });
  const [detectingDuration, setDetectingDuration] = useState(false);
  const [videoDragOver, setVideoDragOver] = useState(false);
  const [thumbDragOver, setThumbDragOver] = useState(false);
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    videoUrl: "",
    videoSource: "upload" as "upload" | "embed",
    embedUrl: "",
    thumbnailUrl: "",
    thumbnailFile: null as File | null,
    videoFile: null as File | null,
    duration: "" as string | null,
    isFeatured: false,
  });

  // Video input mode (upload file or embed URL)
  const [videoInputMode, setVideoInputMode] = useState<VideoInputMode>("upload");
  // Embed info detected from URL
  const [embedInfo, setEmbedInfo] = useState<EmbedInfo>(null);

  // Existing categories for suggestions
  const existingCategories = [...new Set(videos.map((v) => v.category))].sort();

  const fetchVideos = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/videos?limit=100");
      const data = await res.json();
      setVideos(data.videos || []);
    } catch {
      toast.error("Gagal memuat video");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      category: "",
      videoUrl: "",
      videoSource: "upload",
      embedUrl: "",
      thumbnailUrl: "",
      thumbnailFile: null,
      videoFile: null,
      duration: null,
      isFeatured: false,
    });
    setEditingVideo(null);
    setUploadProgress({ thumbnail: false, video: false, percent: 0 });
    setDetectingDuration(false);
    setVideoInputMode("upload");
    setEmbedInfo(null);
  };

  const openCreate = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const openEdit = (video: Video) => {
    const isEmbed = video.videoSource === "embed" || detectEmbedUrl(video.videoUrl) !== null;
    const embed = detectEmbedUrl(video.videoUrl);
    setForm({
      title: video.title,
      description: video.description || "",
      category: video.category,
      videoUrl: video.videoUrl,
      videoSource: video.videoSource || (isEmbed ? "embed" : "upload"),
      embedUrl: isEmbed ? video.videoUrl : "",
      thumbnailUrl: video.thumbnailUrl,
      thumbnailFile: null,
      videoFile: null,
      duration: video.duration || null,
      isFeatured: video.isFeatured,
    });
    setEditingVideo(video);
    setVideoInputMode(isEmbed ? "embed" : "upload");
    setEmbedInfo(embed);
    setIsFormOpen(true);
  };

  const handleThumbnailUpload = async (file: File) => {
    setUploadProgress((prev) => ({ ...prev, thumbnail: true }));
    toast.info("Mengupload thumbnail ke Cloudinary...");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "thumbnail");

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (data.error) {
        toast.error(data.error);
        return;
      }

      if (data.url) {
        setForm((prev) => ({ ...prev, thumbnailUrl: data.url, thumbnailFile: file }));
        toast.success("Thumbnail berhasil diupload ke Cloudinary");
      }
    } catch {
      toast.error("Gagal upload thumbnail ke Cloudinary");
    } finally {
      setUploadProgress((prev) => ({ ...prev, thumbnail: false }));
    }
  };

  const handleVideoUpload = async (file: File) => {
    setUploadProgress((prev) => ({ ...prev, video: true, percent: 0 }));
    setDetectingDuration(true);
    toast.info("Mengupload video ke Cloudinary...");

    try {
      // Client-side duration detection as fallback
      const clientDuration = await detectVideoDuration(file);
      if (clientDuration) {
        setForm((prev) => ({ ...prev, duration: clientDuration }));
      }

      // ── Direct client-to-Cloudinary upload (bypasses server timeout) ──
      // Fetch Cloudinary config
      const configRes = await fetch("/api/cloudinary-config");
      const config = await configRes.json();

      if (config.error) {
        throw new Error("Cloudinary belum dikonfigurasi");
      }

      const resourceType = "video";
      const cloudUploadUrl = `${config.uploadUrl}/${resourceType}/upload`;

      const result = await new Promise<{
        secure_url: string;
        duration?: number;
        public_id: string;
        format?: string;
        error?: { message?: string };
      }>((resolve, reject) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", config.uploadPreset);
        formData.append("folder", "pekob/videos");
        formData.append("resource_type", resourceType);

        const xhr = new XMLHttpRequest();

        // Track REAL upload progress to Cloudinary (not just to server)
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100);
            setUploadProgress((prev) => ({ ...prev, percent: pct }));
          }
        });

        xhr.addEventListener("load", () => {
          try {
            const data = JSON.parse(xhr.responseText);
            if (data.error) {
              reject(new Error(data.error.message || "Cloudinary upload gagal"));
            } else {
              resolve(data);
            }
          } catch {
            reject(new Error("Gagal memproses respons Cloudinary"));
          }
        });

        xhr.addEventListener("error", () => reject(new Error("Gagal upload video ke Cloudinary")));
        xhr.addEventListener("timeout", () => reject(new Error("Upload timeout — file terlalu besar atau koneksi lambat")));
        xhr.timeout = 600000; // 10 minute timeout for large videos
        xhr.open("POST", cloudUploadUrl);
        xhr.send(formData);
      });

      if (result.secure_url) {
        // Use Cloudinary duration if available, otherwise keep client-detected
        if (result.duration && !clientDuration) {
          const h = Math.floor(result.duration / 3600);
          const m = Math.floor((result.duration % 3600) / 60);
          const s = result.duration % 60;
          const durStr = h > 0
            ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
            : `${m}:${String(s).padStart(2, "0")}`;
          setForm((prev) => ({ ...prev, duration: durStr }));
        }
        setForm((prev) => ({ ...prev, videoUrl: result.secure_url, videoFile: file }));
        toast.success("Video berhasil diupload ke Cloudinary");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal upload video ke Cloudinary");
    } finally {
      setUploadProgress((prev) => ({ ...prev, video: false, percent: 0 }));
      setDetectingDuration(false);
    }
  };

  // Handle embed URL input change — also detect raw <iframe src="..."> paste
  const handleEmbedUrlChange = (raw: string) => {
    let url = raw.trim();

    // If user pasted raw <iframe src="URL" ...>, extract the URL
    const iframeMatch = url.match(/<iframe[^>]+src=["']([^"']+)["'][^>]*>/i);
    if (iframeMatch) {
      url = iframeMatch[1];
    }

    setForm((prev) => ({ ...prev, embedUrl: url }));
    const info = detectEmbedUrl(url);
    setEmbedInfo(info);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      // If upload mode: upload files first
      if (videoInputMode === "upload") {
        if (form.thumbnailFile) {
          await handleThumbnailUpload(form.thumbnailFile);
        }
        if (form.videoFile) {
          await handleVideoUpload(form.videoFile);
        }
      }

      // Build the payload
      let finalVideoUrl = form.videoUrl;
      let finalVideoSource = "upload";

      if (videoInputMode === "embed" && form.embedUrl) {
        // Convert share URL to embed URL for storage
        let embedSrc = form.embedUrl;
        if (embedInfo && embedInfo.embedUrl) {
          embedSrc = embedInfo.embedUrl;
        }
        finalVideoUrl = embedSrc;
        finalVideoSource = "embed";

        // Auto-generate thumbnail from embed if no thumbnail set
        if (!form.thumbnailUrl) {
          const ytMatch = form.embedUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
          if (ytMatch) {
            setForm((prev) => ({
              ...prev,
              thumbnailUrl: `https://img.youtube.com/vi/${ytMatch[1]}/maxresdefault.jpg`,
            }));
          }
        }
      }

      const payload = {
        title: form.title,
        description: form.description,
        category: form.category,
        videoUrl: finalVideoUrl,
        videoSource: finalVideoSource,
        thumbnailUrl: form.thumbnailUrl || null,
        duration: form.duration,
        isFeatured: form.isFeatured,
      };

      if (editingVideo) {
        const res = await fetch(`/api/videos/${editingVideo.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          toast.success("Video berhasil diperbarui");
          setIsFormOpen(false);
          fetchVideos();
        } else {
          const err = await res.json();
          toast.error(err.error || "Gagal memperbarui video");
        }
      } else {
        const res = await fetch("/api/videos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          toast.success("Video berhasil ditambahkan");
          setIsFormOpen(false);
          resetForm();
          fetchVideos();
        } else {
          const err = await res.json();
          toast.error(err.error || "Gagal menambahkan video");
        }
      }
    } catch {
      toast.error("Gagal menyimpan video");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus video ini?")) return;
    try {
      const res = await fetch(`/api/videos/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Video berhasil dihapus");
        fetchVideos();
      }
    } catch {
      toast.error("Gagal menghapus video");
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/admin/login");
  };

  const filteredVideos = videos.filter(
    (v) =>
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Determine if the submit button should be disabled
  const isSubmitDisabled = isUploading || !form.title || !form.category || (
    videoInputMode === "upload" ? !form.videoUrl : !form.embedUrl
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Kembali ke Beranda
            </Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center">
                <Tv className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-black tracking-tighter bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent hidden sm:block">
                PEKOB
              </span>
            </div>
            <Badge variant="outline" className="border-red-500/30 text-red-400 text-xs">
              <ShieldCheck className="w-3 h-3 mr-1" />
              Admin
            </Badge>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-red-400 hover:bg-red-500/10 border border-white/5 hover:border-red-500/20 transition-all duration-200"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Stats Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Kelola Video</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {videos.length} video tersedia &middot; {existingCategories.length} kategori
            </p>
          </div>
          <Button
            onClick={openCreate}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold gap-2 self-start"
          >
            <Plus className="w-4 h-4" />
            Tambah Video
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari video..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground focus:border-red-500/50"
          />
        </div>

        {/* Video Table/List */}
        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-3 bg-white/5 rounded-xl"
              >
                <Skeleton className="w-32 h-20 rounded-lg bg-white/10" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48 bg-white/10" />
                  <Skeleton className="h-3 w-32 bg-white/10" />
                </div>
              </div>
            ))
          ) : filteredVideos.length > 0 ? (
            <AnimatePresence>
              {filteredVideos.map((video, index) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.03 }}
                  className="group flex items-center gap-4 p-3 bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 rounded-xl transition-all duration-200"
                >
                  {/* Thumbnail */}
                  <div className="relative w-28 sm:w-36 aspect-video rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
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
                    {video.isFeatured && (
                      <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-red-600 rounded text-[9px] font-bold uppercase">
                        Featured
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-white line-clamp-1">
                      {video.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {video.category || "Tanpa kategori"}
                      </Badge>
                      {video.videoSource === "embed" && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-orange-500/30 text-orange-400">
                          <Globe className="w-2.5 h-2.5 mr-0.5" />
                          Embed
                        </Badge>
                      )}
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
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => openEdit(video)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(video.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Film className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground text-sm">
                {searchQuery
                  ? "Tidak ada video yang cocok"
                  : "Belum ada video. Tambahkan video pertama!"}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Upload/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={(open) => !open && setIsFormOpen(false)}>
        <DialogContent className="max-w-lg bg-[#111] border-white/10 text-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {editingVideo ? "Edit Video" : "Tambah Video Baru"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Judul Video *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Masukkan judul video..."
                className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Deskripsi singkat video..."
                rows={3}
                className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground resize-none"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">
                <span className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  Kategori *
                </span>
              </Label>
              <Input
                id="category"
                list="category-suggestions"
                value={form.category}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, category: e.target.value }))
                }
                placeholder="Ketik kategori baru atau pilih yang ada..."
                className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground"
                required
              />
              {existingCategories.length > 0 && (
                <datalist id="category-suggestions">
                  {existingCategories.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              )}
              <p className="text-xs text-muted-foreground">
                Ketik kategori bebas, contoh: Film, Musik, Komedi, Gaming, dll.
              </p>
            </div>

            {/* ── Video Source Tabs: Upload File vs Embed URL ── */}
            <div className="space-y-3">
              <Label>Sumber Video *</Label>
              {/* Tab buttons */}
              <div className="flex gap-1 p-1 bg-white/5 rounded-lg">
                <button
                  type="button"
                  onClick={() => {
                    setVideoInputMode("upload");
                    setEmbedInfo(null);
                  }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-medium transition-all duration-200 ${
                    videoInputMode === "upload"
                      ? "bg-red-600 text-white shadow-sm"
                      : "text-muted-foreground hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setVideoInputMode("embed");
                  }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-medium transition-all duration-200 ${
                    videoInputMode === "embed"
                      ? "bg-orange-500 text-white shadow-sm"
                      : "text-muted-foreground hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Link2 className="w-3.5 h-3.5" />
                  Embed URL
                </button>
              </div>

              {/* ── UPLOAD FILE TAB ── */}
              {videoInputMode === "upload" && (
                <div className="space-y-2">
                  {/* Video upload area with drag & drop */}
                  <div
                    className={`relative border-2 border-dashed rounded-lg transition-all duration-200 ${
                      videoDragOver
                        ? "border-red-500 bg-red-500/10"
                        : form.videoUrl && form.videoFile
                        ? "border-green-500/30 bg-green-500/5"
                        : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
                    }`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setVideoDragOver(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setVideoDragOver(false);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setVideoDragOver(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) {
                        // Accept video files even if MIME type is empty (mobile compatibility)
                        const ext = file.name.split(".").pop()?.toLowerCase() || "";
                        const videoExts = ["mp4","m4v","3gp","3g2","webm","mov","avi","mkv","wmv","flv","mpeg","mpg","ts","mts","m2ts","ogv","f4v","dv"];
                        if (file.type.startsWith("video/") || videoExts.includes(ext)) {
                          handleVideoUpload(file);
                        } else {
                          toast.error("File harus berupa video (MP4, MOV, AVI, MKV, dll.)");
                        }
                      }
                    }}
                  >
                    <label className="block cursor-pointer">
                      <div className="flex flex-col items-center justify-center gap-2 px-4 py-5">
                        {uploadProgress.video ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin text-red-400" />
                            <div className="w-full max-w-xs">
                              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                <span>Mengupload {form.videoFile?.name}...</span>
                                <span>{uploadProgress.percent}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                  className="h-full bg-gradient-to-r from-red-600 to-orange-500 rounded-full"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${uploadProgress.percent}%` }}
                                  transition={{ duration: 0.3 }}
                                />
                              </div>
                            </div>
                          </>
                        ) : form.videoUrl && form.videoFile ? (
                          <>
                            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                              <Film className="w-4 h-4 text-green-400" />
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-green-400 font-medium">{form.videoFile.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(form.videoFile.size / (1024 * 1024)).toFixed(1)} MB
                              </p>
                            </div>
                            <p className="text-xs text-muted-foreground/60">Klik atau seret untuk ganti file</p>
                          </>
                        ) : (
                          <>
                            <Upload className="w-5 h-5 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">
                              Seret video ke sini atau klik untuk memilih file
                            </p>
                            <p className="text-[10px] text-muted-foreground/50">
                              Semua format video — MP4, MOV, AVI, MKV, WMV, FLV, WebM, 3GP, MPEG, TS, dll. — maks 100MB
                            </p>
                          </>
                        )}
                      </div>
                      <input
                        ref={videoFileInputRef}
                        type="file"
                        accept="video/*,.mp4,.mov,.avi,.mkv,.wmv,.flv,.webm,.3gp,.3g2,.m4v,.mpeg,.mpg,.ts,.mts,.m2ts,.ogv,.f4v,.dv"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleVideoUpload(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                  <p className="text-[10px] text-muted-foreground/40">
                    ⚡ Upload dari ponsel didukung — semua format video otomatis dikonversi Cloudinary
                  </p>
                </div>
              )}

              {/* ── EMBED URL TAB ── */}
              {videoInputMode === "embed" && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="embedUrl" className="text-xs">URL Video / Embed</Label>
                    <Input
                      id="embedUrl"
                      value={form.embedUrl}
                      onChange={(e) => handleEmbedUrlChange(e.target.value)}
                      placeholder='Paste URL YouTube, Vimeo, dll. — atau paste langsung <iframe src="...">'
                      className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground text-sm"
                    />
                  </div>

                  {/* Embed provider detection */}
                  {embedInfo && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span className="text-xs text-green-400">
                          Terdeteksi: <strong>{embedInfo.provider}</strong>
                        </span>
                      </div>
                      {/* Show the actual iframe src URL that will be used */}
                      <div className="px-3 py-2 bg-white/[0.03] border border-white/5 rounded-lg">
                        <p className="text-[10px] text-muted-foreground mb-1 font-medium">
                          iframe src yang akan digunakan:
                        </p>
                        <code className="block text-[10px] text-orange-400 break-all leading-relaxed">
                          {embedInfo.embedUrl}
                        </code>
                      </div>
                    </div>
                  )}

                  {/* Unsupported URL warning */}
                  {form.embedUrl && isValidUrl(form.embedUrl) && !embedInfo && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <Globe className="w-4 h-4 text-yellow-400" />
                      <span className="text-xs text-yellow-400">
                        URL tidak dikenali. Video akan dicoba langsung dimuat sebagai iframe.
                      </span>
                    </div>
                  )}

                  {/* Invalid URL warning */}
                  {form.embedUrl && !isValidUrl(form.embedUrl) && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <X className="w-4 h-4 text-red-400" />
                      <span className="text-xs text-red-400">
                        URL tidak valid. Pastikan URL dimulai dengan https://
                      </span>
                    </div>
                  )}

                  {/* Supported providers info */}
                  <div className="px-3 py-2 bg-white/[0.03] border border-white/5 rounded-lg">
                    <p className="text-[10px] text-muted-foreground mb-1.5 font-medium">Platform yang didukung:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {["YouTube", "Vimeo", "Dailymotion", "TikTok", "Facebook", "Instagram"].map((p) => (
                        <Badge key={p} variant="outline" className="text-[9px] px-1.5 py-0 border-white/10 text-muted-foreground">
                          {p}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Thumbnail Upload */}
            <div className="space-y-2">
              <Label>Thumbnail {(videoInputMode === "embed" && embedInfo?.provider === "YouTube") ? "(otomatis dari YouTube)" : "(opsional)"}</Label>
              <div className="flex items-center gap-3">
                {form.thumbnailUrl ? (
                  <div className="relative w-24 h-14 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                    <img
                      src={form.thumbnailUrl}
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          thumbnailUrl: "",
                          thumbnailFile: null,
                        }))
                      }
                      className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/80 flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : null}
                {/* Thumbnail upload with drag & drop */}
                <div
                  className={`border-2 border-dashed rounded-lg transition-all duration-200 ${
                    thumbDragOver
                      ? "border-red-500 bg-red-500/10"
                      : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setThumbDragOver(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setThumbDragOver(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setThumbDragOver(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file && file.type.startsWith("image/")) {
                      setForm((prev) => ({ ...prev, thumbnailFile: file }));
                    } else {
                      toast.error("File harus berupa gambar");
                    }
                  }}
                >
                  <label className="block cursor-pointer">
                    <div className="flex items-center justify-center gap-2 px-4 py-3">
                      {uploadProgress.thumbnail ? (
                        <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                      ) : (
                        <ImageIcon className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className="text-xs text-muted-foreground">
                        {form.thumbnailUrl ? "Ganti thumbnail" : "Upload thumbnail ke Cloudinary"}
                      </span>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.jpg,.jpeg,.png,.gif,.webp,.bmp,.tiff,.avif,.svg"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setForm((prev) => ({ ...prev, thumbnailFile: file }));
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Duration indicator */}
            {form.duration && videoInputMode === "upload" && (
              <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                <Clock className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-400">
                  Durasi terdeteksi otomatis: {form.duration}
                </span>
              </div>
            )}

            {/* Featured Toggle */}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <Label>Jadikan Video Unggulan (Featured)</Label>
              </div>
              <Switch
                checked={form.isFeatured}
                onCheckedChange={(checked) =>
                  setForm((prev) => ({ ...prev, isFeatured: checked }))
                }
              />
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsFormOpen(false)}
                className="text-muted-foreground hover:text-white"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmitDisabled}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold gap-2"
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                {editingVideo ? "Perbarui Video" : "Simpan Video"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminPage() {
  return (
    <AdminAuthGuard>
      <AdminDashboard />
    </AdminAuthGuard>
  );
}
