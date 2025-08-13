import { NotificationTypeEnum } from "@/lib/constants/enums";
import { Notification } from "@/lib/types";

interface NotificationRoutingOptions {
  isAdmin: boolean;
}

/**
 * Get the appropriate route based on notification type and user context
 */
export function getNotificationRoute(
  notification: Notification,
  options: NotificationRoutingOptions
): string {
  const { isAdmin } = options;

  switch (notification.type) {
    case NotificationTypeEnum.member_request:
      return isAdmin ? "/admin/family-member-requests" : "/dashboard";

    case NotificationTypeEnum.gallery_request:
      return isAdmin ? "/admin/gallery-requests" : "/dashboard";

    case NotificationTypeEnum.gallery_approved:
    case NotificationTypeEnum.gallery_declined:
      return isAdmin ? "/admin/gallery" : "/dashboard/gallery";

    case NotificationTypeEnum.notice_board_request:
      return isAdmin ? "/admin/notice-board-requests" : "/dashboard";

    case NotificationTypeEnum.notice_board_approved:
    case NotificationTypeEnum.notice_board_declined:
      return isAdmin ? "/admin/notice-board" : "/dashboard/notice-board";

    case NotificationTypeEnum.event_invitation:
      return isAdmin ? "/admin/events" : "/dashboard/invitations";

    case NotificationTypeEnum.event:
      return isAdmin ? "/admin/events" : "/dashboard/events";

    default:
      return isAdmin ? "/admin" : "/dashboard";
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
    case NotificationTypeEnum.member_request:
      return "Review Request";
    case NotificationTypeEnum.gallery_request:
      return "Review Gallery";
    case NotificationTypeEnum.gallery_approved:
    case NotificationTypeEnum.gallery_declined:
      return "View Gallery";
    case NotificationTypeEnum.notice_board_request:
      return "Review Notice";
    case NotificationTypeEnum.notice_board_approved:
    case NotificationTypeEnum.notice_board_declined:
      return "View Notice";
    case NotificationTypeEnum.event_invitation:
      return "View Event";
    case NotificationTypeEnum.event:
      return "View Event";
    default:
      return "View";
  }
}
