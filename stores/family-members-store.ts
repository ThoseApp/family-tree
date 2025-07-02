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
  clearStorage: () => void;
}

const initialState: FamilyMembersState = {
  familyMembers: [],
  isLoading: false,
  error: null,
};

// Custom storage with error handling and SSR safety
const createSafeStorage = () => {
  // Check if we're in a browser environment
  const isBrowser = typeof window !== "undefined";

  return {
    getItem: (name: string): string | null => {
      if (!isBrowser) {
        return null; // Return null on server to avoid errors
      }

      try {
        return localStorage.getItem(name);
      } catch (error) {
        console.warn("Failed to read from localStorage:", error);
        return null;
      }
    },
    setItem: (name: string, value: string): void => {
      if (!isBrowser) {
        return; // Skip storage on server
      }

      try {
        // Check storage size before setting
        const sizeInMB = new Blob([value]).size / (1024 * 1024);

        if (sizeInMB > 4) {
          // If larger than 4MB, don't store
          console.warn("Data too large for localStorage, skipping persistence");
          return;
        }

        localStorage.setItem(name, value);
      } catch (error) {
        if (
          error instanceof DOMException &&
          (error.code === 22 || // QuotaExceededError
            error.name === "QuotaExceededError" ||
            error.name === "NS_ERROR_DOM_QUOTA_REACHED")
        ) {
          console.warn("localStorage quota exceeded, clearing old data");

          // Try to clear some space and retry
          try {
            // Remove other potentially large items first
            const keysToTry = Object.keys(localStorage);
            for (const key of keysToTry) {
              if (key !== name && key.includes("storage")) {
                localStorage.removeItem(key);
                break;
              }
            }

            // Retry storage
            localStorage.setItem(name, value);
          } catch (retryError) {
            console.error(
              "Failed to store data even after cleanup:",
              retryError
            );
            // Clear the specific item if still failing
            localStorage.removeItem(name);
          }
        } else {
          console.error("Failed to write to localStorage:", error);
        }
      }
    },
    removeItem: (name: string): void => {
      if (!isBrowser) {
        return; // Skip removal on server
      }

      try {
        localStorage.removeItem(name);
      } catch (error) {
        console.warn("Failed to remove from localStorage:", error);
      }
    },
  };
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

      clearStorage: () => {
        // Check if we're in a browser environment
        if (typeof window === "undefined") {
          console.warn("Cannot clear storage on server side");
          return;
        }

        try {
          localStorage.removeItem("family-members-storage");
          console.log("Cleared family members storage");
        } catch (error) {
          console.warn("Failed to clear storage:", error);
        }
      },
    }),
    {
      name: "family-members-storage",
      storage: createJSONStorage(() => createSafeStorage()),
      version: 1,
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
