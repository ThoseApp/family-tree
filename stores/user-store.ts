import { create } from "zustand";
import { createJSONStorage, persist, StorageValue } from "zustand/middleware";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface UserStore {
  user: User | null;
  loading: boolean;
  success: boolean | null;
  error: string | null;

  signUp: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    dateOfBirth?: Date;
    relative?: string;
    relationshipToRelative?: string;
  }) => Promise<any>;
  login: (email: string, password: string, nextRoute: string) => Promise<any>;
  logout: () => Promise<void>;
  passwordReset: (email: string) => Promise<any>;
  emailVerification: (email: string) => Promise<any>;
  verifyOtp: (email: string, code: string) => Promise<any>;
}

const initialState = {
  user: null,
  loading: false,
  success: false,
  error: null,
  passwordReset: async (email: string) => {},
  emailVerification: async (email: string) => {},
  verifyOtp: async (email: string, code: string) => {},
};

export const useUserStore = create(
  persist<UserStore>(
    (set, get) => ({
      ...initialState,
      login: async (email, password, nextRoute) => {
        set({ loading: true, success: null, error: null });
        const supabase = createClient();

        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;

          set({ user: data.user, success: true, loading: false });
          toast.success("Login successful");
          return { data, path: nextRoute || "/dashboard" };
        } catch (error: any) {
          const errorMessage = error?.message || "Login failed";
          set({ error: errorMessage, success: null });
          toast.error(errorMessage);
          return null;
        } finally {
          set({ loading: false });
        }
      },

      signUp: async (userData) => {
        const {
          email,
          password,
          firstName,
          lastName,
          phoneNumber,
          dateOfBirth,
          relative,
          relationshipToRelative,
        } = userData;
        set({ loading: true, success: null, error: null });
        const supabase = createClient();

        try {
          // First register the user with Supabase Auth
          const { data: authData, error: authError } =
            await supabase.auth.signUp({
              email,
              password,
              options: {
                data: {
                  first_name: firstName,
                  last_name: lastName,
                  full_name: `${firstName} ${lastName}`,
                  phone_number: phoneNumber || null,
                  date_of_birth: dateOfBirth ? dateOfBirth.toISOString() : null,
                  relationship_to_relative: relationshipToRelative || null,
                },
              },
            });

          if (authError) throw authError;

          // Then insert the user profile into a profiles table (if you have one)
          if (authData.user) {
            const { error: profileError } = await supabase
              .from("profiles")
              .upsert({
                id: authData.user.id,
                first_name: firstName,
                last_name: lastName,
                email: email,
                phone_number: phoneNumber || null,
                date_of_birth: dateOfBirth ? dateOfBirth.toISOString() : null,
                relative: relative || null,
                relationship_to_relative: relationshipToRelative || null,
              });

            if (profileError) {
              console.error("Error creating profile:", profileError);
              // Continue anyway since the auth account was created
            }
          }

          set({ success: true, loading: false });
          toast.success(
            "Sign up successful! Check your email for verification."
          );
          return { data: authData };
        } catch (error: any) {
          const errorMessage = error?.message || "Sign up failed";
          set({ error: errorMessage, success: null });
          toast.error(errorMessage);
          return null;
        } finally {
          set({ loading: false });
        }
      },

      logout: async () => {
        set({ loading: true, success: null, error: null });
        const supabase = createClient();

        try {
          const { error } = await supabase.auth.signOut();

          if (error) throw error;

          set({ user: null, success: true, loading: false });
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
        set({ loading: true, success: null, error: null });
        const supabase = createClient();

        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-password`,
          });

          if (error) throw error;

          set({ success: true, loading: false });
          toast.success("Password reset email sent successfully");
          return { message: "Password reset email sent" };
        } catch (error: any) {
          const errorMessage = error?.message || "Password reset failed";
          set({ error: errorMessage, success: null });
          toast.error(errorMessage);
          return null;
        } finally {
          set({ loading: false });
        }
      },

      emailVerification: async (email) => {
        set({ loading: true, success: null, error: null });
        const supabase = createClient();

        try {
          const { error } = await supabase.auth.resend({
            type: "signup",
            email,
          });

          if (error) throw error;

          set({ success: true, loading: false });
          toast.success("Verification email sent successfully");
          return { message: "Verification email sent" };
        } catch (error: any) {
          const errorMessage = error?.message || "Email verification failed";
          set({ error: errorMessage, success: null });
          toast.error(errorMessage);
          return null;
        } finally {
          set({ loading: false });
        }
      },

      verifyOtp: async (email, code) => {
        set({ loading: true, success: null, error: null });
        const supabase = createClient();

        try {
          const { error } = await supabase.auth.verifyOtp({
            email,
            token: code,
            type: "signup",
          });

          if (error) throw error;

          set({ success: true, loading: false });
          return { success: true };
        } catch (error: any) {
          const errorMessage = error?.message || "Invalid verification code";
          set({ error: errorMessage, success: null });
          return { error: errorMessage };
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
          verifyOtp: () => Promise.resolve(),
        };
      },
    }
  )
);
