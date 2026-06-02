import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  const { pathname } = request.nextUrl;

  // 1. Skip static assets, next internals, and public resources
  const isStaticFile =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico";
  if (isStaticFile) {
    return NextResponse.next();
  }

  // 2. Allow authentication APIs
  const isAuthApi = pathname.startsWith("/api/auth/");
  if (isAuthApi) {
    return NextResponse.next();
  }

  const isLoginPage = pathname === "/login";

  // 3. If no session
  if (!session) {
    if (isLoginPage) {
      return NextResponse.next();
    }
    // For API endpoints, return JSON 401 instead of redirecting
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "인증되지 않은 사용자입니다." }, { status: 401 });
    }
    // Redirect web requests to login page
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 4. If session exists and user is trying to access login, redirect to home
  if (isLoginPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
