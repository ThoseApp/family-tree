"use client";

import { useCallback, useState, useEffect } from "react";
import "driver.js/dist/driver.css";
import { usePathname, useRouter } from "next/navigation";
import { useUserStore } from "@/stores/user-store";
import { getUserRoleFromMetadata, UserRole } from "@/lib/types";
import { supabase } from "@/lib/supabase/client";

type DriverInstance = ReturnType<typeof import("driver.js").driver> | null;

// Prevent multiple concurrent tours due to retries/race conditions
let tourIsRunning = false;
let tourAttemptInProgress = false;
let activeDriver: any = null;

// Current version of the onboarding tour - increment to re-show tour after changes
const CURRENT_TOUR_VERSION = "v1";

function buildStepsForRole(role: UserRole, pathname: string) {
  const steps: any[] = [];

  // Global search (all users)
  if (
    typeof document !== "undefined" &&
    document.querySelector("#global-search-input")
  ) {
    steps.push({
      element: "#global-search-input",
      popover: {
        title: "Global search",
        description:
          "Search across family members, events, notices, and gallery from anywhere.",
      },
    });
  }

  // Profile/avatar (all users)
  if (
    typeof document !== "undefined" &&
    document.querySelector("#navbar-avatar-button")
  ) {
    steps.push({
      element: "#navbar-avatar-button",
      popover: {
        title: "Your profile & settings",
        description:
          "Click your avatar to open the menu. Use Profile to view and Settings to edit your details.",
      },
    });
  }

  // Sidebar nav links (role-specific)
  const addNavStep = (key: string, title: string, description: string) => {
    const selector = `[data-tour="nav-${key}"]`;
    if (typeof document !== "undefined" && document.querySelector(selector)) {
      steps.push({
        element: selector,
        popover: { title, description },
      });
    }
  };

  // Common navs
  addNavStep("events", "Events", "Create events and manage invitations.");
  addNavStep(
    "gallery",
    "Gallery",
    "Upload pictures and videos. Submissions require admin approval."
  );
  addNavStep(
    "notice-board",
    "Notice Board",
    "Post notices. Your posts may require admin approval."
  );
  addNavStep(
    "settings",
    "Settings",
    "Update your profile, photo, and password."
  );

  // Admin-only: Family Members
  if (role === "admin") {
    addNavStep(
      "family-members",
      "Family members",
      "Admins can add and manage family members here."
    );
  }

  // Page-specific actions available on certain routes if elements exist
  const addActionStep = (id: string, title: string, description: string) => {
    if (typeof document !== "undefined" && document.querySelector(`#${id}`)) {
      steps.push({ element: `#${id}`, popover: { title, description } });
    }
  };

  // Add member (admin page)
  addActionStep(
    "add-family-member-button",
    "Add a new member",
    "Open the form to add a family member to the tree."
  );

  // Gallery upload (all)
  addActionStep(
    "upload-gallery-button",
    "Upload media",
    "Select images/videos to upload. They will be reviewed and approved before public visibility."
  );

  // Events
  addActionStep(
    "add-event-button",
    "Create an event",
    "Add event details, date, and image."
  );

  // Invitations (admin/publisher emphasis, available for others if present)
  addActionStep(
    "invitations-tab-trigger",
    "Invitations",
    "Manage invites here. Admins/Publishers can create invites; recipients can accept or decline."
  );

  // Notices
  addActionStep(
    "add-notice-button",
    "Create a notice",
    "Write a notice. It may require admin approval before it’s visible to everyone."
  );

  return steps;
}

export function useOnboardingTour() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, fetchProfile } = useUserStore();
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  // Mark onboarding tour as completed in database
  const markTourCompleted = useCallback(async () => {
    if (!user?.id) return false;

    console.log("Onboarding tour: Marking tour as completed for user", user.id);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          has_completed_onboarding_tour: true,
          onboarding_tour_version: CURRENT_TOUR_VERSION,
        })
        .eq("user_id", user.id);

      if (error) {
        console.error("Error marking tour as completed:", error);
        return false;
      }

      console.log("Onboarding tour: Successfully marked as completed");

      // Refresh the profile to get updated data
      await fetchProfile();
      return true;
    } catch (error) {
      console.error("Error marking tour as completed:", error);
      return false;
    }
  }, [user?.id, fetchProfile]);

  // Check if user should see the onboarding tour
  const shouldShowTour = useCallback(() => {
    if (!profile || !user?.id) return false;

    // Only show tour if user has NEVER completed it
    // Note: We also check version in case we need to re-show for major updates
    return (
      !profile.has_completed_onboarding_tour ||
      profile.onboarding_tour_version !== CURRENT_TOUR_VERSION
    );
  }, [profile, user?.id]);

  const start = useCallback(async () => {
    if (tourIsRunning) return false;
    const role = getUserRoleFromMetadata(user);
    const steps = buildStepsForRole(role, pathname);
    if (steps.length === 0) return false;
    // Claim the run immediately to avoid races from concurrent timers
    tourIsRunning = true;

    const { driver } = await import("driver.js");
    // Ensure any previous driver is destroyed before starting a new one
    try {
      activeDriver?.destroy?.();
    } catch {}

    const driverObj: DriverInstance = driver({
      showProgress: true,
      overlayOpacity: 0.6,
      allowClose: true,
      stagePadding: 6,
    });

    // Some driver.js typings expect drive(stepIndex?: number). Use setSteps then drive.
    (driverObj as any)?.setSteps(steps);
    activeDriver = driverObj;
    (driverObj as any)?.drive(0);
    // Best-effort reset when overlay closes and mark tour as completed
    try {
      (driverObj as any)?.on("destroyed", async () => {
        tourIsRunning = false;
        activeDriver = null;
        // Mark tour as completed in database
        await markTourCompleted();
      });
    } catch {}
    return true;
  }, [pathname, user, markTourCompleted]);

  const maybeStart = useCallback(async () => {
    if (typeof window === "undefined") return;
    if (isCheckingStatus || tourIsRunning || tourAttemptInProgress) return;

    // Ensure we have both user and profile data before checking
    if (!user?.id || !profile) {
      console.log("Onboarding tour: Waiting for user and profile data");
      return;
    }

    // Check if user should see the tour based on database status
    const shouldShow = shouldShowTour();
    console.log("Onboarding tour: Should show tour?", shouldShow, {
      hasCompletedTour: profile.has_completed_onboarding_tour,
      tourVersion: profile.onboarding_tour_version,
      currentVersion: CURRENT_TOUR_VERSION,
    });

    if (!shouldShow) return;

    // Delay and retry a few times to ensure DOM targets exist before starting
    tourAttemptInProgress = true;
    const attemptStart = async (attempt: number) => {
      if (tourIsRunning) return;
      const started = await start();
      if (started) {
        tourAttemptInProgress = false;
        return;
      }
      if (attempt < 5) {
        setTimeout(() => attemptStart(attempt + 1), 500);
      } else {
        tourAttemptInProgress = false;
      }
    };

    setTimeout(() => attemptStart(1), 800);
  }, [start, shouldShowTour, isCheckingStatus, user?.id, profile]);

  // Reset onboarding tour status (useful for testing or forcing re-tour)
  const resetTour = useCallback(async () => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          has_completed_onboarding_tour: false,
          onboarding_tour_version: null,
        })
        .eq("user_id", user.id);

      if (error) {
        console.error("Error resetting tour:", error);
        return false;
      }

      // Refresh the profile to get updated data
      await fetchProfile();
      return true;
    } catch (error) {
      console.error("Error resetting tour:", error);
      return false;
    }
  }, [user?.id, fetchProfile]);

  return {
    start,
    maybeStart,
    resetTour,
    shouldShowTour: shouldShowTour(),
    isCheckingStatus,
    markTourCompleted,
  };
}
