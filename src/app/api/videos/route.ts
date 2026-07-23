import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: Record<string, unknown> = {};

    if (category && category !== "Semua") {
      where.category = category;
    }

    if (featured === "true") {
      where.isFeatured = true;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { category: { contains: search } },
      ];
    }

    const videos = await db.video.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await db.video.count({ where });

    return NextResponse.json({
      videos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching videos:", error);
    return NextResponse.json(
      { error: "Gagal mengambil video" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, category, videoUrl, thumbnailUrl, duration, isFeatured } = body;

    if (!title || !videoUrl) {
      return NextResponse.json(
        { error: "Judul dan URL video wajib diisi" },
        { status: 400 }
      );
    }

    const video = await db.video.create({
      data: {
        title,
        description: description || null,
        category: category || "Umum",
        videoUrl,
        thumbnailUrl,
        duration: duration || null,
        isFeatured: isFeatured || false,
      },
    });

    revalidatePath("/");
    revalidatePath("/admin");

    return NextResponse.json(video, { status: 201 });
  } catch (error) {
    console.error("Error creating video:", error);
    return NextResponse.json(
      { error: "Gagal membuat video" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, views } = body;

    if (!id) {
      return NextResponse.json({ error: "ID video diperlukan" }, { status: 400 });
    }

    const video = await db.video.update({
      where: { id },
      data: { views: (views || 0) + 1 },
    });

    return NextResponse.json(video);
  } catch (error) {
    console.error("Error updating video:", error);
    return NextResponse.json({ error: "Gagal update video" }, { status: 500 });
  }
}
