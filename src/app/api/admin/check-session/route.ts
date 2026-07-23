import { NextResponse } from "next/server";

// Session check for client-side AdminAuthGuard.
// Proxies to NextAuth's built-in /api/auth/session endpoint
// which handles JWT decoding internally and always works correctly.
export async function GET(request: Request) {
  try {
    const sessionRes = await fetch(
      new URL("/api/auth/session", request.url),
      {
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
        cache: "no-store",
      }
    );
    const data = await sessionRes.json();

    if (data?.user?.id) {
      return NextResponse.json({
        authenticated: true,
        user: {
          id: data.user.id,
          name: data.user.name,
          role: data.user.role,
        },
      });
    }

    return NextResponse.json({ authenticated: false });
  } catch (error) {
    console.error("[check-session] Error:", error);
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }
}
