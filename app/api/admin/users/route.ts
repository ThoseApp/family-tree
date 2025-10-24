import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { getUserRoleFromMetadata } from "@/lib/types";
import {
  isMockMode,
  simulateDelay,
  createSuccessResponse,
  createErrorResponse,
} from "@/lib/mock-data/api-helpers";
import { mockDataService } from "@/lib/mock-data/mock-service";
import users from "@/lib/mock-data/fixtures/users.json";

// Ensure this route is always dynamic and not statically rendered/cached
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

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
    // Handle mock mode
    if (isMockMode()) {
      await simulateDelay();

      // Get mock profiles data
      const profiles = mockDataService.query("profiles", [
        { column: "status", operator: "eq", value: "approved" },
      ]);

      // Combine with mock user data to get roles
      const usersWithRoles = profiles.map((profile) => {
        const authUser = users.find((u) => u.id === profile.user_id);
        const role = authUser ? getUserRoleFromMetadata(authUser) : "user";

        return {
          ...profile,
          role,
        };
      });

      return NextResponse.json({ users: usersWithRoles });
    }

    // Verify admin user (real mode only)
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
      // .neq("user_id", adminUser.id)
      .order("created_at", { ascending: false });

    if (profileError) throw profileError;

    // Combine profile data with auth metadata to determine roles using parallel requests
    const usersWithRoles = await Promise.all(
      profiles.map(async (profile) => {
        const { data: authUser, error: authError } =
          await supabase.auth.admin.getUserById(profile.user_id);
        const role =
          authUser && !authError
            ? getUserRoleFromMetadata(authUser.user)
            : "user";

        return {
          ...profile,
          role,
        };
      })
    );

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
    const { userId, isPublisher, isAdmin } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Handle mock mode
    if (isMockMode()) {
      await simulateDelay();

      // Find and update mock user
      const userIndex = users.findIndex((u) => u.id === userId);
      if (userIndex === -1) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Update user metadata
      users[userIndex].user_metadata = {
        ...users[userIndex].user_metadata,
        is_publisher: isPublisher,
        is_admin: isAdmin,
      };

      // Also update the profile role field
      mockDataService.update(
        "profiles",
        {
          role: isAdmin ? "admin" : isPublisher ? "publisher" : "user",
          updated_at: new Date().toISOString(),
        },
        [{ column: "user_id", operator: "eq", value: userId }]
      );

      console.log(
        `[Mock API] Updated user ${userId} role - admin: ${isAdmin}, publisher: ${isPublisher}`
      );
      return NextResponse.json({ success: true });
    }

    // Verify admin user (real mode only)
    const adminUser = await verifyAdminUser(request);
    if (!adminUser) {
      return NextResponse.json(
        { code: "not_admin", message: "User not allowed" },
        { status: 403 }
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
