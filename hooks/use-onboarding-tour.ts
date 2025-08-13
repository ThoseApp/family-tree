"use client";

import { useCallback } from "react";
import "driver.js/dist/driver.css";
import { usePathname, useRouter } from "next/navigation";
import { useUserStore } from "@/stores/user-store";
import { getUserRoleFromMetadata, UserRole } from "@/lib/types";

type DriverInstance = ReturnType<typeof import("driver.js").driver> | null;

// Prevent multiple concurrent tours due to retries/race conditions
let tourIsRunning = false;
let tourAttemptInProgress = false;
let activeDriver: any = null;

function getStorageKey(userId: string | undefined) {
  const id = userId || "anonymous";
  const version = "v1"; // bump to re-show tour after changes
  return `onboarding:${version}:${id}`;
}

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
  const { user } = useUserStore();

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
    // Best-effort reset when overlay closes
    try {
      (driverObj as any)?.on("destroyed", () => {
        tourIsRunning = false;
        activeDriver = null;
      });
    } catch {}
    return true;
  }, [pathname, user]);

  const maybeStart = useCallback(async () => {
    const storageKey = getStorageKey(user?.id);
    if (typeof window === "undefined") return;
    const seen = window.localStorage.getItem(storageKey);
    if (seen === "1") return;
    if (tourIsRunning || tourAttemptInProgress) return;

    // Delay and retry a few times to ensure DOM targets exist before starting
    tourAttemptInProgress = true;
    const attemptStart = async (attempt: number) => {
      if (tourIsRunning) return;
      const started = await start();
      if (started) {
        window.localStorage.setItem(storageKey, "1");
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
  }, [start, user?.id]);

  return { start, maybeStart };
}
