import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const categories = await db.video.findMany({
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    });

    return NextResponse.json({
      categories: categories.map((c) => c.category),
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Gagal mengambil kategori" },
      { status: 500 }
    );
  }
}
