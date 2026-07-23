import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string | null; // "thumbnail" or "video"

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
    }

    if (!type || !["thumbnail", "video"].includes(type)) {
      return NextResponse.json(
        { error: "Tipe upload harus 'thumbnail' atau 'video'" },
        { status: 400 }
      );
    }

    // Validate Cloudinary config
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json(
        { error: "Cloudinary belum dikonfigurasi. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, dan CLOUDINARY_API_SECRET di environment variables." },
        { status: 500 }
      );
    }

    // Validate file size (Cloudinary free: 100MB for video, 10MB for image)
    const maxSize = type === "video" ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `Ukuran file melebihi batas (${type === "video" ? "100MB" : "10MB"})` },
        { status: 400 }
      );
    }

    // Convert File to buffer for Cloudinary upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique public_id with folder
    const folder = type === "video" ? "pekob/videos" : "pekob/thumbnails";
    const publicId = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const resourceType = type === "video" ? "video" : "image";

    // Upload to Cloudinary using upload_stream (works for both image and video with buffers)
    const uploadResult = await new Promise<{ secure_url: string; public_id: string; duration?: number; width?: number; height?: number; format?: string }>(
      (resolve, reject) => {
        const uploadOptions: Record<string, unknown> = {
          resource_type: resourceType,
          public_id: publicId,
        };

        // Add chunk_size for video uploads (6MB chunks)
        if (type === "video") {
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
      }
    );

    // For video: extract duration from Cloudinary response
    let duration: number | undefined;
    if (type === "video" && uploadResult.duration) {
      duration = Math.round(uploadResult.duration);
    }

    return NextResponse.json({
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      name: file.name,
      size: buffer.length,
      duration,
      format: uploadResult.format,
    });
  } catch (error) {
    console.error("[Cloudinary] Upload error:", error);
    const message = error instanceof Error ? error.message : "Gagal mengupload file ke Cloudinary";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
