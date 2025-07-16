import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { getUserRoleFromMetadata } from "@/lib/types";

// Create admin client with service role key
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

// GET: List all users with their roles
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

    // Get all approved users from profiles
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (profileError) throw profileError;

    // Get auth users to check their metadata
    const { data: authUsers, error: authError } =
      await supabase.auth.admin.listUsers();

    if (authError) throw authError;

    // Combine profile data with auth metadata to determine roles
    const usersWithRoles = profiles.map((profile) => {
      const authUser = authUsers.users.find((u) => u.id === profile.user_id);
      const role = authUser ? getUserRoleFromMetadata(authUser) : "user";

      return {
        ...profile,
        role,
      };
    });

    return NextResponse.json({ users: usersWithRoles });
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// PUT: Update user role
export async function PUT(request: NextRequest) {
  try {
    // Verify admin user
    const adminUser = await verifyAdminUser(request);
    if (!adminUser) {
      return NextResponse.json(
        { code: "not_admin", message: "User not allowed" },
        { status: 403 }
      );
    }

    const { userId, isPublisher, isAdmin } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Get current user data to preserve other metadata
    const { data: currentUser, error: getUserError } =
      await supabase.auth.admin.getUserById(userId);

    if (getUserError) throw getUserError;

    // Update user metadata
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...currentUser.user.user_metadata,
        is_publisher: isPublisher,
        is_admin: isAdmin,
      },
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { error: "Failed to update user role" },
      { status: 500 }
    );
  }
}
