import { NextResponse } from "next/server";

// Returns Cloudinary config needed for client-side direct upload
// This bypasses the server for the actual file transfer, avoiding Vercel serverless timeouts
export async function GET() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName) {
    return NextResponse.json(
      { error: "Cloudinary belum dikonfigurasi" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    cloudName,
    uploadPreset: uploadPreset || "pekob_unsigned",
    // Tell client which API endpoint to use
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}`,
  });
}
