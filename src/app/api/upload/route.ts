import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { v2 as cloudinaryV2 } from "cloudinary";

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
        { error: "Cloudinary belum dikonfigurasi." },
        { status: 500 }
      );
    }

    // Validate file size
    const maxSize = type === "video" ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `Ukuran file melebihi batas (${type === "video" ? "100MB" : "10MB"})` },
        { status: 400 }
      );
    }

    // Convert File to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique public_id with folder
    const folder = type === "video" ? "pekob/videos" : "pekob/thumbnails";
    const publicId = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const resourceType = type === "video" ? "video" : "image";

    let uploadResult: {
      secure_url: string;
      public_id: string;
      duration?: number;
      width?: number;
      height?: number;
      format?: string;
    };

    if (type === "video") {
      // Use upload_large for videos (handles chunking automatically)
      uploadResult = await new Promise((resolve, reject) => {
        cloudinaryV2.uploader.upload_large(
          undefined as unknown as string,
          {
            resource_type: "video",
            public_id: publicId,
            chunk_size: 6_000_000, // 6MB chunks
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result!);
          }
        ).end(buffer);
      });
    } else {
      // Standard upload for images
      uploadResult = await new Promise((resolve, reject) => {
        cloudinaryV2.uploader.upload_stream(
          {
            resource_type: "image",
            public_id: publicId,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result!);
          }
        ).end(buffer);
      });
    }

    // Extract duration from Cloudinary video response
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
    console.error("Cloudinary upload error:", error);
    return NextResponse.json(
      { error: "Gagal mengupload file ke Cloudinary" },
      { status: 500 }
    );
  }
}
