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
      return null;
    }

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
      if (user.user_metadata?.is_admin !== true) {
        const success = await setUserAsAdmin();

        if (success) {
          // Force a page refresh to reload user data
          window.location.reload();
        }

        return success;
      } else {
        return true;
      }
    } else {
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
