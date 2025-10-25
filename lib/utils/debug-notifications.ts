// @ts-nocheck
/**
 * Debug utilities for testing the notification system
 */

import { supabase } from "@/lib/supabase/client";
import {
  getAdminUserIds,
  createNotificationForAllAdmins,
} from "./multi-admin-helpers";

/**
 * Debug function to test the complete notification flow
 */
export async function debugNotificationFlow() {
  console.log("🔍 Starting notification flow debug...");

  try {
    // Step 1: Check current user
    console.log("\n1️⃣ Checking current user...");
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.log("❌ No authenticated user found");
      return false;
    }

    console.log(`✅ Current user: ${user.email}`);
    console.log(`   User metadata:`, user.user_metadata);

    // Step 2: Check session
    console.log("\n2️⃣ Checking session...");
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.log("❌ No valid session found");
      return false;
    }

    console.log(`✅ Session valid, token exists: ${!!session.access_token}`);

    // Step 3: Test admin user fetching
    console.log("\n3️⃣ Testing admin user fetching...");
    try {
      const adminIds = await getAdminUserIds();
      console.log(`✅ Found ${adminIds.length} admin user(s)`);
      console.log(
        `   Admin IDs: [${adminIds
          .map((id) => id.substring(0, 8) + "...")
          .join(", ")}]`
      );

      if (adminIds.length === 0) {
        console.log("⚠️ No admin users found - notifications won't be sent");
        return false;
      }
    } catch (error) {
      console.log("❌ Failed to fetch admin users:", error);
      return false;
    }

    // Step 4: Test notification creation
    console.log("\n4️⃣ Testing notification creation...");
    try {
      const success = await createNotificationForAllAdmins({
        title: "Debug Test Notification",
        body: "This is a debug test to verify the notification system is working correctly.",
        type: "system",
      });

      if (success) {
        console.log("✅ Notification creation successful!");
      } else {
        console.log("❌ Notification creation failed");
        return false;
      }
    } catch (error) {
      console.log("❌ Error creating notification:", error);
      return false;
    }

    // Step 5: Verify notifications were created
    console.log("\n5️⃣ Verifying notifications in database...");
    try {
      const { data: notifications, error: notifError } = await supabase
        .from("notifications")
        .select("*")
        .eq("title", "Debug Test Notification")
        .order("created_at", { ascending: false })
        .limit(10);

      if (notifError) {
        console.log("❌ Error querying notifications:", notifError);
        return false;
      }

      console.log(
        `✅ Found ${notifications?.length || 0} notification(s) in database`
      );
      notifications?.forEach((notif, index) => {
        console.log(
          `   ${index + 1}. User: ${notif.user_id.substring(
            0,
            8
          )}..., Created: ${notif.created_at}`
        );
      });
    } catch (error) {
      console.log("❌ Error verifying notifications:", error);
      return false;
    }

    console.log("\n🎉 Notification flow debug completed successfully!");
    return true;
  } catch (error) {
    console.log("❌ Debug flow failed:", error);
    return false;
  }
}

/**
 * Simple test to create a notification for all admins
 */
export async function testAdminNotification(
  title: string = "Test Notification",
  body: string = "This is a test notification."
) {
  console.log(`📧 Testing admin notification: "${title}"`);

  try {
    const success = await createNotificationForAllAdmins({
      title,
      body,
      type: "system",
    });

    if (success) {
      console.log("✅ Notification sent successfully!");
      return true;
    } else {
      console.log("❌ Failed to send notification");
      return false;
    }
  } catch (error) {
    console.log("❌ Error sending notification:", error);
    return false;
  }
}

/**
 * Check how many admin users exist
 */
export async function checkAdminCount() {
  try {
    const adminIds = await getAdminUserIds();
    console.log(`👥 Found ${adminIds.length} admin user(s)`);
    return adminIds.length;
  } catch (error) {
    console.log("❌ Error checking admin count:", error);
    return 0;
  }
}

// Export for browser console use
if (typeof window !== "undefined") {
  (window as any).debugNotificationFlow = debugNotificationFlow;
  (window as any).testAdminNotification = testAdminNotification;
  (window as any).checkAdminCount = checkAdminCount;
}
