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

    // Determine resource type and folder
    const resourceType = type === "video" ? "video" : "image";
    const folder = type === "video" ? "pekob/videos" : "pekob/thumbnails";

    // Determine format
    const ext = file.name.split(".").pop() || (type === "video" ? "mp4" : "jpg");
    const publicId = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    // Upload to Cloudinary using buffer
    const uploadResult = await new Promise<{ secure_url: string; public_id: string; duration?: number; width?: number; height?: number }>(
      (resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: resourceType,
            public_id: publicId,
            format: ext,
            folder: folder.replace(`${publicId.split("/")[0]}/`, ""),
            ...(type === "video" && { chunk_size: 6_000_000 }), // 6MB chunks for video
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result!);
          }
        );
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
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return NextResponse.json(
      { error: "Gagal mengupload file ke Cloudinary" },
      { status: 500 }
    );
  }
}
