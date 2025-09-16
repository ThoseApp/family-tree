import { Notification } from "@/lib/types";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { NotificationTypeEnum } from "@/lib/constants/enums";
import { getNotificationRoute } from "@/lib/utils/notification-router";

interface NotificationsState {
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;
  realtimeChannel?: any;
}

interface NotificationsActions {
  fetchNotifications: (userId: string) => Promise<void>;
  addNotification: (notification: Notification) => void;
  createNotification: (
    notification: Omit<Notification, "id" | "created_at" | "updated_at">
  ) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  subscribeToNotifications: (userId: string) => void;
  unsubscribeFromNotifications: () => void;
  navigateToNotification: (
    notification: Notification,
    isAdmin: boolean,
    router: any
  ) => Promise<void>;
}

const initialState: NotificationsState = {
  notifications: [],
  isLoading: false,
  error: null,
  realtimeChannel: null,
};

export const useNotificationsStore = create(
  persist<NotificationsState & NotificationsActions>(
    (set, get) => ({
      ...initialState,

      fetchNotifications: async (userId: string) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("notifications")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

          if (error) throw error;

          set({ notifications: data || [], isLoading: false });
        } catch (err: any) {
          console.error("Error fetching notifications:", err);
          set({
            error: err.message || "Failed to fetch notifications",
            isLoading: false,
          });
        }
      },

      addNotification: (notification) => {
        set((state) => ({
          notifications: [notification, ...state.notifications],
        }));
      },

      createNotification: async (notification) => {
        try {
          // Use secure system function for notification creation
          const { error } = await supabase.rpc("create_system_notification", {
            p_user_id: notification.user_id,
            p_title: notification.title,
            p_body: notification.body,
            p_type: notification.type || null,
            p_resource_id: notification.resource_id || null,
            p_image: notification.image || null,
          });

          if (error) throw error;

          // Don't add to local state here - let realtime handle it
        } catch (err: any) {
          console.error("Error creating notification:", err);
          toast.error("Failed to create notification");
        }
      },

      markAsRead: async (notificationId: string) => {
        try {
          const { error } = await supabase
            .from("notifications")
            .update({ read: true, updated_at: new Date().toISOString() })
            .eq("id", notificationId);

          if (error) throw error;

          // Update local state
          set((state) => ({
            notifications: state.notifications.map((notification) =>
              notification.id === notificationId
                ? { ...notification, read: true }
                : notification
            ),
          }));
        } catch (err: any) {
          console.error("Error marking notification as read:", err);
          toast.error("Failed to mark notification as read");
        }
      },

      markAllAsRead: async (userId: string) => {
        try {
          const { error } = await supabase
            .from("notifications")
            .update({ read: true, updated_at: new Date().toISOString() })
            .eq("user_id", userId)
            .eq("read", false);

          if (error) throw error;

          // Update local state
          set((state) => ({
            notifications: state.notifications.map((notification) => ({
              ...notification,
              read: true,
            })),
          }));

          toast.success("All notifications marked as read");
        } catch (err: any) {
          console.error("Error marking all notifications as read:", err);
          toast.error("Failed to mark all notifications as read");
        }
      },

      deleteNotification: async (notificationId: string) => {
        try {
          const { error } = await supabase
            .from("notifications")
            .delete()
            .eq("id", notificationId);

          if (error) throw error;

          // Update local state
          set((state) => ({
            notifications: state.notifications.filter(
              (notification) => notification.id !== notificationId
            ),
          }));

          toast.success("Notification deleted");
        } catch (err: any) {
          console.error("Error deleting notification:", err);
          toast.error("Failed to delete notification");
        }
      },

      subscribeToNotifications: (userId: string) => {
        // Unsubscribe from existing channel if any
        get().unsubscribeFromNotifications();

        const channel = supabase
          .channel(`notifications:${userId}`)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "notifications",
              filter: `user_id=eq.${userId}`,
            },
            (payload) => {
              const newNotification = payload.new as Notification;

              // Add to local state
              get().addNotification(newNotification);

              // Show clickable toast notification with navigation
              toast.success(newNotification.title, {
                description: newNotification.body,
                action: newNotification.type
                  ? {
                      label: "View",
                      onClick: () => {
                        // We'll handle navigation in the component that has access to router
                        // For now, just store the notification to navigate to
                        (window as any).pendingNotificationNavigation =
                          newNotification;
                        // Dispatch a custom event that components can listen to
                        window.dispatchEvent(
                          new CustomEvent("navigateToNotification", {
                            detail: newNotification,
                          })
                        );
                      },
                    }
                  : undefined,
              });
            }
          )
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "notifications",
              filter: `user_id=eq.${userId}`,
            },
            (payload) => {
              const updatedNotification = payload.new as Notification;

              // Update local state
              set((state) => ({
                notifications: state.notifications.map((notification) =>
                  notification.id === updatedNotification.id
                    ? updatedNotification
                    : notification
                ),
              }));
            }
          )
          .on(
            "postgres_changes",
            {
              event: "DELETE",
              schema: "public",
              table: "notifications",
              filter: `user_id=eq.${userId}`,
            },
            (payload) => {
              const deletedNotification = payload.old as Notification;

              // Remove from local state
              set((state) => ({
                notifications: state.notifications.filter(
                  (notification) => notification.id !== deletedNotification.id
                ),
              }));
            }
          )
          .subscribe();

        set({ realtimeChannel: channel });
      },

      unsubscribeFromNotifications: () => {
        const { realtimeChannel } = get();
        if (realtimeChannel) {
          supabase.removeChannel(realtimeChannel);
          set({ realtimeChannel: null });
        }
      },

      navigateToNotification: async (
        notification: Notification,
        isAdmin: boolean,
        router: any
      ) => {
        try {
          // Mark as read when navigating
          if (!notification.read) {
            await get().markAsRead(notification.id);
          }

          // Navigate to the appropriate route
          const route = getNotificationRoute(notification, { isAdmin });
          router.push(route);
        } catch (error) {
          console.error("Error navigating to notification:", error);
          toast.error("Failed to navigate to notification");
        }
      },
    }),
    {
      name: "notifications-storage",
      storage: createJSONStorage(() => localStorage),
      // Exclude realtimeChannel from persistence to avoid circular JSON structure
      partialize: (state) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { realtimeChannel, ...persistedState } = state;
        return persistedState;
      },
    }
  )
);

// Optional: Persist store (if needed)
// import { persist, createJSONStorage } from 'zustand/middleware';
//
// export const useNotificationsStore = create(
//   persist<NotificationsState & NotificationsActions>(
//     (set, get) => ({
//       // ... store definition ...
//     }),
//     {
//       name: 'notifications-storage', // unique name
//       storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
//     }
//   )
// );
