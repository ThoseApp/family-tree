import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  // Create a response object that we can mutate
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  try {
    // Create the Supabase client with proper cookie handling
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) {
            return request.cookies.get(name)?.value;
          },
          set(name, value, options) {
            // If the cookie is updated, update the response headers
            response.cookies.set({
              name,
              value,
              ...options,
            });
          },
          remove(name, options) {
            // If the cookie is removed, update the response headers
            response.cookies.delete({
              name,
              ...options,
            });
          },
        },
      }
    );

    // Fetch the authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Get the current path
    const path = request.nextUrl.pathname;

    // Check if the route is private (dashboard or admin)
    const isPrivateRoute =
      path.startsWith("/dashboard") || path.startsWith("/admin");

    // Check if the route is an auth route
    const isAuthRoute =
      path === "/sign-in" ||
      path === "/sign-up" ||
      path === "/forgot-password" ||
      path === "/reset-password" ||
      path === "/otp-verification" ||
      path.includes("/(auth)");

    // Handle redirections based on authentication status
    if (!user && isPrivateRoute) {
      // Redirect unauthenticated users away from private routes
      const redirectUrl = new URL("/sign-in", request.url);
      redirectUrl.searchParams.set("message", "Please sign in to proceed");
      redirectUrl.searchParams.set("next", path);
      return NextResponse.redirect(redirectUrl);
    }

    if (user && isAuthRoute) {
      // Redirect authenticated users away from auth routes
      const redirectPath =
        user.user_metadata?.is_admin === true ? "/admin" : "/dashboard";
      const redirectUrl = new URL(redirectPath, request.url);
      return NextResponse.redirect(redirectUrl);
    }

    // Only redirect admin users if they're on the home page or dashboard
    if (
      user &&
      user.user_metadata?.is_admin === true &&
      (path === "/" || path.startsWith("/dashboard"))
    ) {
      const redirectUrl = new URL("/admin", request.url);
      return NextResponse.redirect(redirectUrl);
    }

    // Return the response with updated cookies
    return response;
  } catch (error) {
    // If there's an error, just continue without redirecting
    console.error("Middleware error:", error);
    return response;
  }
}
