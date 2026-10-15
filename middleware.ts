import { NextResponse, type NextRequest } from "next/server";

// Firebase client sessions are checked in the page and API handlers.
// Do not trust client-provided roles; privileged writes use verified ID tokens
// and Firebase Admin on the server.
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*", "/login"] };
