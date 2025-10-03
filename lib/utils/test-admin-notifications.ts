/**
 * Test utility for debugging admin notifications
 * This file helps test and debug the multi-admin notification system
 */

import { supabase } from "@/lib/supabase/client";
import {
  getAdminUserIds,
  createNotificationForAllAdmins,
  isCurrentUserAdmin,
} from "./multi-admin-helpers";

/**
 * Comprehensive test of the admin notification system
 */
export async function testAdminNotificationSystem() {
  console.log("🧪 Starting comprehensive admin notification system test...");

  const results = {
    currentUserIsAdmin: false,
    sessionValid: false,
    adminUsersFound: 0,
    apiRouteWorking: false,
    notificationCreated: false,
    notificationInDatabase: false,
    errors: [] as string[],
  };

  try {
    // Test 1: Check current user
    console.log("\n1️⃣ Testing current user admin status...");
    try {
      results.currentUserIsAdmin = await isCurrentUserAdmin();
      console.log(`   Current user is admin: ${results.currentUserIsAdmin}`);
    } catch (error) {
      const errorMsg = `Failed to check current user admin status: ${error}`;
      console.error(`   ❌ ${errorMsg}`);
      results.errors.push(errorMsg);
    }

    // Test 2: Check session
    console.log("\n2️⃣ Testing session validity...");
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      results.sessionValid = !error && !!session?.access_token;
      console.log(`   Session valid: ${results.sessionValid}`);
      if (session?.user) {
        console.log(`   User email: ${session.user.email}`);
        console.log(`   User metadata:`, session.user.user_metadata);
      }
    } catch (error) {
      const errorMsg = `Failed to get session: ${error}`;
      console.error(`   ❌ ${errorMsg}`);
      results.errors.push(errorMsg);
    }

    // Test 3: Test admin user fetching
    console.log("\n3️⃣ Testing admin user fetching...");
    try {
      const adminIds = await getAdminUserIds();
      results.adminUsersFound = adminIds.length;
      results.apiRouteWorking = adminIds.length > 0;
      console.log(`   Admin users found: ${results.adminUsersFound}`);

      if (adminIds.length > 0) {
        console.log(
          `   Admin IDs: ${adminIds
            .map((id) => id.substring(0, 8) + "...")
            .join(", ")}`
        );
      } else {
        results.errors.push(
          "No admin users found - this will prevent notifications"
        );
      }
    } catch (error) {
      const errorMsg = `Failed to fetch admin users: ${error}`;
      console.error(`   ❌ ${errorMsg}`);
      results.errors.push(errorMsg);
    }

    // Test 4: Test notification creation
    console.log("\n4️⃣ Testing notification creation...");
    try {
      const testTitle = `Test Notification ${Date.now()}`;
      results.notificationCreated = await createNotificationForAllAdmins({
        title: testTitle,
        body: "This is a test notification to verify the admin notification system is working.",
        type: "system",
      });
      console.log(`   Notification created: ${results.notificationCreated}`);

      // Test 5: Verify notification in database
      if (results.notificationCreated) {
        console.log("\n5️⃣ Verifying notification in database...");
        try {
          // Wait a moment for the notification to be inserted
          await new Promise((resolve) => setTimeout(resolve, 1000));

          const { data: notifications, error } = await supabase
            .from("notifications")
            .select("*")
            .eq("title", testTitle)
            .order("created_at", { ascending: false });

          if (error) {
            throw error;
          }

          results.notificationInDatabase = (notifications?.length || 0) > 0;
          console.log(
            `   Notifications in database: ${notifications?.length || 0}`
          );

          if (notifications && notifications.length > 0) {
            notifications.forEach((notif, index) => {
              console.log(
                `   ${index + 1}. User: ${notif.user_id.substring(
                  0,
                  8
                )}..., Created: ${notif.created_at}`
              );
            });
          }
        } catch (error) {
          const errorMsg = `Failed to verify notification in database: ${error}`;
          console.error(`   ❌ ${errorMsg}`);
          results.errors.push(errorMsg);
        }
      }
    } catch (error) {
      const errorMsg = `Failed to create test notification: ${error}`;
      console.error(`   ❌ ${errorMsg}`);
      results.errors.push(errorMsg);
    }

    // Summary
    console.log("\n📊 TEST RESULTS SUMMARY:");
    console.log(
      `   Current user is admin: ${results.currentUserIsAdmin ? "✅" : "❌"}`
    );
    console.log(`   Session valid: ${results.sessionValid ? "✅" : "❌"}`);
    console.log(
      `   Admin users found: ${results.adminUsersFound} ${
        results.adminUsersFound > 0 ? "✅" : "❌"
      }`
    );
    console.log(
      `   API route working: ${results.apiRouteWorking ? "✅" : "❌"}`
    );
    console.log(
      `   Notification created: ${results.notificationCreated ? "✅" : "❌"}`
    );
    console.log(
      `   Notification in database: ${
        results.notificationInDatabase ? "✅" : "❌"
      }`
    );

    if (results.errors.length > 0) {
      console.log("\n❌ ERRORS FOUND:");
      results.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }

    const allTestsPassed =
      results.sessionValid &&
      results.adminUsersFound > 0 &&
      results.apiRouteWorking &&
      results.notificationCreated &&
      results.notificationInDatabase;

    console.log(
      `\n${allTestsPassed ? "🎉" : "❌"} Overall system status: ${
        allTestsPassed ? "WORKING" : "NEEDS ATTENTION"
      }`
    );

    return results;
  } catch (error) {
    console.error("❌ Test failed with unexpected error:", error);
    results.errors.push(`Unexpected test error: ${error}`);
    return results;
  }
}

/**
 * Quick test to create a simple admin notification
 */
export async function quickAdminNotificationTest() {
  console.log("⚡ Quick admin notification test...");

  try {
    const success = await createNotificationForAllAdmins({
      title: "Quick Test Notification",
      body: "This is a quick test to verify admin notifications are working.",
      type: "system",
    });

    if (success) {
      console.log("✅ Quick test passed - notification sent successfully!");
    } else {
      console.log("❌ Quick test failed - notification was not sent");
    }

    return success;
  } catch (error) {
    console.error("❌ Quick test error:", error);
    return false;
  }
}

// Export for browser console use
if (typeof window !== "undefined") {
  (window as any).testAdminNotificationSystem = testAdminNotificationSystem;
  (window as any).quickAdminNotificationTest = quickAdminNotificationTest;
}
