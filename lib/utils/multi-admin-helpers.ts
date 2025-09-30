import { supabase } from "@/lib/supabase/client";
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

/**
 * Utility functions for handling multiple admin users
 * This replaces the single NEXT_PUBLIC_ADMIN_ID approach
 */

export interface AdminUser {
  id: string;
  email: string;
  user_metadata: {
    is_admin: boolean;
    [key: string]: any;
  };
}

/**
 * Fetch all admin users from the auth system
 * This function calls the API route to get admin users
 */
export async function fetchAllAdminUsers(): Promise<AdminUser[]> {
  try {
    // Get current user session for authentication
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.access_token) {
      console.error("No valid session for admin user fetch");
      return [];
    }

    // Call the API route to get admin users
    const response = await fetch("/api/admin/get-admin-users", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("Failed to fetch admin users:", response.statusText);
      return [];
    }

    const data = await response.json();
    return data.adminUsers || [];
  } catch (error) {
    console.error("Error in fetchAllAdminUsers:", error);
    return [];
  }
}

/**
 * Get admin user IDs only (for notification purposes)
 * This is a lighter version that just returns the IDs
 */
export async function getAdminUserIds(): Promise<string[]> {
  try {
    // Get current user session for authentication
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.access_token) {
      console.error("No valid session for admin user IDs fetch");
      return [];
    }

    // Call the API route to get admin user IDs
    const response = await fetch("/api/admin/get-admin-users", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("Failed to fetch admin user IDs:", response.statusText);
      return [];
    }

    const data = await response.json();
    return data.adminIds || [];
  } catch (error) {
    console.error("Error getting admin user IDs:", error);
    return [];
  }
}

/**
 * Check if a specific user ID is an admin
 * This can be used client-side with the current user
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user || user.id !== userId) {
      return false;
    }

    return user.user_metadata?.is_admin === true;
  } catch (error) {
    console.error("Error checking if user is admin:", error);
    return false;
  }
}

/**
 * Check if current authenticated user is an admin
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return false;
    }

    return user.user_metadata?.is_admin === true;
  } catch (error) {
    console.error("Error checking current user admin status:", error);
    return false;
  }
}

/**
 * Get current user's role (admin, publisher, or user)
 */
export async function getCurrentUserRole(): Promise<
  "admin" | "publisher" | "user"
> {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return "user";
    }

    if (user.user_metadata?.is_admin === true) {
      return "admin";
    }

    if (user.user_metadata?.is_publisher === true) {
      return "publisher";
    }

    return "user";
  } catch (error) {
    console.error("Error getting current user role:", error);
    return "user";
  }
}

/**
 * Create notifications for all admin users
 * This replaces single admin notification patterns
 */
export async function createNotificationForAllAdmins(notificationData: {
  title: string;
  body: string;
  type: string;
  resource_id?: string;
  image?: string;
}): Promise<boolean> {
  try {
    const adminIds = await getAdminUserIds();

    if (adminIds.length === 0) {
      console.warn("No admin users found for notification");
      return false;
    }

    // Create notifications for all admins
    const notifications = adminIds.map((adminId) => ({
      user_id: adminId,
      title: notificationData.title,
      body: notificationData.body,
      type: notificationData.type,
      resource_id: notificationData.resource_id || null,
      image: notificationData.image || null,
    }));

    const { error } = await supabase.rpc("create_system_notifications", {
      notifications: notifications,
    });

    if (error) {
      console.error("Error creating admin notifications:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in createNotificationForAllAdmins:", error);
    return false;
  }
}

/**
 * Check if current user can auto-approve content
 * (admin or publisher)
 */
export async function canCurrentUserAutoApprove(): Promise<boolean> {
  try {
    const role = await getCurrentUserRole();
    return role === "admin" || role === "publisher";
  } catch (error) {
    console.error("Error checking auto-approve permissions:", error);
    return false;
  }
}

/**
 * Server-side function to get admin user IDs (for API routes)
 * This bypasses the client-side authentication and directly uses admin client
 */
export async function getAdminUserIdsServerSide(): Promise<string[]> {
  try {
    const adminClient = createAdminClient();

    // Get all users from auth
    const { data: authUsers, error } = await adminClient.auth.admin.listUsers();

    if (error) {
      console.error("Error fetching users server-side:", error);
      return [];
    }

    // Filter users who have is_admin = true
    const adminUsers = authUsers.users.filter(
      (user) => user.user_metadata?.is_admin === true
    );

    return adminUsers.map((user) => user.id);
  } catch (error) {
    console.error("Error in getAdminUserIdsServerSide:", error);
    return [];
  }
}

/**
 * Server-side function to verify admin user from request
 * This is for API routes
 */
export async function verifyAdminUserFromRequest(
  request: Request
): Promise<any | null> {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return null;
    }

    const token = authHeader.replace("Bearer ", "");
    const adminClient = createAdminClient();

    const {
      data: { user },
      error,
    } = await adminClient.auth.getUser(token);

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
