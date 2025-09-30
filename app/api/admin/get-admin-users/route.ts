import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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
    // Verify admin user
    const adminUser = await verifyAdminUser(request);
    if (!adminUser) {
      return NextResponse.json(
        { code: "not_admin", message: "User not allowed" },
        { status: 403 }
      );
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

    const adminUserData = adminUsers.map((user) => ({
      id: user.id,
      email: user.email || "",
      user_metadata: {
        is_admin: true,
        ...(user.user_metadata || {}),
      },
    }));

    return NextResponse.json({
      adminUsers: adminUserData,
      adminIds: adminUserData.map((user) => user.id),
    });
  } catch (error: any) {
    console.error("Error fetching admin users:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin users" },
      { status: 500 }
    );
  }
}

// POST: Get admin user IDs without authentication (for internal use)
// This endpoint is for server-side calls from other API routes
export async function POST(request: NextRequest) {
  try {
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
