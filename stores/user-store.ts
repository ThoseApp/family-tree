import { create } from "zustand";
import { createJSONStorage, persist, StorageValue } from "zustand/middleware";
import { User } from "@supabase/supabase-js";

interface UserStore {
  user: User | null;

  loading: boolean;
  success: boolean;
  error: string | null;
}

const initialState = {
  user: null,

  loading: false,
  success: false,
  error: null,
};

export const useUserStore = create(
  persist<UserStore>(
    (set, get) => ({
      ...initialState,
    }),

    {
      name: "user-stotage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => {
        const { user } = state;
        return {
          ...initialState,
          user,
        };
      },
    }
  )
);
