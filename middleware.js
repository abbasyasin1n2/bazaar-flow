import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Paths that require authentication
  const protectedPaths = ["/dashboard", "/my-listings", "/create-listing", "/my-bids", "/messages"];
  
  // Paths that should redirect to dashboard if already logged in
  const authPaths = ["/login", "/register"];

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Check if the path is protected
  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  // Check if the path is an auth path
  const isAuthPath = authPaths.some((path) => pathname.startsWith(path));

  // Redirect to login if accessing protected path without token
  if (isProtectedPath && !token) {
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // Redirect to dashboard if accessing auth path with token
  if (isAuthPath && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/my-listings/:path*",
    "/create-listing/:path*",
    "/my-bids/:path*",
    "/messages/:path*",
    "/login",
    "/register",
  ],
};
