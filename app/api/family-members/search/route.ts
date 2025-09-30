import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
