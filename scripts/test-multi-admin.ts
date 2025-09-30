/**
 * Test script for multi-admin functionality
 * Run this script to verify that the multi-admin system is working correctly
 */

import { supabase } from "@/lib/supabase/client";
import {
  fetchAllAdminUsers,
  isCurrentUserAdmin,
  getCurrentUserRole,
  createNotificationForAllAdmins,
  getAdminUserIds,
} from "@/lib/utils/multi-admin-helpers";

async function testMultiAdminFunctionality() {
  console.log("🧪 Testing Multi-Admin Functionality...\n");

  try {
    // Test 1: Check current user authentication
    console.log("1️⃣ Testing current user authentication...");
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.log("❌ No authenticated user found. Please sign in first.");
      return;
    }

    console.log(`✅ Current user: ${user.email}`);
    console.log(`   User metadata:`, user.user_metadata);

    // Test 2: Check if current user is admin
    console.log("\n2️⃣ Testing admin status check...");
    const isAdmin = await isCurrentUserAdmin();
    console.log(`   Is current user admin? ${isAdmin ? "✅ Yes" : "❌ No"}`);

    // Test 3: Get current user role
    console.log("\n3️⃣ Testing role detection...");
    const role = await getCurrentUserRole();
    console.log(`   Current user role: ${role}`);

    // Test 4: Fetch all admin users (requires admin privileges)
    console.log("\n4️⃣ Testing admin user fetching...");
    try {
      const adminUsers = await fetchAllAdminUsers();
      console.log(`✅ Found ${adminUsers.length} admin user(s):`);
      adminUsers.forEach((admin, index) => {
        console.log(`   ${index + 1}. ${admin.email} (ID: ${admin.id})`);
      });

      // Also test getting just the IDs
      const adminIds = await getAdminUserIds();
      console.log(`✅ Admin IDs: [${adminIds.join(", ")}]`);
    } catch (error) {
      console.log(
        "❌ Failed to fetch admin users (requires admin privileges):",
        error
      );
    }

    // Test 5: Test notification creation (only if user is admin)
    if (isAdmin) {
      console.log("\n5️⃣ Testing admin notification creation...");
      try {
        const success = await createNotificationForAllAdmins({
          title: "Multi-Admin Test",
          body: "This is a test notification to verify the multi-admin system is working correctly.",
          type: "system",
          resource_id: undefined,
          image: undefined,
        });

        if (success) {
          console.log("✅ Test notification sent to all admins successfully!");
        } else {
          console.log("❌ Failed to send test notification");
        }
      } catch (error) {
        console.log("❌ Error creating test notification:", error);
      }
    } else {
      console.log("\n5️⃣ Skipping notification test (user is not admin)");
    }

    console.log("\n🎉 Multi-admin functionality test completed!");
  } catch (error) {
    console.error("❌ Test failed with error:", error);
  }
}

// Export for use in browser console or Node.js
if (typeof window !== "undefined") {
  (window as any).testMultiAdminFunctionality = testMultiAdminFunctionality;
}

export { testMultiAdminFunctionality };
