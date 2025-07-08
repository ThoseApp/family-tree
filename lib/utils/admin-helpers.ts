import { supabase } from "@/lib/supabase/client";

/**
 * Debug function to check user metadata and admin status
 */
export async function debugUserMetadata() {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("Error getting user:", error);
      return null;
    }

    if (!user) {
      console.log("No user found");
      return null;
    }

    console.log("🔍 User Metadata Debug:", {
      user_id: user.id,
      email: user.email,
      user_metadata: user.user_metadata,
      is_admin: user.user_metadata?.is_admin,
      type_of_is_admin: typeof user.user_metadata?.is_admin,
      is_admin_strict: user.user_metadata?.is_admin === true,
      is_admin_loose: user.user_metadata?.is_admin == true,
    });

    return user;
  } catch (error) {
    console.error("Error in debugUserMetadata:", error);
    return null;
  }
}

/**
 * Function to update user metadata to set admin flag correctly
 * Only use this for debugging/fixing admin accounts
 */
export async function setUserAsAdmin(userId?: string) {
  try {
    const { data, error } = await supabase.auth.updateUser({
      data: {
        is_admin: true, // Ensure this is boolean true
      },
    });

    if (error) {
      console.error("Error updating user metadata:", error);
      return false;
    }

    console.log("✅ User metadata updated successfully:", data);
    return true;
  } catch (error) {
    console.error("Error in setUserAsAdmin:", error);
    return false;
  }
}

/**
 * Check if current user should be admin and fix if needed
 * This is a temporary debugging function
 */
export async function checkAndFixAdminStatus(adminEmail: string) {
  try {
    const user = await debugUserMetadata();

    if (!user) return false;

    if (user.email === adminEmail) {
      console.log("🔧 This user should be an admin, checking metadata...");

      if (user.user_metadata?.is_admin !== true) {
        console.log("❌ Admin flag not set correctly, fixing...");
        const success = await setUserAsAdmin();

        if (success) {
          console.log("✅ Admin status fixed! Please refresh the page.");
          // Force a page refresh to reload user data
          window.location.reload();
        }

        return success;
      } else {
        console.log("✅ Admin flag is set correctly");
        return true;
      }
    } else {
      console.log("👤 This user is not the admin");
      return false;
    }
  } catch (error) {
    console.error("Error in checkAndFixAdminStatus:", error);
    return false;
  }
}

// Export for use in browser console during debugging
if (typeof window !== "undefined") {
  (window as any).debugUserMetadata = debugUserMetadata;
  (window as any).setUserAsAdmin = setUserAsAdmin;
  (window as any).checkAndFixAdminStatus = checkAndFixAdminStatus;
}
