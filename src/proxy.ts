import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
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

  // 2. Allow authentication APIs freely
  const isAuthApi = pathname.startsWith("/api/auth/");
  if (isAuthApi) {
    return NextResponse.next();
  }

  const isLoginPage = pathname === "/login";

  // Protected routes require authentication
  const protectedRoutes = ["/favorites", "/shopping-list", "/mypage", "/ingredients", "/recommend"];
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  // 3. If no token
  if (!token) {
    // Allow login page and unprotected pages
    if (isLoginPage) {
      return NextResponse.next();
    }
    // For protected API endpoints, return JSON 401
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "인증되지 않은 사용자입니다." }, { status: 401 });
    }
    // Redirect protected web routes to login
    if (isProtectedRoute) {
      const url = new URL("/login", request.url);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // 4. If token exists and user tries to access login, redirect to home
  if (isLoginPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
