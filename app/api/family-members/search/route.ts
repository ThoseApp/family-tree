import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isMockMode, simulateDelay } from "@/lib/mock-data/api-helpers";
import { mockDataService } from "@/lib/mock-data/mock-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim();

    if (!q) {
      return NextResponse.json({
        data: [],
        success: true,
        errors: [],
        message: "",
      });
    }

    // Handle mock mode
    if (isMockMode()) {
      await simulateDelay();
      console.log(`[Mock API] Searching family members for: "${q}"`);

      try {
        await mockDataService.initialize();

        // Search in mock data - case insensitive search
        const allMembers = mockDataService.getAll("family-tree");
        const lowerQ = q.toLowerCase();

        const results = allMembers.filter((member: any) => {
          const firstName = (member.first_name || "").toLowerCase();
          const lastName = (member.last_name || "").toLowerCase();
          const uniqueId = (member.unique_id || "").toLowerCase();

          return (
            firstName.includes(lowerQ) ||
            lastName.includes(lowerQ) ||
            uniqueId.includes(lowerQ)
          );
        });

        console.log(
          `[Mock API] Found ${results.length} matching family members`
        );

        return NextResponse.json({
          data: results,
          success: true,
          errors: [],
          message: "",
        });
      } catch (error: any) {
        console.error("[Mock API] Error searching family members:", error);
        return NextResponse.json(
          {
            data: [],
            success: false,
            errors: [error.message],
            message: "Failed to search family members",
          },
          { status: 500 }
        );
      }
    }

    // Real Supabase mode
    const supabase = await createClient();

    // Escape special characters for ILIKE pattern
    const escaped = q.replace(/[\%_]/g, (ch) => `\\${ch}`);
    const pattern = `%${escaped}%`;

    const { data, error } = await supabase
      .from("family-tree")
      .select("*")
      .or(
        `first_name.ilike.${pattern},last_name.ilike.${pattern},unique_id.ilike.${pattern}`
      )
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        {
          data: [],
          success: false,
          errors: [error.message],
          message: "Failed to search family members",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: data || [],
      success: true,
      errors: [],
      message: "",
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        data: [],
        success: false,
        errors: [err.message || "Unknown error"],
        message: "Unexpected error",
      },
      { status: 500 }
    );
  }
}
