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

    // If we have a user, ensure they have a profile and check approval status
    let userProfile = null;
    if (user) {
      // Check if this user has a profile already
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      // If no profile exists and there was no error besides "not found", create one
      if (
        !profile &&
        (profileError?.code === "PGRST116" ||
          profileError?.message?.includes("not found"))
      ) {
        // Extract user information from metadata or email
        const firstName =
          user.user_metadata?.first_name ||
          user.user_metadata?.name?.split(" ")[0] ||
          "";
        const lastName =
          user.user_metadata?.last_name ||
          (user.user_metadata?.name?.split(" ").length > 1
            ? user.user_metadata?.name?.split(" ").slice(1).join(" ")
            : "");

        // Create a profile for this user with pending status (unless admin)
        const newProfile = {
          user_id: user.id,
          email: user.email,
          first_name: firstName,
          last_name: lastName,
          status:
            user.user_metadata?.is_admin === true ? "approved" : "pending",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        await supabase.from("profiles").insert(newProfile);
        userProfile = newProfile;
      } else {
        userProfile = profile;
      }
    }

    // Get the current path
    const path = request.nextUrl.pathname;

    // Check if the route is private (dashboard or admin)
    const isPrivateRoute =
      path.startsWith("/dashboard") || path.startsWith("/admin");

    // Check if the route is a protected landing page
    const protectedLandingPages = [
      "/family-tree",
      "/family-members",
      "/events",
      "/gallery",
      "/notice-board",
    ];
    const isProtectedLandingRoute =
      protectedLandingPages.includes(path) || path.startsWith("/profile/");

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

    if (!user && isProtectedLandingRoute) {
      // Redirect unauthenticated users away from protected landing pages
      const redirectUrl = new URL("/sign-in", request.url);
      redirectUrl.searchParams.set(
        "message",
        "Please sign in to access this page"
      );
      redirectUrl.searchParams.set("next", path);
      return NextResponse.redirect(redirectUrl);
    }

    // Check approval status for authenticated users on private routes
    if (user && userProfile && isPrivateRoute) {
      if (userProfile.status === "pending") {
        // Redirect to pending approval page
        if (!path.startsWith("/pending-approval")) {
          const redirectUrl = new URL("/pending-approval", request.url);
          return NextResponse.redirect(redirectUrl);
        }
      }

      if (userProfile.status === "rejected") {
        // Redirect to account rejected page
        if (!path.startsWith("/account-rejected")) {
          const redirectUrl = new URL("/account-rejected", request.url);
          return NextResponse.redirect(redirectUrl);
        }
      }
    }

    // Check approval status for authenticated users on protected landing pages
    if (user && userProfile && isProtectedLandingRoute) {
      if (userProfile.status === "pending") {
        // Redirect to pending approval page
        if (!path.startsWith("/pending-approval")) {
          const redirectUrl = new URL("/pending-approval", request.url);
          return NextResponse.redirect(redirectUrl);
        }
      }

      if (userProfile.status === "rejected") {
        // Redirect to account rejected page
        if (!path.startsWith("/account-rejected")) {
          const redirectUrl = new URL("/account-rejected", request.url);
          return NextResponse.redirect(redirectUrl);
        }
      }
    }

    if (user && isAuthRoute) {
      // Only allow approved users to access dashboard/admin
      if (userProfile?.status === "approved") {
        // Redirect authenticated and approved users away from auth routes
        const redirectPath =
          user.user_metadata?.is_admin === true ? "/admin" : "/dashboard";

        const redirectUrl = new URL(redirectPath, request.url);
        return NextResponse.redirect(redirectUrl);
      }
    }

    // Remove the admin redirect logic to allow access to landing pages
    // Authenticated users (admin and non-admin) can now freely navigate to landing area

    // Return the response with updated cookies
    return response;
  } catch (error) {
    // If there's an error, just continue without redirecting
    console.error("Middleware error:", error);
    return response;
  }
}
