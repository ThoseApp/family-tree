import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { FamilyMember, ProcessedMember } from "@/lib/types";
import {
  fetchFamilyMembers as fetchFamilyMembersAPI,
  addFamilyMember as addFamilyMemberAPI,
  updateFamilyMember as updateFamilyMemberAPI,
  deleteFamilyMember as deleteFamilyMemberAPI,
  processedMemberToFamilyMember,
} from "@/lib/utils/family-tree-helpers";

interface FamilyMembersState {
  familyMembers: FamilyMember[];
  isLoading: boolean;
  error: string | null;
}

interface FamilyMembersActions {
  fetchFamilyMembers: () => Promise<void>;
  addFamilyMember: (member: Omit<FamilyMember, "id">) => Promise<void>;
  updateFamilyMember: (
    memberId: string,
    updates: Partial<FamilyMember>
  ) => Promise<void>;
  removeFamilyMember: (memberId: string) => Promise<void>;
  setFamilyMembers: (members: FamilyMember[]) => void;
  clearError: () => void;
}

const initialState: FamilyMembersState = {
  familyMembers: [],
  isLoading: false,
  error: null,
};

export const useFamilyMembersStore = create(
  persist<FamilyMembersState & FamilyMembersActions>(
    (set, get) => ({
      ...initialState,

      fetchFamilyMembers: async () => {
        set({ isLoading: true, error: null });
        try {
          const processedMembers = await fetchFamilyMembersAPI();
          const familyMembers = processedMembers.map(
            processedMemberToFamilyMember
          );
          set({ familyMembers, isLoading: false });
        } catch (err: any) {
          set({
            error: err.message || "Failed to fetch family members",
            isLoading: false,
          });
        }
      },

      addFamilyMember: async (member) => {
        set({ isLoading: true, error: null });
        try {
          const addedMember = await addFamilyMemberAPI(member);
          const familyMember = processedMemberToFamilyMember(addedMember);

          set((state) => ({
            familyMembers: [familyMember, ...state.familyMembers],
            isLoading: false,
          }));
        } catch (err: any) {
          set({
            error: err.message || "Failed to add family member",
            isLoading: false,
          });
          throw err; // Re-throw to allow UI to handle
        }
      },

      updateFamilyMember: async (memberId, updates) => {
        set({ isLoading: true, error: null });
        try {
          const updatedMember = await updateFamilyMemberAPI(memberId, updates);
          const familyMember = processedMemberToFamilyMember(updatedMember);

          set((state) => ({
            familyMembers: state.familyMembers.map((member) =>
              member.id === memberId ? familyMember : member
            ),
            isLoading: false,
          }));
        } catch (err: any) {
          set({
            error: err.message || "Failed to update family member",
            isLoading: false,
          });
          throw err; // Re-throw to allow UI to handle
        }
      },

      removeFamilyMember: async (memberId) => {
        set({ isLoading: true, error: null });
        try {
          await deleteFamilyMemberAPI(memberId);

          set((state) => ({
            familyMembers: state.familyMembers.filter(
              (member) => member.id !== memberId
            ),
            isLoading: false,
          }));
        } catch (err: any) {
          set({
            error: err.message || "Failed to remove family member",
            isLoading: false,
          });
          throw err; // Re-throw to allow UI to handle
        }
      },

      setFamilyMembers: (members) => {
        set({ familyMembers: members });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "family-members-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Optional: Persist store (if needed)
// import { persist, createJSONStorage } from 'zustand/middleware';
//
// export const useFamilyMembersStore = create(
//   persist<FamilyMembersState & FamilyMembersActions>(
//     (set, get) => ({
//       // ... store definition ...
//     }),
//     {
//       name: 'family-members-storage', // unique name
//       storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
//     }
//   )
// );
