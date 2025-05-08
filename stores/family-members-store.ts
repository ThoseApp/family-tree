import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// TODO: Define a more specific type for FamilyMember if available
interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  // Add other relevant properties, e.g., birthDate, contactInfo, etc.
}

interface FamilyMembersState {
  familyMembers: FamilyMember[];
  isLoading: boolean;
  error: string | null;
}

interface FamilyMembersActions {
  fetchFamilyMembers: () => Promise<void>;
  addFamilyMember: (member: Omit<FamilyMember, "id">) => Promise<void>; // Assuming ID is generated on add
  updateFamilyMember: (
    memberId: string,
    updates: Partial<FamilyMember>
  ) => Promise<void>;
  removeFamilyMember: (memberId: string) => Promise<void>;
}

const initialState: FamilyMembersState = {
  familyMembers: [],
  isLoading: false,
  error: null,
};

export const useFamilyMembersStore = create(
  persist<FamilyMembersState & FamilyMembersActions>(
    (set) => ({
      ...initialState,
      fetchFamilyMembers: async () => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const mockFamilyMembers: FamilyMember[] = [
            { id: "1", name: "John Doe", relationship: "Father" },
            { id: "2", name: "Jane Doe", relationship: "Mother" },
          ]; // Replace with actual API call
          set({ familyMembers: mockFamilyMembers, isLoading: false });
        } catch (err: any) {
          set({
            error: err.message || "Failed to fetch family members",
            isLoading: false,
          });
        }
      },
      addFamilyMember: async (member) => {
        set({ isLoading: true });
        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const newMember: FamilyMember = {
            ...member,
            id: Date.now().toString(),
          }; // Example ID generation
          set((state) => ({
            familyMembers: [...state.familyMembers, newMember],
            isLoading: false,
          }));
        } catch (err: any) {
          set({
            error: err.message || "Failed to add family member",
            isLoading: false,
          });
        }
      },
      updateFamilyMember: async (memberId, updates) => {
        set({ isLoading: true });
        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1000));
          set((state) => ({
            familyMembers: state.familyMembers.map((member) =>
              member.id === memberId ? { ...member, ...updates } : member
            ),
            isLoading: false,
          }));
        } catch (err: any) {
          set({
            error: err.message || "Failed to update family member",
            isLoading: false,
          });
        }
      },
      removeFamilyMember: async (memberId) => {
        set({ isLoading: true });
        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1000));
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
        }
      },
    }),
    {
      name: "family-members-storage", // unique name
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
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
