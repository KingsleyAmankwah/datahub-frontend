import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { accessToken } = await req.json();

  if (!accessToken) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const isProd = process.env.NODE_ENV === "production";
  const res = NextResponse.json({ ok: true });

  res.cookies.set("agent_token", accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  return res;
}
