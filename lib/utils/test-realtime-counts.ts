/**
 * Test utilities for verifying real-time count updates
 */

import { supabase } from "@/lib/supabase/client";
import { GalleryStatusEnum } from "@/lib/constants/enums";

/**
 * Test function to create a pending gallery item and verify count updates
 */
export async function testGalleryCountUpdate() {
  console.log("🧪 Testing gallery count real-time updates...");

  try {
    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.log("❌ No authenticated user found");
      return false;
    }

    console.log("1️⃣ Creating test gallery item...");

    // Create a test gallery item with pending status
    const testGalleryItem = {
      url: "https://via.placeholder.com/300x200?text=Test+Image",
      caption: "Test image for count update verification",
      uploaded_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: user.id,
      file_name: `test/test-${Date.now()}.jpg`,
      file_size: 12345,
      status: GalleryStatusEnum.pending,
    };

    const { data: createdItem, error: createError } = await supabase
      .from("galleries")
      .insert(testGalleryItem)
      .select()
      .single();

    if (createError) {
      console.error("❌ Failed to create test gallery item:", createError);
      return false;
    }

    console.log("✅ Test gallery item created:", createdItem.id);
    console.log("2️⃣ Waiting 2 seconds for real-time update...");

    // Wait a bit for real-time updates to propagate
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log("3️⃣ Approving test gallery item...");

    // Update the item to approved status
    const { error: updateError } = await supabase
      .from("galleries")
      .update({
        status: GalleryStatusEnum.approved,
        updated_at: new Date().toISOString(),
      })
      .eq("id", createdItem.id);

    if (updateError) {
      console.error("❌ Failed to approve test gallery item:", updateError);
      return false;
    }

    console.log("✅ Test gallery item approved");
    console.log("4️⃣ Waiting 2 seconds for real-time update...");

    // Wait for real-time updates
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log("5️⃣ Cleaning up test item...");

    // Clean up - delete the test item
    const { error: deleteError } = await supabase
      .from("galleries")
      .delete()
      .eq("id", createdItem.id);

    if (deleteError) {
      console.warn("⚠️ Failed to clean up test gallery item:", deleteError);
    } else {
      console.log("✅ Test item cleaned up");
    }

    console.log("🎉 Gallery count test completed!");
    console.log("📊 Check the sidebar to see if counts updated in real-time");

    return true;
  } catch (error) {
    console.error("❌ Gallery count test failed:", error);
    return false;
  }
}

/**
 * Test real-time subscriptions by listening to changes
 */
export function testRealtimeSubscription() {
  console.log("🔍 Testing real-time subscription...");

  const testChannel = supabase
    .channel("test-gallery-changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "galleries",
      },
      (payload) => {
        console.log("📡 Real-time change detected:", {
          eventType: payload.eventType,
          table: payload.table,
          new: payload.new,
          old: payload.old,
        });
      }
    )
    .subscribe((status) => {
      console.log("📡 Subscription status:", status);
    });

  // Return cleanup function
  return () => {
    console.log("🧹 Cleaning up test subscription");
    testChannel.unsubscribe();
  };
}

// Export for browser console use
if (typeof window !== "undefined") {
  (window as any).testGalleryCountUpdate = testGalleryCountUpdate;
  (window as any).testRealtimeSubscription = testRealtimeSubscription;
}
