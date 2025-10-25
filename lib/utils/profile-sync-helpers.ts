/**
 * Profile Synchronization Helpers
 *
 * Utilities for keeping user profiles and family-tree records in sync
 */

import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

/**
 * Synchronizes profile name changes with the family-tree table
 * @param userId - The user's ID
 * @param firstName - Updated first name (optional)
 * @param lastName - Updated last name (optional)
 * @param dateOfBirth - Updated date of birth (optional)
 */
export async function syncProfileNameToFamilyTree(
  userId: string,
  firstName?: string,
  lastName?: string,
  dateOfBirth?: string
): Promise<void> {
  try {
    // Get the user's profile to check if they have a family_tree_uid
    const { data: userProfile, error: fetchError } = await supabase
      .from("profiles")
      .select("family_tree_uid")
      .eq("user_id", userId)
      .single();

    if (fetchError) {
      console.warn(
        "Could not fetch user profile for family tree sync:",
        fetchError
      );
      return;
    }

    if (!userProfile?.family_tree_uid) {
      // User doesn't have a linked family tree record
      return;
    }

    // Update corresponding family-tree record
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (firstName !== undefined) {
      updateData.first_name = firstName;
    }

    if (lastName !== undefined) {
      updateData.last_name = lastName;
    }

    if (dateOfBirth !== undefined) {
      // Convert empty string to null for database compatibility
      updateData.date_of_birth =
        !dateOfBirth || dateOfBirth.trim() === "" ? null : dateOfBirth;
    }

    const { error: familyTreeError } = await supabase
      .from("family-tree")
      .update(updateData)
      .eq("unique_id", userProfile.family_tree_uid);

    if (familyTreeError) {
      console.warn("Could not update family tree record:", {
        error: familyTreeError,
        familyTreeUid: userProfile.family_tree_uid,
        updateData,
      });
      toast.warning(
        "Profile updated, but family tree sync failed. Please contact support if this persists."
      );
    }
  } catch (error) {
    console.error("Error syncing profile name to family tree:", error);
  }
}

/**
 * Synchronizes profile image changes with the family-tree table
 * @param userId - The user's ID
 * @param imageUrl - The new image URL
 * @param refreshProfile - Optional callback to refresh profile data in store
 */
export async function syncProfileImageToFamilyTree(
  userId: string,
  imageUrl: string,
  refreshProfile?: () => Promise<void>
): Promise<void> {
  try {
    // Get the user's profile to check if they have a family_tree_uid
    const { data: userProfile, error: fetchError } = await supabase
      .from("profiles")
      .select("family_tree_uid")
      .eq("user_id", userId)
      .single();

    if (fetchError) {
      console.warn(
        "Could not fetch user profile for family tree sync:",
        fetchError
      );
      return;
    }

    if (!userProfile?.family_tree_uid) {
      // User doesn't have a linked family tree record
      return;
    }

    // Update corresponding family-tree record
    const { error: familyTreeError } = await supabase
      .from("family-tree")
      .update({
        picture_link: imageUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("unique_id", userProfile.family_tree_uid);

    if (familyTreeError) {
      console.warn("Could not update family tree record:", {
        error: familyTreeError,
        familyTreeUid: userProfile.family_tree_uid,
        imageUrl,
      });
      toast.warning(
        "Profile image updated, but family tree sync failed. Please contact support if this persists."
      );
    }

    // Refresh profile data in store if callback provided
    if (refreshProfile) {
      await refreshProfile();
    }
  } catch (error) {
    console.error("Error syncing profile image to family tree:", error);
  }
}

/**
 * Links a user profile to a family tree record
 * @param userId - The user's ID
 * @param familyTreeUid - The unique ID of the family tree record
 */
export async function linkProfileToFamilyTree(
  userId: string,
  familyTreeUid: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({
        family_tree_uid: familyTreeUid,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (error) {
      console.error("Error linking profile to family tree:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error linking profile to family tree:", error);
    return false;
  }
}

/**
 * Synchronizes family tree image changes with the profiles table
 * Updates profile image if the profile currently has no image and the family tree record has a new image
 * @param familyTreeUid - The unique ID of the family tree record
 * @param imageUrl - The new image URL from family tree
 */
export async function syncFamilyTreeImageToProfile(
  familyTreeUid: string,
  imageUrl: string
): Promise<void> {
  try {
    // Find profile linked to this family tree record
    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("user_id, image")
      .eq("family_tree_uid", familyTreeUid)
      .single();

    if (fetchError) {
      // No profile linked to this family tree record - this is normal
      if (fetchError.code === "PGRST116") {
        return;
      }
      console.warn(
        "Could not fetch profile for family tree image sync:",
        fetchError
      );
      return;
    }

    if (!profile) {
      // No profile linked to this family tree record
      return;
    }

    // Only update profile image if it's currently empty/null and we have a new image
    const shouldUpdateProfileImage =
      (!profile.image || profile.image.trim() === "") &&
      imageUrl &&
      imageUrl.trim() !== "";

    if (!shouldUpdateProfileImage) {
      // Profile already has an image or no new image to sync
      return;
    }

    // Update profile with new image URL
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        image: imageUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", profile.user_id);

    if (profileError) {
      console.warn("Could not update profile image:", {
        error: profileError,
        familyTreeUid,
        userId: profile.user_id,
        imageUrl,
      });
    }
  } catch (error) {
    console.error("Error syncing family tree image to profile:", error);
  }
}

/**
 * Unlinks a user profile from a family tree record
 * @param userId - The user's ID
 */
export async function unlinkProfileFromFamilyTree(
  userId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({
        family_tree_uid: null,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (error) {
      console.error("Error unlinking profile from family tree:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error unlinking profile from family tree:", error);
    return false;
  }
}
