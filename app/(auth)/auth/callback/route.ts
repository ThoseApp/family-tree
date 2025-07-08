import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/dashboard";

  if (code) {
    const supabase = await createClient();

    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code);

    // Get the user to check if they're an admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Determine redirect path based on user role - prioritize admin check
    let redirectPath = "/dashboard";

    if (user?.user_metadata?.is_admin === true) {
      // Always route admins to /admin regardless of next parameter
      redirectPath = "/admin";
    } else if (next && next !== "/sign-in") {
      // For non-admins, respect the next parameter
      redirectPath = next;
    }

    // Redirect to the appropriate page
    return NextResponse.redirect(new URL(redirectPath, requestUrl.origin));
  }

  // If there's no code, redirect to sign-in
  return NextResponse.redirect(
    new URL(
      "/sign-in?message=Authentication failed. Please try again.",
      requestUrl.origin
    )
  );
}
