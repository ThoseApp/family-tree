import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isMockMode, simulateDelay } from "@/lib/mock-data/api-helpers";
import users from "@/lib/mock-data/fixtures/users.json";

const createAdminClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
};

// Verify if the current user is an admin
async function verifyAdminUser(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return null;
  }

  const token = authHeader.replace("Bearer ", "");
  const supabase = createAdminClient();

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);
    if (error || !user) {
      return null;
    }

    // Check if user is admin
    if (user.user_metadata?.is_admin !== true) {
      return null;
    }

    return user;
  } catch (error) {
    console.error("Error verifying admin user:", error);
    return null;
  }
}

// GET: Get all admin user IDs (for notifications)
export async function GET(request: NextRequest) {
  try {
    console.log("🔍 API: Getting admin users...");

    // Handle mock mode
    if (isMockMode()) {
      await simulateDelay();

      console.log("🧪 API: Using mock data for admin users");

      // Filter mock users who have is_admin = true
      const adminUsers = users.filter(
        (user) => user.user_metadata?.is_admin === true
      );

      console.log(`👥 API: Found ${adminUsers.length} mock admin users`);

      const adminUserData = adminUsers.map((user: any) => ({
        id: user.id,
        email: user.email || "",
        user_metadata: {
          is_admin: true,
          ...(user.user_metadata || {}),
        },
      }));

      const response = {
        adminUsers: adminUserData,
        adminIds: adminUserData.map((user: any) => user.id),
      };

      console.log(`✅ API: Returning ${response.adminIds.length} admin IDs`);
      return NextResponse.json(response);
    }

    // Verify admin user (real mode only)
    const adminUser = await verifyAdminUser(request);
    if (!adminUser) {
      console.log("❌ API: User not authorized as admin");
      return NextResponse.json(
        { code: "not_admin", message: "User not allowed" },
        { status: 403 }
      );
    }

    console.log(`✅ API: Admin user verified: ${adminUser.email}`);

    const supabase = createAdminClient();

    // Get all users from auth
    console.log("🔄 API: Fetching all users from auth...");
    const { data: authUsers, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error("❌ API: Error fetching users:", error);
      return NextResponse.json(
        { error: "Failed to fetch users", details: error.message },
        { status: 500 }
      );
    }

    console.log(`📊 API: Found ${authUsers.users.length} total users`);

    // Filter users who have is_admin = true
    const adminUsers = authUsers.users.filter(
      (user) => user.user_metadata?.is_admin === true
    );

    console.log(`👥 API: Found ${adminUsers.length} admin users`);

    const adminUserData = adminUsers.map((user) => ({
      id: user.id,
      email: user.email || "",
      user_metadata: {
        is_admin: true,
        ...(user.user_metadata || {}),
      },
    }));

    const response = {
      adminUsers: adminUserData,
      adminIds: adminUserData.map((user) => user.id),
    };

    console.log(`✅ API: Returning ${response.adminIds.length} admin IDs`);
    return NextResponse.json(response);
  } catch (error: any) {
    console.error("❌ API: Error fetching admin users:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin users", details: error.message },
      { status: 500 }
    );
  }
}

// POST: Get admin user IDs without authentication (for internal use)
// This endpoint is for server-side calls from other API routes
export async function POST(request: NextRequest) {
  try {
    // Handle mock mode
    if (isMockMode()) {
      await simulateDelay();

      // Filter mock users who have is_admin = true
      const adminUsers = users.filter(
        (user) => user.user_metadata?.is_admin === true
      );

      const adminIds = adminUsers.map((user) => user.id);
      return NextResponse.json({ adminIds });
    }

    // Check if this is an internal server call by checking for a special header
    const internalKey = request.headers.get("x-internal-key");
    if (internalKey !== process.env.INTERNAL_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();

    // Get all users from auth
    const { data: authUsers, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error("Error fetching users:", error);
      return NextResponse.json(
        { error: "Failed to fetch users" },
        { status: 500 }
      );
    }

    // Filter users who have is_admin = true
    const adminUsers = authUsers.users.filter(
      (user) => user.user_metadata?.is_admin === true
    );

    const adminIds = adminUsers.map((user) => user.id);

    return NextResponse.json({ adminIds });
  } catch (error: any) {
    console.error("Error fetching admin user IDs:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin user IDs" },
      { status: 500 }
    );
  }
}
