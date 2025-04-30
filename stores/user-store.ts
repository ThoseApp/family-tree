import { create } from "zustand";
import { createJSONStorage, persist, StorageValue } from "zustand/middleware";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";

interface UserStore {
  user: User | null;
  loading: boolean;
  success: boolean | null;
  error: string | null;

  login: (email: string, password: string, nextRoute: string) => Promise<any>;
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
      login: async (email, password, nextRoute) => {
        set({ loading: true, success: null });

        try {
          // const user = await ApiService.login(email, password);
          // STIMULATE LOADING
          await new Promise((resolve) => setTimeout(resolve, 2000));

          const user = {
            id: "1",
            email: email,
            name: "John Doe",
          };

          set({ success: true, loading: false });
          toast.success("Login successful");
          return { data: { user }, path: nextRoute || "/dashboard" };
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || "Login failed";
          set({ error: errorMessage, success: null });
          toast.error(errorMessage);
          return null;
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: "user-stotage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => {
        const { user } = state;
        return {
          ...initialState,
          user,

          login: () => Promise.resolve(),
        };
      },
    }
  )
);
