import { create } from "zustand";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { NoticeBoard } from "@/lib/types";

interface NoticeBoardState {
  noticeBoards: NoticeBoard[];
  loading: boolean;
  error: string | null;

  fetchNoticeBoards: () => Promise<NoticeBoard[]>;
  createNoticeBoard: (
    noticeBoard: Omit<NoticeBoard, "id">
  ) => Promise<NoticeBoard | null>;
  updateNoticeBoard: (
    id: string,
    noticeBoard: Partial<Omit<NoticeBoard, "id">>
  ) => Promise<NoticeBoard | null>;
  deleteNoticeBoard: (id: string) => Promise<boolean>;
  togglePinned: (id: string, pinned: boolean) => Promise<NoticeBoard | null>;
}

export const useNoticeBoardStore = create<NoticeBoardState>((set, get) => ({
  noticeBoards: [],
  loading: false,
  error: null,

  fetchNoticeBoards: async () => {
    set({ loading: true, error: null });
    const supabase = createClient();

    try {
      const { data, error } = await supabase
        .from("notice_boards")
        .select("*")
        .order("pinned", { ascending: false })
        .order("posteddate", { ascending: false });

      if (error) throw error;

      const noticeBoards = data as NoticeBoard[];
      set({ noticeBoards, loading: false });
      return noticeBoards;
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to fetch notice boards";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      return [];
    }
  },

  createNoticeBoard: async (noticeBoard) => {
    set({ loading: true, error: null });
    const supabase = createClient();

    try {
      // Add current date and time if not provided
      const now = new Date();
      const formattedNoticeBoard = {
        ...noticeBoard,
        posteddate: noticeBoard.posteddate || now.toISOString().split("T")[0],
        postedtime:
          noticeBoard.postedtime ||
          now.toTimeString().split(" ")[0].substring(0, 5),
      };

      const { data, error } = await supabase
        .from("notice_boards")
        .insert(formattedNoticeBoard)
        .select()
        .single();

      if (error) throw error;

      const newNoticeBoard = data as NoticeBoard;
      set((state) => ({
        noticeBoards: [newNoticeBoard, ...state.noticeBoards],
        loading: false,
      }));

      toast.success("Notice board created successfully");
      return newNoticeBoard;
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to create notice board";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      return null;
    }
  },

  updateNoticeBoard: async (id, noticeBoardUpdates) => {
    set({ loading: true, error: null });
    const supabase = createClient();

    try {
      const { data, error } = await supabase
        .from("notice_boards")
        .update(noticeBoardUpdates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      const updatedNoticeBoard = data as NoticeBoard;
      set((state) => ({
        noticeBoards: state.noticeBoards.map((noticeBoard) =>
          noticeBoard.id === id ? updatedNoticeBoard : noticeBoard
        ),
        loading: false,
      }));

      toast.success("Notice board updated successfully");
      return updatedNoticeBoard;
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to update notice board";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      return null;
    }
  },

  deleteNoticeBoard: async (id) => {
    set({ loading: true, error: null });
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from("notice_boards")
        .delete()
        .eq("id", id);

      if (error) throw error;

      set((state) => ({
        noticeBoards: state.noticeBoards.filter(
          (noticeBoard) => noticeBoard.id !== id
        ),
        loading: false,
      }));

      toast.success("Notice board deleted successfully");
      return true;
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to delete notice board";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      return false;
    }
  },

  togglePinned: async (id, pinned) => {
    set({ loading: true, error: null });
    const supabase = createClient();

    try {
      const { data, error } = await supabase
        .from("notice_boards")
        .update({ pinned })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      const updatedNoticeBoard = data as NoticeBoard;
      set((state) => ({
        noticeBoards: state.noticeBoards.map((noticeBoard) =>
          noticeBoard.id === id ? updatedNoticeBoard : noticeBoard
        ),
        loading: false,
      }));

      toast.success(`Notice ${pinned ? "pinned" : "unpinned"} successfully`);
      return updatedNoticeBoard;
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to toggle pin status";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      return null;
    }
  },
}));
