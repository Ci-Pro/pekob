import { NextResponse } from "next/server";
import { jwt } from "next-auth/jwt";

// Session check for client-side AdminAuthGuard.
// Decodes the JWT directly — no database query needed,
// so it never crashes even if the DB is temporarily unreachable.
export async function GET() {
  try {
    const token = await jwt({
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === "production",
    });

    if (!token || !token.id) {
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: token.id as string,
        name: token.name as string,
        role: token.role as string,
      },
    });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }
}
