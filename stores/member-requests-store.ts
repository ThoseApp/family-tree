import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { MemberRequest } from "@/lib/types";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

interface MemberRequestsStore {
  memberRequests: MemberRequest[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchMemberRequests: () => Promise<void>;
  approveMemberRequest: (
    userId: string,
    adminNotes?: string
  ) => Promise<boolean>;
  rejectMemberRequest: (
    userId: string,
    adminNotes?: string
  ) => Promise<boolean>;
  getMemberRequestsCount: () => Promise<number>;
  clearError: () => void;
  refreshRequests: () => Promise<void>;

  // Bulk operations
  approveBulkRequests: (userIds: string[]) => Promise<number>;
  rejectBulkRequests: (userIds: string[]) => Promise<number>;
}

const initialState = {
  memberRequests: [],
  loading: false,
  error: null,
};

export const useMemberRequestsStore = create<MemberRequestsStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      fetchMemberRequests: async () => {
        set({ loading: true, error: null });

        try {
          // Get pending member requests
          const { data: memberRequests, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("status", "pending")
            .order("created_at", { ascending: false });

          if (error) {
            throw error;
          }

          set({
            memberRequests: memberRequests || [],
            loading: false,
          });
        } catch (error: any) {
          const errorMessage =
            error?.message || "Failed to fetch member requests";
          set({
            error: errorMessage,
            loading: false,
            memberRequests: [],
          });
          toast.error(errorMessage);
        }
      },

      approveMemberRequest: async (userId: string, adminNotes?: string) => {
        set({ loading: true, error: null });

        try {
          // Update the profile status to approved
          const { data, error } = await supabase
            .from("profiles")
            .update({
              status: "approved",
              admin_notes: adminNotes || null,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId)
            .select()
            .single();

          if (error) {
            throw error;
          }

          // Remove the approved request from the local state
          const currentRequests = get().memberRequests;
          const updatedRequests = currentRequests.filter(
            (request) => request.user_id !== userId
          );

          set({
            memberRequests: updatedRequests,
            loading: false,
          });

          toast.success("Member request approved successfully");
          return true;
        } catch (error: any) {
          const errorMessage =
            error?.message || "Failed to approve member request";
          set({
            error: errorMessage,
            loading: false,
          });
          toast.error(errorMessage);
          return false;
        }
      },

      rejectMemberRequest: async (userId: string, adminNotes?: string) => {
        set({ loading: true, error: null });

        try {
          // Update the profile status to rejected
          const { data, error } = await supabase
            .from("profiles")
            .update({
              status: "rejected",
              admin_notes: adminNotes || null,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId)
            .select()
            .single();

          if (error) {
            throw error;
          }

          // Remove the rejected request from the local state
          const currentRequests = get().memberRequests;
          const updatedRequests = currentRequests.filter(
            (request) => request.user_id !== userId
          );

          set({
            memberRequests: updatedRequests,
            loading: false,
          });

          toast.success("Member request rejected successfully");
          return true;
        } catch (error: any) {
          const errorMessage =
            error?.message || "Failed to reject member request";
          set({
            error: errorMessage,
            loading: false,
          });
          toast.error(errorMessage);
          return false;
        }
      },

      getMemberRequestsCount: async () => {
        try {
          const { count, error } = await supabase
            .from("profiles")
            .select("*", { count: "exact", head: true })
            .eq("status", "pending");

          if (error) {
            throw error;
          }

          return count || 0;
        } catch (error: any) {
          console.error("Error fetching member requests count:", error);
          return 0;
        }
      },

      clearError: () => {
        set({ error: null });
      },

      refreshRequests: async () => {
        await get().fetchMemberRequests();
      },

      // Bulk operations
      approveBulkRequests: async (userIds: string[]) => {
        set({ loading: true, error: null });

        try {
          const approvePromises = userIds.map((userId) =>
            get().approveMemberRequest(userId)
          );

          const results = await Promise.all(approvePromises);
          const successCount = results.filter((result) => result).length;

          if (successCount === userIds.length) {
            toast.success(
              `Approved ${successCount} member request${
                successCount !== 1 ? "s" : ""
              }`
            );
          } else {
            toast.warning(
              `Approved ${successCount} out of ${userIds.length} requests`
            );
          }

          set({ loading: false });
          return successCount;
        } catch (error: any) {
          const errorMessage = "Failed to approve bulk requests";
          set({
            error: errorMessage,
            loading: false,
          });
          toast.error(errorMessage);
          return 0;
        }
      },

      rejectBulkRequests: async (userIds: string[]) => {
        set({ loading: true, error: null });

        try {
          const rejectPromises = userIds.map((userId) =>
            get().rejectMemberRequest(userId)
          );

          const results = await Promise.all(rejectPromises);
          const successCount = results.filter((result) => result).length;

          if (successCount === userIds.length) {
            toast.success(
              `Rejected ${successCount} member request${
                successCount !== 1 ? "s" : ""
              }`
            );
          } else {
            toast.warning(
              `Rejected ${successCount} out of ${userIds.length} requests`
            );
          }

          set({ loading: false });
          return successCount;
        } catch (error: any) {
          const errorMessage = "Failed to reject bulk requests";
          set({
            error: errorMessage,
            loading: false,
          });
          toast.error(errorMessage);
          return 0;
        }
      },
    }),
    {
      name: "member-requests-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist member requests data, not loading/error states
        memberRequests: state.memberRequests,
      }),
    }
  )
);
