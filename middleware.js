import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Public paths (anonymous browsing)
  const isPublicPage =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/feed" ||
    pathname === "/explore" ||
    pathname === "/products" ||
    pathname === "/reels" ||
    pathname === "/webinars" ||
    pathname === "/members" ||
    pathname.startsWith("/post/") ||
    (pathname.startsWith("/profile/") && !pathname.startsWith("/profile/edit")) ||
    // Public API reads (mutations still enforce auth in route handlers)
    pathname.startsWith("/api/posts") ||
    pathname.startsWith("/api/reels") ||
    pathname.startsWith("/api/users") ||
    pathname.startsWith("/api/search") ||
    pathname.startsWith("/api/members") ||
    pathname.startsWith("/api/comments");

  // NextAuth + invitations endpoints
  const isAuthApi =
    pathname.startsWith("/api/auth") || pathname.startsWith("/api/invites");

  if (isPublicPage || isAuthApi) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token && pathname !== "/login") {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
};
