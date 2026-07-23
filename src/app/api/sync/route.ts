import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Sync endpoint for real-time polling.
 * Returns a version hash (latest updatedAt timestamp) and video count.
 * Client polls this endpoint every ~8s; only refetches full data when version changes.
 */
export async function GET() {
  try {
    const [latestVideo, count] = await Promise.all([
      db.video.findFirst({
        select: { updatedAt: true, createdAt: true },
        orderBy: { updatedAt: "desc" },
      }),
      db.video.count(),
    ]);

    const version = latestVideo
      ? Math.max(
          latestVideo.updatedAt.getTime(),
          latestVideo.createdAt.getTime()
        )
      : 0;

    return NextResponse.json({ version, count });
  } catch (error) {
    console.error("Sync endpoint error:", error);
    return NextResponse.json({ version: -1, count: -1 }, { status: 500 });
  }
}
