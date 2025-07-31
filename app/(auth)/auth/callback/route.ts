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

    // Route all users to home page after login
    let redirectPath = "/";

    // If there's a specific next parameter and it's not a sign-in page, use it
    if (next && next !== "/sign-in" && next !== "/") {
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
