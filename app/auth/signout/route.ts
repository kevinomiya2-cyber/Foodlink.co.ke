import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // Firebase client SDK owns the client-side session. This endpoint is kept
  // only for old links; it does not pretend to revoke a Firebase ID token.
  return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
}
