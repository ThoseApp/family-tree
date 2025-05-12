import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  // First update the session
  const response = await updateSession(request);

  // Check authenticated status using the supabase client
  const { pathname } = request.nextUrl;

  // Define route patterns based on the app directory structure
  const isPrivateRoute =
    pathname.startsWith("/dashboard") || pathname.startsWith("/admin");

  // Check if the current path is within the auth group
  const isAuthRoute = pathname.includes("/(auth)");

  // Get the user session cookie (Supabase uses sb-<project-ref> format)
  // Add fallback check for other potential cookie names
  const supabaseSession =
    request.cookies.get("sb-session") ||
    request.cookies.get("supabase-auth-token") ||
    request.cookies.getAll().find((cookie) => cookie.name.startsWith("sb-"));

  const isLoggedIn = !!supabaseSession?.value;

  // Create a new URL for redirects
  const redirectUrl = new URL(request.url);

  // Apply the redirect logic
  if (isPrivateRoute && !isLoggedIn) {
    // Redirect to login if trying to access protected routes while logged out
    redirectUrl.pathname = "/sign-in";
    return NextResponse.redirect(redirectUrl);
  }

  if (isAuthRoute && isLoggedIn) {
    // Redirect to dashboard if trying to access auth routes while logged in
    redirectUrl.pathname = "/dashboard";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
