import { supabase } from "./supabase/client";
import { UserProfile } from "./types";

/**
 * Get the user profile for a given user ID
 * @param userId - The ID of the user to get the profile for
 * @returns The user profile or null if there is an error
 */
export const getUserProfile = async (
  userId: string
): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) return null;

  return data;
};
