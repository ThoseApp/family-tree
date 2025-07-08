import { NotificationTypeEnum } from "@/lib/constants/enums";
import { useNotificationsStore } from "@/stores/notifications-store";
import { v4 as uuidv4 } from "uuid";

const GALLERY_RESOURCE_ID = "45b5f969-7e7a-4b45-a995-cf875a8acf11";

/**
 * Create sample notifications for testing the routing system
 */
export const createTestNotifications = async (
  userId: string,
  isAdmin: boolean = false
) => {
  const { createNotification } = useNotificationsStore.getState();

  const testNotifications = [
    {
      title: "New Event Added",
      body: "A new family reunion event has been scheduled for next month. Click to view details and RSVP.",
      type: NotificationTypeEnum.event as keyof typeof NotificationTypeEnum,
      resource_id: GALLERY_RESOURCE_ID,
      user_id: userId,
      read: false,
    },
    {
      title: "Notice Board Update",
      body: "Important family announcement posted. Please check the notice board for updates.",
      type: NotificationTypeEnum.notice_board_request as keyof typeof NotificationTypeEnum,
      resource_id: GALLERY_RESOURCE_ID,
      user_id: userId,
      read: false,
    },
    {
      title: "Gallery Photo Approved",
      body: "Your submitted family photo has been approved and is now visible in the gallery.",
      type: NotificationTypeEnum.gallery_approved as keyof typeof NotificationTypeEnum,
      resource_id: GALLERY_RESOURCE_ID,
      user_id: userId,
      read: false,
    },
  ];

  // Add admin-specific notifications if user is admin
  if (isAdmin) {
    testNotifications.push(
      {
        title: "New Gallery Request",
        body: "A new photo has been submitted for approval. Please review it in the gallery requests section.",
        type: NotificationTypeEnum.gallery_request as keyof typeof NotificationTypeEnum,
        resource_id: GALLERY_RESOURCE_ID,
        user_id: userId,
        read: false,
      },
      {
        title: "Family Member Request",
        body: "A new user has requested to join the family tree. Please review their request.",
        type: NotificationTypeEnum.member_request as keyof typeof NotificationTypeEnum,
        resource_id: GALLERY_RESOURCE_ID,
        user_id: userId,
        read: false,
      }
    );
  }

  // Create notifications one by one with a small delay
  for (const notification of testNotifications) {
    try {
      await createNotification(notification);
      // Small delay to avoid overwhelming the system
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error("Failed to create test notification:", error);
    }
  }
};
