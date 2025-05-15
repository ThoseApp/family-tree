import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Fetch the authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  /**
   * Authentication Handling
   *
   * - Redirect unauthenticated users trying to access private pages to the login page.
   * - Redirect authenticated users away from authentication pages.
   */

  const isPrivateRoute =
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/admin");

  const isAuthRoute =
    request.nextUrl.pathname === "/sign-in" ||
    request.nextUrl.pathname === "/sign-up" ||
    request.nextUrl.pathname === "/forgot-password" ||
    request.nextUrl.pathname === "/reset-password" ||
    request.nextUrl.pathname === "/otp-verification" ||
    request.nextUrl.pathname.includes("/(auth)"); // For route groups

  // USER NOT LOGGED IN - Handle protected routes
  if (!user && isPrivateRoute) {
    // User is not logged in and tries to access protected route
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("message", "Please sign in to proceed");
    url.searchParams.set("next", request.nextUrl.pathname); // Save current path for redirect after login
    return NextResponse.redirect(url);
  }

  // USER LOGGED IN - Handle auth routes
  if (user && isAuthRoute) {
    // User is logged in but tries to access auth pages
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  // Return the updated response with session cookies
  return supabaseResponse;
}
