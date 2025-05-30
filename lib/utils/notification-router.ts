import { NotificationTypeEnum } from "@/lib/constants/enums";
import { Notification } from "@/lib/types";

interface RoutingOptions {
  isAdmin?: boolean;
  resourceId?: string;
}

/**
 * Get the appropriate route based on notification type and user context
 */
export function getNotificationRoute(
  notification: Notification,
  options: RoutingOptions = {}
): string {
  const { isAdmin = false, resourceId = notification.resource_id } = options;
  const baseRoute = isAdmin ? "/admin" : "/dashboard";

  switch (notification.type) {
    // Event-related notifications
    case NotificationTypeEnum.event:
      if (resourceId) {
        return `${baseRoute}/events?eventId=${resourceId}`;
      }
      return `${baseRoute}/events`;

    // Notice board notifications
    case NotificationTypeEnum.notice_board:
      if (resourceId) {
        return `${baseRoute}/notice-board?noticeId=${resourceId}`;
      }
      return `${baseRoute}/notice-board`;

    // Gallery-related notifications
    case NotificationTypeEnum.gallery:
      if (resourceId) {
        return `${baseRoute}/gallery?galleryId=${resourceId}`;
      }
      return `${baseRoute}/gallery`;

    case NotificationTypeEnum.gallery_request:
      // Admin notification - redirect to gallery requests
      if (isAdmin) {
        return "/admin/gallery-requests";
      }
      // User notification - redirect to their gallery
      return "/dashboard/gallery";

    case NotificationTypeEnum.gallery_approved:
    case NotificationTypeEnum.gallery_declined:
      // User notifications - redirect to gallery with specific item if available
      if (resourceId) {
        return `/dashboard/gallery?galleryId=${resourceId}`;
      }
      return "/dashboard/gallery";

    // Family member request notifications
    case NotificationTypeEnum.family_member_request:
      // Admin notification - redirect to member requests
      if (isAdmin) {
        return "/admin/member-requests";
      }
      // User notification - redirect to family tree
      return "/dashboard/family-tree";

    // Default fallback - go to overview
    default:
      return baseRoute;
  }
}

/**
 * Check if a notification should be navigable (has a meaningful destination)
 */
export function isNotificationNavigable(notification: Notification): boolean {
  // All notification types should be navigable in this system
  return Boolean(notification.type);
}

/**
 * Get a descriptive action text for the notification
 */
export function getNotificationActionText(notification: Notification): string {
  switch (notification.type) {
    case NotificationTypeEnum.event:
      return "View Event";
    case NotificationTypeEnum.notice_board:
      return "View Notice";
    case NotificationTypeEnum.gallery:
    case NotificationTypeEnum.gallery_approved:
    case NotificationTypeEnum.gallery_declined:
      return "View Gallery";
    case NotificationTypeEnum.gallery_request:
      return "Review Request";
    case NotificationTypeEnum.family_member_request:
      return "View Request";
    default:
      return "View Details";
  }
}
