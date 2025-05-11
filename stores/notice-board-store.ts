import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface NoticeBoardState {
  // TODO: Define your state properties here
  notices: any[]; // Example property
  isLoading: boolean;
  error: string | null;
}

interface NoticeBoardActions {
  // TODO: Define your actions here
  fetchNotices: () => Promise<void>; // Example action
  addNotice: (notice: any) => void; // Example action
  updateNotice: (noticeId: string, updates: any) => void; // Example action
  deleteNotice: (noticeId: string) => void; // Example action
}

const initialState: NoticeBoardState = {
  notices: [],
  isLoading: false,
  error: null,
};

export const useNoticeBoardStore = create(
  persist<NoticeBoardState & NoticeBoardActions>(
    (set) => ({
      ...initialState,
      fetchNotices: async () => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const mockNotices = [
            {
              id: "1",
              title: "Community Meeting",
              content: "Meeting next Tuesday at 7 PM.",
            },
          ]; // Replace with actual API call
          set({ notices: mockNotices, isLoading: false });
        } catch (err: any) {
          set({
            error: err.message || "Failed to fetch notices",
            isLoading: false,
          });
        }
      },
      addNotice: (notice) => {
        set((state) => ({
          notices: [...state.notices, notice],
        }));
      },
      updateNotice: (noticeId, updates) => {
        set((state) => ({
          notices: state.notices.map((notice) =>
            notice.id === noticeId ? { ...notice, ...updates } : notice
          ),
        }));
      },
      deleteNotice: (noticeId) => {
        set((state) => ({
          notices: state.notices.filter((notice) => notice.id !== noticeId),
        }));
      },
      // TODO: Implement other actions
    }),
    {
      name: "notice-board-storage", // unique name
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);

// Optional: Persist store (if needed)
// import { persist, createJSONStorage } from 'zustand/middleware';
//
// export const useNoticeBoardStore = create(
//   persist<NoticeBoardState & NoticeBoardActions>(
//     (set, get) => ({
//       // ... store definition ...
//     }),
//     {
//       name: 'notice-board-storage', // unique name
//       storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
//     }
//   )
// );
