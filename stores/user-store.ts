import { create } from "zustand";
import { createJSONStorage, persist, StorageValue } from "zustand/middleware";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";

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
    isAdmin?: boolean;
  }) => Promise<any>;
  login: (email: string, password: string, nextRoute: string) => Promise<any>;
  loginWithGoogle: (redirectTo?: string) => Promise<any>;
  logout: () => Promise<void>;
  passwordReset: (email: string) => Promise<any>;
  emailVerification: (email: string) => Promise<any>;
  verifyOtp: (email: string, code: string) => Promise<any>;
  updateProfile: (profileData: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    bio?: string;
  }) => Promise<any>;
  updatePassword: (password: string) => Promise<any>;
  getUserProfile: () => Promise<any>;
  resetPasswordWithToken: (token: string, password: string) => Promise<any>;
}

const initialState = {
  user: null,
  loading: false,
  success: false,
  error: null,
  passwordReset: async (email: string) => {},
  emailVerification: async (email: string) => {},
  verifyOtp: async (email: string, code: string) => {},
  updateProfile: async (profileData: any) => {},
  updatePassword: async (password: string) => {},
  getUserProfile: async () => {},
  resetPasswordWithToken: async (token: string, password: string) => {},
  loginWithGoogle: async (redirectTo?: string) => {},
};

export const useUserStore = create(
  persist<UserStore>(
    (set, get) => ({
      ...initialState,
      login: async (email, password, nextRoute) => {
        set({ loading: true, success: null, error: null });

        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;

          // Check user approval status
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("status")
            .eq("user_id", data.user.id)
            .single();

          if (profileError) {
            console.error("Error fetching user profile:", profileError);
            throw new Error("Unable to verify account status");
          }

          // Check if user is approved
          if (profile.status === "pending") {
            await supabase.auth.signOut(); // Sign out the user
            throw new Error(
              "Your account is pending approval. Please wait for admin approval."
            );
          }

          if (profile.status === "rejected") {
            await supabase.auth.signOut(); // Sign out the user
            throw new Error(
              "Your account has been rejected. Please contact support."
            );
          }

          set({ user: data.user, success: true, loading: false });
          toast.success("Login successful");

          return {
            data,
            path:
              (nextRoute && nextRoute.trim()) ||
              (data.user.user_metadata?.is_admin ? "/admin" : "/dashboard"),
          };
        } catch (error: any) {
          const errorMessage = error?.message || "Login failed";
          set({ error: errorMessage, success: null });
          toast.error(errorMessage);
          return null;
        } finally {
          set({ loading: false });
        }
      },

      loginWithGoogle: async (redirectTo) => {
        set({ loading: true, success: null, error: null });

        try {
          // Determine redirect URL - auth callback will handle admin vs user routing
          const redirectURL =
            redirectTo || `${window.location.origin}/auth/callback`;

          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
              redirectTo: redirectURL,
              queryParams: {
                access_type: "offline",
                prompt: "consent",
              },
            },
          });

          if (error) throw error;

          // Note: This won't actually set the user since the page will redirect to Google
          // The user will be set when they return from the OAuth flow in the auth callback
          return { data, success: true };
        } catch (error: any) {
          const errorMessage = error?.message || "Google sign-in failed";
          set({ error: errorMessage, success: null, loading: false });
          toast.error(errorMessage);
          return null;
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
          isAdmin = false,
        } = userData;
        set({ loading: true, success: null, error: null });

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
                  date_of_birth: dateOfBirth ? dateOfBirth.toISOString() : null,
                  is_admin: isAdmin,
                },
              },
            });

          if (authError) throw authError;

          // Then insert the user profile into a profiles table (if you have one)
          if (authData.user) {
            const { error: profileError } = await supabase
              .from("profiles")
              .upsert({
                user_id: authData.user.id,
                first_name: firstName,
                last_name: lastName,
                email: email,
                phone_number: phoneNumber || null,
                date_of_birth: dateOfBirth ? dateOfBirth.toISOString() : null,
                relative: relative || null,
                relationship_to_relative: relationshipToRelative || null,
                status: isAdmin ? "approved" : "pending", // Set status based on admin flag
              });

            if (profileError) {
              console.error("Error creating profile:", profileError);
              // Continue anyway since the auth account was created
            }
          }

          set({ success: true, loading: false });
          const successMessage = isAdmin
            ? "Admin account created successfully! Check your email for verification."
            : "Sign up successful! Your account is pending admin approval. You'll be able to login once approved.";
          toast.success(successMessage);
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

        try {
          const { error } = await supabase.auth.signOut();

          if (error) throw error;

          set({ user: null, success: true, loading: false });
          toast.success("Logged out successfully");
          window.location.href = "/sign-in";
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

        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
          });

          if (error) throw error;

          set({ success: true, loading: false });
          toast.success("Password reset email sent successfully");
          return { success: true, message: "Password reset email sent" };
        } catch (error: any) {
          const errorMessage = error?.message || "Password reset failed";
          set({ error: errorMessage, success: null });
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        } finally {
          set({ loading: false });
        }
      },

      resetPasswordWithToken: async (token, password) => {
        set({ loading: true, success: null, error: null });

        try {
          // For Supabase, the token is already handled in the URL parameters automatically
          // when user clicks the reset password link in their email.
          // We just need to call updateUser with the new password
          const { error } = await supabase.auth.updateUser({
            password: password,
          });

          if (error) throw error;

          set({ success: true, loading: false });
          toast.success("Password reset successfully");
          return { success: true };
        } catch (error: any) {
          const errorMessage = error?.message || "Password reset failed";
          set({ error: errorMessage, success: null });
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        } finally {
          set({ loading: false });
        }
      },

      emailVerification: async (email) => {
        set({ loading: true, success: null, error: null });

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

        try {
          const { data, error } = await supabase.auth.verifyOtp({
            email,
            token: code,
            type: "signup",
          });

          if (error) throw error;

          set({ success: true, user: data.user, loading: false });
          return { success: true };
        } catch (error: any) {
          const errorMessage = error?.message || "Invalid verification code";
          set({ error: errorMessage, success: null });
          return { error: errorMessage };
        } finally {
          set({ loading: false });
        }
      },

      getUserProfile: async () => {
        const { user } = get();
        if (!user) {
          return null;
        }

        set({ loading: true, error: null });

        console.log("get profile with id", user.id);

        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", user.id)
            .single();

          console.log("[getUserProfile] data", data);

          if (error) throw error;

          console.log("[getUserProfile] data", data);

          return data;
        } catch (error: any) {
          const errorMessage = error?.message || "Failed to fetch user profile";
          set({ error: errorMessage });
          return null;
        } finally {
          set({ loading: false });
        }
      },

      updateProfile: async (profileData) => {
        const { user } = get();
        if (!user) {
          toast.error("You must be logged in to update your profile");
          return null;
        }

        set({ loading: true, success: null, error: null });

        try {
          // Update user metadata in auth
          const { error: authError } = await supabase.auth.updateUser({
            data: {
              first_name: profileData.firstName,
              last_name: profileData.lastName,
              full_name:
                profileData.firstName && profileData.lastName
                  ? `${profileData.firstName} ${profileData.lastName}`
                  : undefined,
              phone_number: profileData.phoneNumber,
              date_of_birth: profileData.dateOfBirth,
            },
          });

          if (authError) throw authError;

          // Update profile in profiles table
          const { error: profileError } = await supabase
            .from("profiles")
            .update({
              first_name: profileData.firstName,
              last_name: profileData.lastName,
              phone_number: profileData.phoneNumber,
              date_of_birth: profileData.dateOfBirth,
              bio: profileData.bio,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", user.id);

          if (profileError) throw profileError;

          set({ success: true, loading: false });
          toast.success("Profile updated successfully");
          return { success: true };
        } catch (error: any) {
          const errorMessage = error?.message || "Failed to update profile";
          set({ error: errorMessage, success: null });
          toast.error(errorMessage);
          return { error: errorMessage };
        } finally {
          set({ loading: false });
        }
      },

      updatePassword: async (password) => {
        const { user } = get();
        if (!user) {
          toast.error("You must be logged in to update your password");
          return null;
        }

        set({ loading: true, success: null, error: null });

        try {
          const { error } = await supabase.auth.updateUser({
            password,
          });

          if (error) throw error;

          set({ success: true, loading: false });
          toast.success("Password updated successfully");
          return { success: true };
        } catch (error: any) {
          const errorMessage = error?.message || "Failed to update password";
          set({ error: errorMessage, success: null });
          toast.error(errorMessage);
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
          updateProfile: () => Promise.resolve(),
          updatePassword: () => Promise.resolve(),
          getUserProfile: () => Promise.resolve(),
          resetPasswordWithToken: () => Promise.resolve(),
        };
      },
    }
  )
);
