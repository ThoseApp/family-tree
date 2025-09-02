import { create } from "zustand";
import { supabase } from "@/lib/supabase/client";
import { FamilyMemberRequest } from "@/lib/types";
import { toast } from "sonner";

interface FamilyMemberRequestsState {
  requests: FamilyMemberRequest[];
  isLoading: boolean;
  error: string | null;
  fetchRequests: () => Promise<void>;
  approveRequest: (requestId: string) => Promise<void>;
  rejectRequest: (requestId: string) => Promise<void>;
}

export const useFamilyMemberRequestsStore = create<FamilyMemberRequestsState>(
  (set) => ({
    requests: [],
    isLoading: false,
    error: null,
    fetchRequests: async () => {
      set({ isLoading: true, error: null });
      try {
        const { data, error } = await supabase
          .from("family_member_requests")
          .select("*")
          // .eq("status", "pending")
          .order("created_at", { ascending: false });

        if (error) throw error;
        set({ requests: data, isLoading: false });
      } catch (err: any) {
        const errorMessage =
          err.message || "Failed to fetch family member requests";
        set({ error: errorMessage, isLoading: false });
        toast.error(errorMessage);
      }
    },
    approveRequest: async (requestId: string) => {
      set({ isLoading: true, error: null });
      try {
        const { data: request, error: fetchError } = await supabase
          .from("family_member_requests")
          .select("*")
          .eq("id", requestId)
          .single();

        if (fetchError) throw fetchError;

        const { error: insertError } = await supabase
          .from("family-tree")
          .insert([
            {
              first_name: request.first_name,
              last_name: request.last_name,
              gender: request.gender,
              picture_link: request.picture_link,
              date_of_birth: request.date_of_birth,
              marital_status: request.marital_status,
              // Map other fields
            },
          ]);

        if (insertError) throw insertError;

        const { error: updateError } = await supabase
          .from("family_member_requests")
          .update({ status: "approved" })
          .eq("id", requestId);

        if (updateError) throw updateError;

        set((state) => ({
          requests: state.requests.filter((r) => r.id !== requestId),
          isLoading: false,
        }));
        toast.success("Request approved and family member added.");
      } catch (err: any) {
        const errorMessage = err.message || "Failed to approve request.";
        set({ error: errorMessage, isLoading: false });
        toast.error(errorMessage);
      }
    },
    rejectRequest: async (requestId: string) => {
      set({ isLoading: true, error: null });
      try {
        const { error } = await supabase
          .from("family_member_requests")
          .update({ status: "rejected" })
          .eq("id", requestId);

        if (error) throw error;

        set((state) => ({
          requests: state.requests.filter((r) => r.id !== requestId),
          isLoading: false,
        }));
        toast.success("Request rejected.");
      } catch (err: any) {
        const errorMessage = err.message || "Failed to reject request.";
        set({ error: errorMessage, isLoading: false });
        toast.error(errorMessage);
      }
    },
  })
);
