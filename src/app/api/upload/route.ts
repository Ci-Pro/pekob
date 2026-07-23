import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

// Extend serverless function timeout to 120s for Cloudinary processing
export const maxDuration = 120;

// Supported video extensions (used when MIME type is empty/unrecognized — common on mobile)
const VIDEO_EXTENSIONS = new Set([
  "mp4", "m4v", "3gp", "3g2", "webm", "mov", "avi", "mkv", "wmv",
  "flv", "mpeg", "mpg", "ts", "mts", "m2ts", "ogv", "f4v", "dv",
  "hevc", "h265", "h264", "prores",
]);

// Supported image extensions
const IMAGE_EXTENSIONS = new Set([
  "jpg", "jpeg", "png", "gif", "webp", "bmp", "tiff", "tif", "avif", "svg",
]);

const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;  // 10MB

function getFileExtension(filename: string): string {
  return (filename.split(".").pop() || "").toLowerCase();
}

function isVideoFile(file: File): boolean {
  // 1. Check MIME type starts with "video/"
  if (file.type && file.type.startsWith("video/")) return true;

  // 2. Check well-known non-video/* MIME types that are actually video
  const EXTRA_VIDEO_MIMES = [
    "application/x-mpeg",
    "application/octet-stream",
    "application/mp4",
    "application/x-shockwave-flash",
  ];
  if (file.type && EXTRA_VIDEO_MIMES.includes(file.type)) return true;

  // 3. Fallback: check file extension (critical for mobile where file.type is often empty "")
  const ext = getFileExtension(file.name);
  return VIDEO_EXTENSIONS.has(ext);
}

function isImageFile(file: File): boolean {
  if (file.type && file.type.startsWith("image/")) return true;
  const ext = getFileExtension(file.name);
  return IMAGE_EXTENSIONS.has(ext);
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

    // Validate file type — robust check that works on mobile
    if (type === "video") {
      if (!isVideoFile(file)) {
        const ext = getFileExtension(file.name);
        return NextResponse.json(
          {
            error: `Format file "${file.type || ext || "unknown"}" tidak didukung sebagai video. Gunakan: MP4, MOV, AVI, MKV, WMV, FLV, WebM, 3GP, MPEG, TS, M4V, OGG, dll.`,
          },
          { status: 400 }
        );
      }
    } else {
      if (!isImageFile(file)) {
        return NextResponse.json(
          {
            error: `Format file "${file.type || getFileExtension(file.name) || "unknown"}" tidak didukung sebagai gambar. Gunakan: JPEG, PNG, GIF, WebP, BMP, TIFF, AVIF, atau SVG.`,
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
    // upload_stream handles chunking internally and supports all video formats
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
      };

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

      // Write buffer to stream
      uploadStream.write(buffer);
      uploadStream.end();
    });

    // Extract duration from Cloudinary response
    let duration: number | undefined;
    if (type === "video" && uploadResult.duration) {
      duration = Math.round(uploadResult.duration);
    }

    return NextResponse.json({
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      name: file.name,
      originalType: file.type,
      size: buffer.length,
      format: uploadResult.format,
      duration,
      resourceType: uploadResult.resource_type,
    });
  } catch (error) {
    console.error("[Upload] Error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Gagal mengupload file ke Cloudinary";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
