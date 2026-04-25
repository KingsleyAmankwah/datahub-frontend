import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { accessToken, admin } = await req.json();

  if (!accessToken || !admin) {
    return NextResponse.json(
      { error: "Missing token or admin" },
      { status: 400 },
    );
  }

  const isProd = process.env.NODE_ENV === "production";

  const res = NextResponse.json({ ok: true });

  // httpOnly: the backend reads the JWT from the Authorization header, not a cookie.
  // We store the token in a Secure, SameSite=Strict cookie so it is not accessible
  // cross-site. The client reads it to build the Authorization header.
  res.cookies.set("token", accessToken, {
    httpOnly: false,
    secure: isProd,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  // Admin payload is non-sensitive display data — same flags.
  res.cookies.set("admin", JSON.stringify(admin), {
    httpOnly: false,
    secure: isProd,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  return res;
}
