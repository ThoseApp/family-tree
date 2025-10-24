import { createBrowserClient } from "@supabase/ssr";
import { createMockSupabaseClient } from "./mock-client";

// Check if mock mode is enabled
const isMockMode = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

export const supabase = isMockMode
  ? // Use mock client for testing/demo environments
    (createMockSupabaseClient() as any)
  : // Create a real supabase client on the browser with project's credentials
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

// Log mode for debugging
if (typeof window !== "undefined" && isMockMode) {
  console.log(
    "%c[Mock Mode] Using mock data - Perfect for demos and testing!",
    "color: #10b981; font-weight: bold; font-size: 12px;"
  );
}
