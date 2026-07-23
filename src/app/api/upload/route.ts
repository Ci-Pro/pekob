import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

// Supported video MIME types — covers virtually all common formats
const SUPPORTED_VIDEO_TYPES = [
  // MP4 variants
  "video/mp4",
  "video/x-m4v",
  "video/3gpp",        // 3GP
  "video/3gpp2",       // 3G2
  // WebM
  "video/webm",
  "video/x-webm",
  // MOV / QuickTime
  "video/quicktime",
  // AVI
  "video/x-msvideo",
  "video/avi",
  // MKV / Matroska
  "video/x-matroska",
  "video/mkv",
  // WMV
  "video/x-ms-wmv",
  "video/x-ms-asf",
  // FLV
  "video/x-flv",
  // MPEG
  "video/mpeg",
  "video/mpg",
  "video/x-mpeg",
  // TS (MPEG Transport Stream)
  "video/mp2t",
  "video/MP2T",
  // OGG
  "video/ogg",
  // F4V
  "video/x-f4v",
  // ProRes / MOV (professional)
  "video/avc",
  "video/H264",
  "video/H265",
  // DV
  "video/dv",
  // SWF (legacy)
  "application/x-shockwave-flash",
];

// Supported image MIME types for thumbnails
const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/bmp",
  "image/tiff",
  "image/svg+xml",
  "image/avif",
];

const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;  // 10MB

function isVideoSupported(mimeType: string): boolean {
  return SUPPORTED_VIDEO_TYPES.some((t) =>
    mimeType.toLowerCase().includes(t.split("/")[1]?.toLowerCase() || "")
  );
}

function isImageSupported(mimeType: string): boolean {
  return SUPPORTED_IMAGE_TYPES.includes(mimeType);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string | null; // "thumbnail" or "video"

    if (!file) {
      return NextResponse.json(
        { error: "File tidak ditemukan" },
        { status: 400 }
      );
    }

    if (!type || !["thumbnail", "video"].includes(type)) {
      return NextResponse.json(
        { error: "Tipe upload harus 'thumbnail' atau 'video'" },
        { status: 400 }
      );
    }

    // Validate Cloudinary config
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return NextResponse.json(
        {
          error:
            "Cloudinary belum dikonfigurasi. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, dan CLOUDINARY_API_SECRET di environment variables.",
        },
        { status: 500 }
      );
    }

    // Validate MIME type
    if (type === "video") {
      if (!isVideoSupported(file.type) && !file.name.match(/\.(mp4|mov|avi|mkv|wmv|flv|webm|3gp|3g2|m4v|mpeg|mpg|ts|mts|m2ts|ogv|f4v|dv|prores|hevc|h265|h264)$/i)) {
        return NextResponse.json(
          {
            error: `Format video "${file.type || file.name.split(".").pop()}" tidak didukung. Format yang didukung: MP4, MOV, AVI, MKV, WMV, FLV, WebM, 3GP, MPEG, TS, M4V, OGG, DV, dan lainnya.`,
          },
          { status: 400 }
        );
      }
    } else {
      if (!isImageSupported(file.type)) {
        return NextResponse.json(
          {
            error: `Format gambar "${file.type || file.name.split(".").pop()}" tidak didukung. Gunakan: JPEG, PNG, GIF, WebP, BMP, TIFF, AVIF, atau SVG.`,
          },
          { status: 400 }
        );
      }
    }

    // Validate file size
    const maxSize = type === "video" ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: `Ukuran file melebihi batas (${type === "video" ? "100MB" : "10MB"})`,
        },
        { status: 400 }
      );
    }

    // Convert File to buffer for Cloudinary upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique public_id with folder
    const folder =
      type === "video" ? "pekob/videos" : "pekob/thumbnails";
    const publicId = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const resourceType = type === "video" ? "video" : "image";

    // Upload to Cloudinary using upload_stream
    const uploadResult = await new Promise<{
      secure_url: string;
      public_id: string;
      duration?: number;
      width?: number;
      height?: number;
      format?: string;
      resource_type?: string;
    }>((resolve, reject) => {
      const uploadOptions: Record<string, unknown> = {
        resource_type: resourceType,
        public_id: publicId,
        // Let Cloudinary auto-detect format from file content
        // This ensures ALL video formats get properly processed
      };

      // Add chunk_size for large video uploads (6MB chunks)
      if (type === "video" && buffer.length > 6_000_000) {
        uploadOptions.chunk_size = 6_000_000;
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error("[Cloudinary] Upload failed:", error.message || error);
            reject(error);
          } else {
            resolve(result!);
          }
        }
      );

      uploadStream.on("error", (err: Error) => {
        console.error("[Cloudinary] Stream error:", err.message);
        reject(err);
      });

      uploadStream.end(buffer);
    });

    // Extract duration from Cloudinary response
    let duration: number | undefined;
    if (type === "video" && uploadResult.duration) {
      duration = Math.round(uploadResult.duration);
    }

    // For videos, construct a universal playback URL
    // Cloudinary auto-converts to web-playable format (mp4/webm)
    let playbackUrl = uploadResult.secure_url;

    return NextResponse.json({
      url: playbackUrl,
      publicId: uploadResult.public_id,
      name: file.name,
      originalType: file.type,
      size: buffer.length,
      format: uploadResult.format,
      duration,
      resourceType: uploadResult.resource_type,
    });
  } catch (error) {
    console.error("[Cloudinary] Upload error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Gagal mengupload file ke Cloudinary";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
