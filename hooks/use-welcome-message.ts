"use client";

import { useCallback } from "react";
import { useUserStore } from "@/stores/user-store";
import { supabase } from "@/lib/supabase/client";

export function useWelcomeMessage() {
  const { user, profile, fetchProfile } = useUserStore();

  // Check if user should see the welcome message
  const shouldShowWelcomeMessage = useCallback(() => {
    if (!profile || !user?.id) return false;

    // Show welcome message if user hasn't seen it yet
    return !profile.has_seen_welcome_message;
  }, [profile, user?.id]);

  // Mark welcome message as seen in database
  const markWelcomeMessageSeen = useCallback(async () => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          has_seen_welcome_message: true,
        })
        .eq("user_id", user.id);

      if (error) {
        console.error("Error marking welcome message as seen:", error);
        return false;
      }

      // Refresh the profile to get updated data
      await fetchProfile();
      return true;
    } catch (error) {
      console.error("Error marking welcome message as seen:", error);
      return false;
    }
  }, [user?.id, fetchProfile]);

  // Reset welcome message status (useful for testing)
  const resetWelcomeMessage = useCallback(async () => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          has_seen_welcome_message: false,
        })
        .eq("user_id", user.id);

      if (error) {
        console.error("Error resetting welcome message:", error);
        return false;
      }

      // Refresh the profile to get updated data
      await fetchProfile();
      return true;
    } catch (error) {
      console.error("Error resetting welcome message:", error);
      return false;
    }
  }, [user?.id, fetchProfile]);

  return {
    shouldShowWelcomeMessage: shouldShowWelcomeMessage(),
    markWelcomeMessageSeen,
    resetWelcomeMessage,
  };
}
