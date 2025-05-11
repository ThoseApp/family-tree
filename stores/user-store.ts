import { create } from "zustand";
import { createJSONStorage, persist, StorageValue } from "zustand/middleware";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";

interface UserStore {
  user: User | null;
  loading: boolean;
  success: boolean | null;
  error: string | null;

  signUp: (email: string, password: string) => Promise<any>;
  login: (email: string, password: string, nextRoute: string) => Promise<any>;
  logout: () => Promise<void>;
  passwordReset: (email: string) => Promise<any>;
  emailVerification: (email: string) => Promise<any>;
}

const initialState = {
  user: null,
  loading: false,
  success: false,
  error: null,
  passwordReset: async (email: string) => {},
  emailVerification: async (email: string) => {},
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
      signUp: async (email, password) => {
        set({ loading: true, success: null });
        try {
          // const user = await ApiService.signUp(email, password);
          // STIMULATE LOADING
          await new Promise((resolve) => setTimeout(resolve, 2000));

          const user = {
            id: "1",
            email: email,
            name: "John Doe",
          };

          set({ success: true, loading: false });
          toast.success("Sign up successful");
          return { data: { user } };
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.message || "Sign up failed";
          set({ error: errorMessage, success: null });
          toast.error(errorMessage);
          return null;
        } finally {
          set({ loading: false });
        }
      },
      logout: async () => {
        set({ loading: true, success: null });
        try {
          // const user = await ApiService.logout();
          // STIMULATE LOADING
          await new Promise((resolve) => setTimeout(resolve, 2000));

          set({ ...initialState });
          toast.success("Logged out successfully");
        } catch (error: any) {
          const errorMessage = error.message || "Logout failed";
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
        } finally {
          set({ loading: false });
        }
      },
      passwordReset: async (email) => {
        set({ loading: true, success: null });
        try {
          // STIMULATE LOADING
          await new Promise((resolve) => setTimeout(resolve, 2000));

          // TODO: Implement actual password reset logic here
          console.log(`Password reset requested for ${email}`);

          set({ success: true, loading: false });
          toast.success("Password reset email sent successfully");
          return { message: "Password reset email sent" };
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.message || "Password reset failed";
          set({ error: errorMessage, success: null });
          toast.error(errorMessage);
          return null;
        } finally {
          set({ loading: false });
        }
      },
      emailVerification: async (email) => {
        set({ loading: true, success: null });
        try {
          // STIMULATE LOADING
          await new Promise((resolve) => setTimeout(resolve, 2000));

          // TODO: Implement actual email verification logic here
          console.log(`Email verification requested for ${email}`);

          set({ success: true, loading: false });
          toast.success("Verification email sent successfully");
          return { message: "Verification email sent" };
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.message || "Email verification failed";
          set({ error: errorMessage, success: null });
          toast.error(errorMessage);
          return null;
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: "user-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => {
        const { user } = state;
        return {
          ...initialState,
          user,

          login: () => Promise.resolve(),
          signUp: () => Promise.resolve(),
          logout: () => Promise.resolve(),
          passwordReset: () => Promise.resolve(),
          emailVerification: () => Promise.resolve(),
        };
      },
    }
  )
);
