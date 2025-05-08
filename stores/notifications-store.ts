import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface NotificationsState {
  // TODO: Define your state properties here
  notifications: any[]; // Example property
  isLoading: boolean;
  error: string | null;
}

interface NotificationsActions {
  // TODO: Define your actions here
  fetchNotifications: () => Promise<void>; // Example action
  addNotification: (notification: any) => void; // Example action
}

const initialState: NotificationsState = {
  notifications: [],
  isLoading: false,
  error: null,
};

export const useNotificationsStore = create(
  persist<NotificationsState & NotificationsActions>(
    (set) => ({
      ...initialState,
      fetchNotifications: async () => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const mockNotifications = [{ id: 1, message: "New notification" }]; // Replace with actual API call
          set({ notifications: mockNotifications, isLoading: false });
        } catch (err: any) {
          set({
            error: err.message || "Failed to fetch notifications",
            isLoading: false,
          });
        }
      },
      addNotification: (notification) => {
        set((state) => ({
          notifications: [...state.notifications, notification],
        }));
      },
      // TODO: Implement other actions
    }),
    {
      name: "notifications-storage", // unique name
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
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
