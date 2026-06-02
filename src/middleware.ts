import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // Protected routes: require authentication
  const protectedRoutes = ["/favorites", "/shopping-list", "/mypage", "/ingredients", "/recommend"];
  
  const isProtectedRoute = protectedRoutes.some((route) => 
    pathname === route || pathname.startsWith(route + "/")
  );

  // If trying to access a protected route without a token, redirect to login
  if (isProtectedRoute && !token) {
    const url = new URL("/login", request.url);
    // Remember where the user was heading
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // If already logged in and trying to access the login page, redirect to home
  if (pathname === "/login" && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - next.svg, vercel.svg (images)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|next.svg|vercel.svg).*)",
  ],
};
