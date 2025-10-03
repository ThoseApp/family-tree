/**
 * Debug utility to check and fix admin user metadata
 */

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
 * Debug current user's metadata
 */
export async function debugCurrentUserMetadata() {
  console.log("🔍 Debugging current user metadata...");

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      console.error("❌ No authenticated user found:", error);
      return null;
    }

    console.log("👤 Current User Details:");
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Created: ${user.created_at}`);
    console.log(`   Last Sign In: ${user.last_sign_in_at}`);
    console.log(`   User Metadata:`, user.user_metadata);
    console.log(`   App Metadata:`, user.app_metadata);

    // Check if user has admin metadata
    const isAdmin = user.user_metadata?.is_admin === true;
    const isPublisher = user.user_metadata?.is_publisher === true;

    console.log(`   Is Admin: ${isAdmin ? "✅ Yes" : "❌ No"}`);
    console.log(`   Is Publisher: ${isPublisher ? "✅ Yes" : "❌ No"}`);

    return {
      user,
      isAdmin,
      isPublisher,
      hasMetadata: !!user.user_metadata,
      metadataKeys: Object.keys(user.user_metadata || {}),
    };
  } catch (error) {
    console.error("❌ Error debugging user metadata:", error);
    return null;
  }
}

/**
 * Debug all users and their admin status (requires admin privileges)
 */
export async function debugAllUsersAdminStatus() {
  console.log("🔍 Debugging all users admin status...");

  try {
    // Get current user session for API call
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.access_token) {
      console.error("❌ No valid session for admin check");
      return null;
    }

    // Call our API to get all users
    const response = await fetch("/api/admin/users", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("❌ Failed to fetch users:", response.statusText);
      return null;
    }

    const data = await response.json();
    const users = data.users || [];

    console.log(`📊 Found ${users.length} total users:`);

    let adminCount = 0;
    let publisherCount = 0;

    users.forEach((user: any, index: number) => {
      const isAdmin = user.user_metadata?.is_admin === true;
      const isPublisher = user.user_metadata?.is_publisher === true;

      if (isAdmin) adminCount++;
      if (isPublisher) publisherCount++;

      console.log(`   ${index + 1}. ${user.email || "No email"}`);
      console.log(`      ID: ${user.id.substring(0, 8)}...`);
      console.log(`      Admin: ${isAdmin ? "✅" : "❌"}`);
      console.log(`      Publisher: ${isPublisher ? "✅" : "❌"}`);
      console.log(`      Metadata:`, user.user_metadata);
      console.log("");
    });

    console.log(`📈 Summary:`);
    console.log(`   Total Users: ${users.length}`);
    console.log(`   Admin Users: ${adminCount}`);
    console.log(`   Publisher Users: ${publisherCount}`);
    console.log(
      `   Regular Users: ${users.length - adminCount - publisherCount}`
    );

    return {
      totalUsers: users.length,
      adminUsers: adminCount,
      publisherUsers: publisherCount,
      users: users,
    };
  } catch (error) {
    console.error("❌ Error debugging all users:", error);
    return null;
  }
}

/**
 * Set current user as admin (for testing purposes)
 */
export async function setCurrentUserAsAdmin() {
  console.log("🔧 Setting current user as admin...");

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      console.error("❌ No authenticated user found");
      return false;
    }

    console.log(`👤 Setting user ${user.email} as admin...`);

    // Get session for API call
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.access_token) {
      console.error("❌ No valid session");
      return false;
    }

    // Call API to update user role
    const response = await fetch("/api/admin/users", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: user.id,
        isAdmin: true,
        isPublisher: false, // You can change this if needed
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ Failed to update user role:", errorData);
      return false;
    }

    console.log("✅ Successfully set user as admin!");
    console.log("🔄 Please refresh the page and try the test again.");

    return true;
  } catch (error) {
    console.error("❌ Error setting user as admin:", error);
    return false;
  }
}

/**
 * Fix admin metadata for a specific user by email
 */
export async function fixAdminMetadataByEmail(email: string) {
  console.log(`🔧 Fixing admin metadata for user: ${email}`);

  try {
    // First, get all users to find the one with this email
    const debugResult = await debugAllUsersAdminStatus();

    if (!debugResult) {
      console.error("❌ Could not fetch users");
      return false;
    }

    const targetUser = debugResult.users.find(
      (user: any) => user.email === email
    );

    if (!targetUser) {
      console.error(`❌ User with email ${email} not found`);
      return false;
    }

    console.log(
      `👤 Found user: ${targetUser.email} (ID: ${targetUser.id.substring(
        0,
        8
      )}...)`
    );

    // Get session for API call
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.access_token) {
      console.error("❌ No valid session");
      return false;
    }

    // Call API to update user role
    const response = await fetch("/api/admin/users", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: targetUser.id,
        isAdmin: true,
        isPublisher: targetUser.user_metadata?.is_publisher || false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ Failed to update user role:", errorData);
      return false;
    }

    console.log(`✅ Successfully set ${email} as admin!`);
    return true;
  } catch (error) {
    console.error("❌ Error fixing admin metadata:", error);
    return false;
  }
}

// Export for browser console use
if (typeof window !== "undefined") {
  (window as any).debugCurrentUserMetadata = debugCurrentUserMetadata;
  (window as any).debugAllUsersAdminStatus = debugAllUsersAdminStatus;
  (window as any).setCurrentUserAsAdmin = setCurrentUserAsAdmin;
  (window as any).fixAdminMetadataByEmail = fixAdminMetadataByEmail;
}
