import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const video = await db.video.findUnique({ where: { id } });

    if (!video) {
      return NextResponse.json({ error: "Video tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(video);
  } catch (error) {
    console.error("Error fetching video:", error);
    return NextResponse.json({ error: "Gagal mengambil video" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, category, videoUrl, thumbnailUrl, duration, isFeatured } = body;

    const video = await db.video.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(category && { category }),
        ...(videoUrl && { videoUrl }),
        ...(thumbnailUrl && { thumbnailUrl }),
        ...(duration !== undefined && { duration }),
        ...(isFeatured !== undefined && { isFeatured }),
      },
    });

    revalidatePath("/");
    revalidatePath("/admin");

    return NextResponse.json(video);
  } catch (error) {
    console.error("Error updating video:", error);
    return NextResponse.json({ error: "Gagal update video" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.video.delete({ where: { id } });

    revalidatePath("/");
    revalidatePath("/admin");

    return NextResponse.json({ message: "Video berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting video:", error);
    return NextResponse.json({ error: "Gagal menghapus video" }, { status: 500 });
  }
}
