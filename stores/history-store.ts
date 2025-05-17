import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export interface HistoryItem {
  id: string;
  year: string;
  title: string;
  description: string;
  created_at?: string;
  updated_at?: string;
}

interface HistoryState {
  historyItems: HistoryItem[];
  isLoading: boolean;
  error: string | null;
}

interface HistoryActions {
  fetchHistory: () => Promise<HistoryItem[]>;
  addHistoryItem: (
    item: Omit<HistoryItem, "id">
  ) => Promise<HistoryItem | null>;
  updateHistoryItem: (
    id: string,
    item: Partial<Omit<HistoryItem, "id">>
  ) => Promise<HistoryItem | null>;
  deleteHistoryItem: (id: string) => Promise<boolean>;
}

const initialState: HistoryState = {
  historyItems: [],
  isLoading: false,
  error: null,
};

export const useHistoryStore = create(
  persist<HistoryState & HistoryActions>(
    (set, get) => ({
      ...initialState,
      fetchHistory: async () => {
        set({ isLoading: true, error: null });
        const supabase = createClient();

        try {
          const { data, error } = await supabase
            .from("history")
            .select("*")
            .order("year", { ascending: false });

          if (error) throw error;

          const historyItems = data as HistoryItem[];
          set({ historyItems, isLoading: false });
          return historyItems;
        } catch (err: any) {
          const errorMessage = err?.message || "Failed to fetch history";
          set({
            error: errorMessage,
            isLoading: false,
          });
          toast.error(errorMessage);
          return [];
        }
      },

      addHistoryItem: async (item) => {
        set({ isLoading: true, error: null });
        const supabase = createClient();

        try {
          const { data, error } = await supabase
            .from("history")
            .insert(item)
            .select()
            .single();

          if (error) throw error;

          const newItem = data as HistoryItem;
          set((state) => ({
            historyItems: [...state.historyItems, newItem],
            isLoading: false,
          }));

          toast.success("History item added successfully");
          return newItem;
        } catch (err: any) {
          const errorMessage = err?.message || "Failed to add history item";
          set({
            error: errorMessage,
            isLoading: false,
          });
          toast.error(errorMessage);
          return null;
        }
      },

      updateHistoryItem: async (id, updates) => {
        set({ isLoading: true, error: null });
        const supabase = createClient();

        try {
          const { data, error } = await supabase
            .from("history")
            .update(updates)
            .eq("id", id)
            .select()
            .single();

          if (error) throw error;

          const updatedItem = data as HistoryItem;
          set((state) => ({
            historyItems: state.historyItems.map((item) =>
              item.id === id ? updatedItem : item
            ),
            isLoading: false,
          }));

          toast.success("History item updated successfully");
          return updatedItem;
        } catch (err: any) {
          const errorMessage = err?.message || "Failed to update history item";
          set({
            error: errorMessage,
            isLoading: false,
          });
          toast.error(errorMessage);
          return null;
        }
      },

      deleteHistoryItem: async (id) => {
        set({ isLoading: true, error: null });
        const supabase = createClient();

        try {
          const { error } = await supabase
            .from("history")
            .delete()
            .eq("id", id);

          if (error) throw error;

          set((state) => ({
            historyItems: state.historyItems.filter((item) => item.id !== id),
            isLoading: false,
          }));

          toast.success("History item deleted successfully");
          return true;
        } catch (err: any) {
          const errorMessage = err?.message || "Failed to delete history item";
          set({
            error: errorMessage,
            isLoading: false,
          });
          toast.error(errorMessage);
          return false;
        }
      },
    }),
    {
      name: "history-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Optional: Persist store (if needed)
// import { persist, createJSONStorage } from 'zustand/middleware';
//
// export const useHistoryStore = create(
//   persist<HistoryState & HistoryActions>(
//     (set, get) => ({
//       // ... store definition ...
//     }),
//     {
//       name: 'history-storage', // unique name
//       storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
//     }
//   )
// );
