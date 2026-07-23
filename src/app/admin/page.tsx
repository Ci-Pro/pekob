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

type EmbedInfo = { provider: string; id: string; embedUrl: string; thumbnailUrl?: string } | null;

function detectEmbedUrl(url: string): EmbedInfo {
  if (!url) return null;
  for (const provider of EMBED_PROVIDERS) {
    const match = url.match(provider.pattern);
    if (match && match[1]) {
      return {
        provider: provider.name,
        id: match[1],
        embedUrl: provider.embedUrl(match[1]),
        thumbnailUrl: generateAutoThumbnail(url, "embed"),
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

// Generate auto-thumbnail URL from video/embed URL
function generateAutoThumbnail(url: string, videoSource: string): string | null {
  if (!url) return null;

  if (videoSource === "upload") {
    // Cloudinary video: extract public_id and generate video thumbnail (first frame)
    // Pattern: https://res.cloudinary.com/{cloud}/video/upload/v{timestamp}/{folder}/{filename}.ext
    try {
      const cloudMatch = url.match(/res\.cloudinary\.com\/([^/]+)\/video\/upload\/(?:v\d+\/)(.+)\.\w+$/);
      if (cloudMatch) {
        // so_0 = start offset 0 seconds (first frame), c_fill = crop to fit, q_auto = auto quality
        return `https://res.cloudinary.com/${cloudMatch[1]}/video/upload/so_0,w_640,h_360,c_fill,q_auto/${cloudMatch[2]}.jpg`;
      }
    } catch { /* fallback */ }
    return null;
  }

  // YouTube — works with both share URLs and embed URLs
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;

  // Vimeo
  const vimeoMatch = url.match(/(?:player\.vimeo\.com\/video\/|vimeo\.com\/(?:video\/)?)(\d+)/);
  if (vimeoMatch) return `https://vumbnail.com/${vimeoMatch[1]}.jpg`;

  // Dailymotion
  const dmMatch = url.match(/dailymotion\.com\/(?:embed\/)?video\/([a-zA-Z0-9]+)/);
  if (dmMatch) return `https://www.dailymotion.com/thumbnail/video/${dmMatch[1]}`;

  // TikTok
  const ttMatch = url.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/);
  if (ttMatch) return null; // TikTok doesn't have a public thumbnail API

  // For unknown platforms, no auto-thumbnail available
  return null;
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
  const [uploadProgress, setUploadProgress] = useState({ thumbnail: false, thumbPercent: 0, video: false, percent: 0 });
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
    videoFileName: "" as string,   // Keep filename after upload for display
    videoFileSize: 0 as number,   // Keep filesize after upload for display
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
      videoFileName: "",
      videoFileSize: 0,
      duration: null,
      isFeatured: false,
    });
    setEditingVideo(null);
    setUploadProgress({ thumbnail: false, thumbPercent: 0, video: false, percent: 0 });
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
      videoFileName: "",
      videoFileSize: 0,
      duration: video.duration || null,
      isFeatured: video.isFeatured,
    });
    setEditingVideo(video);
    setVideoInputMode(isEmbed ? "embed" : "upload");
    setEmbedInfo(embed);
    setIsFormOpen(true);
  };

  // Upload thumbnail to Cloudinary via direct client-to-Cloudinary (bypasses server timeout)
  const handleThumbnailUpload = async (file: File): Promise<string | null> => {
    setUploadProgress((prev) => ({ ...prev, thumbnail: true, thumbPercent: 0 }));
    toast.info("Mengupload thumbnail ke Cloudinary...");
    try {
      // Validate image file (client-side)
      const validExts = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "tiff", "tif", "avif", "svg"];
      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      const isImage = file.type.startsWith("image/") || validExts.includes(ext);
      if (!isImage) {
        toast.error(`Format file "${file.type || ext || "unknown"}" tidak didukung. Gunakan: JPEG, PNG, GIF, WebP, BMP, TIFF, AVIF, SVG.`);
        return null;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Ukuran thumbnail melebihi 10MB");
        return null;
      }

      // Fetch Cloudinary config
      const configRes = await fetch("/api/cloudinary-config");
      const config = await configRes.json();
      if (config.error) throw new Error("Cloudinary belum dikonfigurasi");

      console.log("[Thumbnail] Starting upload:", file.name, file.size, "type:", file.type);
      console.log("[Thumbnail] Config:", { cloudName: config.cloudName, preset: config.uploadPreset });

      // Use /image/upload with explicit resource_type — same pattern as video upload
      const cloudUploadUrl = `${config.uploadUrl}/image/upload`;

      const result = await new Promise<{
        secure_url: string;
        public_id: string;
        format?: string;
        resource_type?: string;
        error?: { message?: string };
      }>((resolve, reject) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", config.uploadPreset);
        formData.append("folder", "pekob/thumbnails");
        formData.append("resource_type", "image");

        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100);
            setUploadProgress((prev) => ({ ...prev, thumbPercent: pct }));
          }
        });
        xhr.addEventListener("load", () => {
          try {
            console.log("[Thumbnail] XHR status:", xhr.status);
            const data = JSON.parse(xhr.responseText);
            console.log("[Thumbnail] Response:", JSON.stringify(data).substring(0, 300));
            if (data.error) {
              reject(new Error(data.error.message || "Cloudinary upload gagal"));
            } else {
              resolve(data);
            }
          } catch (parseErr) {
            console.error("[Thumbnail] Parse error:", parseErr);
            console.error("[Thumbnail] Raw response:", xhr.responseText);
            reject(new Error("Gagal memproses respons Cloudinary"));
          }
        });
        xhr.addEventListener("error", () => {
          console.error("[Thumbnail] XHR network error");
          reject(new Error("Gagal upload thumbnail ke Cloudinary (network error)"));
        });
        xhr.addEventListener("timeout", () => {
          console.error("[Thumbnail] XHR timeout after 300s");
          reject(new Error("Upload timeout — coba lagi dengan koneksi lebih stabil"));
        });
        xhr.timeout = 300000; // 5 minutes — enough for slow connections
        xhr.open("POST", cloudUploadUrl);
        xhr.send(formData);
      });

      if (result.secure_url) {
        console.log("[Thumbnail] Upload success:", result.secure_url);
        setForm((prev) => ({ ...prev, thumbnailUrl: result.secure_url, thumbnailFile: null }));
        toast.success("Thumbnail berhasil diupload ke Cloudinary");
        return result.secure_url;
      } else {
        console.error("[Thumbnail] No secure_url in result:", result);
      }
    } catch (err) {
      console.error("[Thumbnail] Upload error:", err);
      toast.error(err instanceof Error ? err.message : "Gagal upload thumbnail ke Cloudinary");
    } finally {
      setUploadProgress((prev) => ({ ...prev, thumbnail: false, thumbPercent: 0 }));
    }
    return null;
  };

  // Called when user selects a thumbnail file — uploads immediately + shows preview
  const handleThumbnailSelect = async (file: File) => {
    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setForm((prev) => ({ ...prev, thumbnailUrl: localUrl, thumbnailFile: file }));
    // Upload to Cloudinary in background
    const cloudUrl = await handleThumbnailUpload(file);
    if (cloudUrl) {
      // Replace local preview with Cloudinary URL
      setForm((prev) => ({ ...prev, thumbnailUrl: cloudUrl, thumbnailFile: null }));
    }
    // If upload failed, keep the local preview (still saved as data URL on submit)
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
        // Auto-generate thumbnail from Cloudinary video URL
        const autoThumb = generateAutoThumbnail(result.secure_url, "upload");
        setForm((prev) => ({
          ...prev,
          videoUrl: result.secure_url,
          videoFile: null, // Clear file ref — video already uploaded to Cloudinary
          videoFileName: file.name,   // Keep name for display
          videoFileSize: file.size,   // Keep size for display
          ...(autoThumb && !prev.thumbnailUrl ? { thumbnailUrl: autoThumb } : {}),
        }));
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
      // Upload files first (works for BOTH upload and embed modes)
      let thumbUploadResult: string | null = null;

      if (videoInputMode === "upload" && form.videoFile) {
        await handleVideoUpload(form.videoFile);
      }
      // Upload pending thumbnail file (if user just selected and upload hasn't completed yet)
      if (form.thumbnailFile) {
        thumbUploadResult = await handleThumbnailUpload(form.thumbnailFile);
      }

      // Build the payload
      let finalVideoUrl = form.videoUrl;
      let finalVideoSource = "upload";
      // Use thumbnail from: explicit upload result > form state (already uploaded by handleThumbnailSelect) > null
      let finalThumbnailUrl = thumbUploadResult || (form.thumbnailUrl && !form.thumbnailUrl.startsWith("blob:") ? form.thumbnailUrl : null);

      if (videoInputMode === "embed" && form.embedUrl) {
        // Convert share URL to embed URL for storage
        // If known provider → use provider embed URL
        // If unknown → use the URL as-is (free embed)
        let embedSrc = form.embedUrl;
        if (embedInfo && embedInfo.embedUrl) {
          embedSrc = embedInfo.embedUrl;
        }
        finalVideoUrl = embedSrc;
        finalVideoSource = "embed";

        // Auto-generate thumbnail from embed if no thumbnail uploaded
        if (!finalThumbnailUrl) {
          const autoThumb = embedInfo?.thumbnailUrl || generateAutoThumbnail(form.embedUrl, "embed");
          if (autoThumb) {
            finalThumbnailUrl = autoThumb;
          }
        }
      }

      // Auto-generate thumbnail from uploaded video if no thumbnail set
      if (videoInputMode === "upload" && !finalThumbnailUrl && form.videoUrl) {
        const autoThumb = generateAutoThumbnail(form.videoUrl, "upload");
        if (autoThumb) {
          finalThumbnailUrl = autoThumb;
        }
      }

      const payload = {
        title: form.title,
        description: form.description,
        category: form.category,
        videoUrl: finalVideoUrl,
        videoSource: finalVideoSource,
        thumbnailUrl: finalThumbnailUrl,
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
                    {(() => {
                      const thumb = video.thumbnailUrl || generateAutoThumbnail(video.videoUrl, video.videoSource);
                      return thumb ? (
                        <img
                          src={thumb}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-red-900/40 via-orange-900/30 to-black flex items-center justify-center">
                          <Film className="w-5 h-5 text-white/20" />
                        </div>
                      );
                    })()}
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
                        : form.videoUrl
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
                                <span>Mengupload {form.videoFileName || form.videoFile?.name}...</span>
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
                        ) : form.videoUrl ? (
                          <>
                            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                              <Film className="w-4 h-4 text-green-400" />
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-green-400 font-medium">{form.videoFileName || "Video"}</p>
                              <p className="text-xs text-muted-foreground">
                                {form.videoFileSize > 0 ? `${(form.videoFileSize / (1024 * 1024)).toFixed(1)} MB` : "Sudah diupload"}
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
                      placeholder='Paste URL video atau paste langsung <iframe src="..."> — semua platform didukung'
                      className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground text-sm"
                    />
                  </div>

                  {/* Embed provider detection */}
                  {embedInfo && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span className="text-xs text-green-400">
                          Terdeteksi: <strong>{embedInfo.provider}</strong> — auto-convert ke embed URL
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

                  {/* Free embed: any valid URL works */}
                  {form.embedUrl && isValidUrl(form.embedUrl) && !embedInfo && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <Globe className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span className="text-xs text-green-400">
                          URL valid — akan langsung digunakan sebagai iframe src
                        </span>
                      </div>
                      <div className="px-3 py-2 bg-white/[0.03] border border-white/5 rounded-lg">
                        <p className="text-[10px] text-muted-foreground mb-1 font-medium">
                          iframe src yang akan digunakan:
                        </p>
                        <code className="block text-[10px] text-orange-400 break-all leading-relaxed">
                          {form.embedUrl}
                        </code>
                      </div>
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

                  {/* Info box */}
                  <div className="px-3 py-2 bg-white/[0.03] border border-white/5 rounded-lg">
                    <p className="text-[10px] text-muted-foreground mb-1.5 font-medium">
                      ✨ Semua platform didukung — paste URL video atau iframe embed
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {["YouTube", "Vimeo", "Dailymotion", "TikTok", "Facebook", "Instagram", "Bilibili", "NicoNico", "Lainnya"].map((p) => (
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
              <Label>Thumbnail (opsional — otomatis dari video/embed jika tidak diupload)</Label>

              {/* Upload progress indicator */}
              {uploadProgress.thumbnail && (
                <div className="flex items-center gap-3 px-3 py-2.5 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <Loader2 className="w-4 h-4 animate-spin text-red-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-red-300 font-medium">Mengupload thumbnail...</span>
                      <span className="text-red-400">{uploadProgress.thumbPercent}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-red-600 to-orange-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress.thumbPercent}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                {form.thumbnailUrl ? (
                  <div className="relative w-24 h-14 rounded-lg overflow-hidden bg-white/5 flex-shrink-0 ring-1 ring-green-500/30">
                    <img
                      src={form.thumbnailUrl}
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0.5 left-0.5 px-1.5 py-0.5 rounded bg-green-500/90 text-[9px] font-bold text-white">
                      ✓
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          thumbnailUrl: "",
                          thumbnailFile: null,
                        }))
                      }
                      className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/80 flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : null}
                {/* Thumbnail upload with drag & drop */}
                <div
                  className={`flex-1 border-2 border-dashed rounded-lg transition-all duration-200 ${
                    uploadProgress.thumbnail
                      ? "border-red-500/30 bg-red-500/5 pointer-events-none"
                      : thumbDragOver
                      ? "border-red-500 bg-red-500/10"
                      : form.thumbnailUrl
                      ? "border-green-500/20 bg-green-500/5"
                      : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!uploadProgress.thumbnail) setThumbDragOver(true);
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
                    if (uploadProgress.thumbnail) return;
                    const file = e.dataTransfer.files?.[0];
                    if (file) {
                      const ext = file.name.split(".").pop()?.toLowerCase() || "";
                      const isImage = file.type.startsWith("image/") || ["jpg","jpeg","png","gif","webp","bmp","tiff","avif","svg"].includes(ext);
                      if (isImage) {
                        handleThumbnailSelect(file);
                      } else {
                        toast.error("File harus berupa gambar (JPEG, PNG, GIF, WebP, dll.)");
                      }
                    }
                  }}
                >
                  <label className={`block cursor-pointer${uploadProgress.thumbnail ? " pointer-events-none" : ""}`}>
                    <div className="flex items-center justify-center gap-2 px-4 py-3">
                      {uploadProgress.thumbnail ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                          <span className="text-xs text-red-300">{uploadProgress.thumbPercent}% — Mengupload...</span>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-4 h-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {form.thumbnailUrl ? "Ganti thumbnail" : "Upload thumbnail ke Cloudinary"}
                          </span>
                        </>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.jpg,.jpeg,.png,.gif,.webp,.bmp,.tiff,.avif,.svg"
                      className="hidden"
                      disabled={uploadProgress.thumbnail}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleThumbnailSelect(file);
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
