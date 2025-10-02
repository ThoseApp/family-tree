import { supabase } from "@/lib/supabase/client";

/**
 * Marks the welcome message as seen for a user
 * @param userId - The ID of the user
 * @returns Promise<boolean> - True if successful, false otherwise
 */
export async function markWelcomeMessageAsSeen(
  userId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({ has_seen_welcome_message: true })
      .eq("user_id", userId);

    if (error) {
      console.error("Error marking welcome message as seen:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error marking welcome message as seen:", error);
    return false;
  }
}

/**
 * Checks if a user has seen the welcome message
 * @param userId - The ID of the user
 * @returns Promise<boolean> - True if seen, false if not seen or error
 */
export async function hasSeenWelcomeMessage(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("has_seen_welcome_message")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Error checking welcome message status:", error);
      return false;
    }

    return data?.has_seen_welcome_message ?? false;
  } catch (error) {
    console.error("Error checking welcome message status:", error);
    return false;
  }
}

