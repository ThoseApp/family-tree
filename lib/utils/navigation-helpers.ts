import { User } from "@supabase/supabase-js";
import { NavLink } from "@/lib/types";

/**
 * Protected landing page routes that require authentication and approval
 */
const PROTECTED_LANDING_ROUTES = [
  "/family-tree",
  "/family-members",
  "/events",
  "/gallery",
  "/notice-board",
];

/**
 * Profile routes that require authentication (dynamic routes)
 */
const PROFILE_ROUTE_PREFIX = "/profile/";

/**
 * Check if a route requires authentication
 */
export function isProtectedRoute(path: string): boolean {
  return (
    PROTECTED_LANDING_ROUTES.includes(path) ||
    path.startsWith(PROFILE_ROUTE_PREFIX)
  );
}

/**
 * Check if user is authenticated and approved
 * Note: If user exists in the store, they are already approved
 * (since only approved users can successfully log in)
 */
export function isUserApproved(user: User | null, userProfile?: any): boolean {
  if (!user) return false;

  // If user is authenticated, they are approved
  // (The login process already filters out non-approved users)
  if (userProfile) {
    return userProfile.status === "approved";
  }

  // If no profile data but user exists, assume approved
  return true;
}

/**
 * Filter navigation links based on user authentication and approval status
 */
export function getFilteredNavLinks(
  navLinks: NavLink[],
  user: User | null,
  userProfile?: any
): NavLink[] {
  const userApproved = isUserApproved(user, userProfile);

  return navLinks.filter((link) => {
    // If route is not protected, always show it
    if (!isProtectedRoute(link.href)) {
      return true;
    }

    // If route is protected, only show if user is approved
    return userApproved;
  });
}

/**
 * Check if user should see protected navigation links
 */
export function shouldShowProtectedLinks(
  user: User | null,
  userProfile?: any
): boolean {
  return isUserApproved(user, userProfile);
}
