import { create } from "zustand";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { NoticeBoard, getUserRoleFromMetadata } from "@/lib/types";
import {
  NoticeBoardStatusEnum,
  NotificationTypeEnum,
} from "@/lib/constants/enums";

const ADMIN_ID = process.env.NEXT_PUBLIC_ADMIN_ID;

interface NoticeBoardState {
  noticeBoards: NoticeBoard[];
  loading: boolean;
  error: string | null;

  fetchNoticeBoards: () => Promise<NoticeBoard[]>;
  fetchApprovedNoticeBoards: () => Promise<NoticeBoard[]>;
  fetchPendingNoticeBoards: () => Promise<NoticeBoard[]>;
  fetchUserNoticeBoards: (userId: string) => Promise<NoticeBoard[]>;
  createNoticeBoard: (
    noticeBoard: Omit<NoticeBoard, "id">,
    userId?: string
  ) => Promise<NoticeBoard | null>;
  updateNoticeBoard: (
    id: string,
    noticeBoard: Partial<Omit<NoticeBoard, "id">>
  ) => Promise<NoticeBoard | null>;
  deleteNoticeBoard: (id: string) => Promise<boolean>;
  togglePinned: (id: string, pinned: boolean) => Promise<NoticeBoard | null>;
  approveNoticeBoard: (id: string) => Promise<boolean>;
  rejectNoticeBoard: (id: string) => Promise<boolean>;
}

export const useNoticeBoardStore = create<NoticeBoardState>((set, get) => ({
  noticeBoards: [],
  loading: false,
  error: null,

  fetchNoticeBoards: async () => {
    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from("notice_boards")
        .select("*")
        .order("pinned", { ascending: false })
        .order("created_at", { ascending: false });

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

  fetchApprovedNoticeBoards: async () => {
    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from("notice_boards")
        .select("*")
        .eq("status", NoticeBoardStatusEnum.approved)
        .order("pinned", { ascending: false })
        .order("created_at", { ascending: false });

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

  fetchPendingNoticeBoards: async () => {
    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from("notice_boards")
        .select("*")
        .eq("status", NoticeBoardStatusEnum.pending)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const noticeBoards = data as NoticeBoard[];
      set({ noticeBoards, loading: false });
      return noticeBoards;
    } catch (error: any) {
      const errorMessage =
        error?.message || "Failed to fetch pending notice boards";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      return [];
    }
  },

  fetchUserNoticeBoards: async (userId: string) => {
    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from("notice_boards")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const noticeBoards = data as NoticeBoard[];
      set({ noticeBoards, loading: false });
      return noticeBoards;
    } catch (error: any) {
      const errorMessage =
        error?.message || "Failed to fetch user notice boards";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      return [];
    }
  },

  createNoticeBoard: async (noticeBoard, userId) => {
    set({ loading: true, error: null });

    try {
      // Add current date and time if not provided
      const now = new Date();

      // Get current user to check role
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const userRole = user ? getUserRoleFromMetadata(user) : "user";
      const isAdmin = userId === ADMIN_ID;
      const isPublisher = userRole === "publisher";
      const canAutoApprove = isAdmin || isPublisher;

      const formattedNoticeBoard = {
        ...noticeBoard,
        user_id: userId,
        status: canAutoApprove
          ? NoticeBoardStatusEnum.approved
          : NoticeBoardStatusEnum.pending,
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

      // Create notification for admin if user is not admin or publisher
      if (!canAutoApprove && userId) {
        try {
          await supabase.rpc("create_system_notification", {
            p_user_id: ADMIN_ID,
            p_title: "New Notice Board Request",
            p_body: `A new notice "${noticeBoard.title}" has been posted and is pending approval.`,
            p_type: NotificationTypeEnum.notice_board_request,
            p_resource_id: newNoticeBoard.id,
            p_image: noticeBoard.image,
          });
        } catch (notificationErr) {
          console.error("Failed to create notification:", notificationErr);
          // Don't throw here as the main notice creation was successful
        }
      }

      toast.success(
        canAutoApprove
          ? "Notice board created successfully"
          : "Notice board submitted for approval"
      );
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

  approveNoticeBoard: async (id) => {
    set({ loading: true, error: null });

    try {
      // Get the notice board to find user info for notification
      const { data: noticeBoard, error: fetchError } = await supabase
        .from("notice_boards")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from("notice_boards")
        .update({
          status: NoticeBoardStatusEnum.approved,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      // Create notification for the user
      if (noticeBoard && noticeBoard.user_id) {
        try {
          await supabase.rpc("create_system_notification", {
            p_user_id: noticeBoard.user_id,
            p_title: "Notice Board Approved",
            p_body: `Your notice "${noticeBoard.title}" has been approved and is now visible to everyone.`,
            p_type: NotificationTypeEnum.notice_board_approved,
            p_resource_id: id,
            p_image: noticeBoard.image,
          });
        } catch (notificationErr) {
          console.error("Failed to create notification:", notificationErr);
          // Don't throw here as the main approval was successful
        }
      }

      // Update local state
      set((state) => ({
        noticeBoards: state.noticeBoards.map((notice) =>
          notice.id === id
            ? { ...notice, status: NoticeBoardStatusEnum.approved }
            : notice
        ),
        loading: false,
      }));

      toast.success("Notice board approved successfully");
      return true;
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to approve notice board";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      return false;
    }
  },

  rejectNoticeBoard: async (id) => {
    set({ loading: true, error: null });

    try {
      // Get the notice board to find user info for notification
      const { data: noticeBoard, error: fetchError } = await supabase
        .from("notice_boards")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from("notice_boards")
        .update({
          status: NoticeBoardStatusEnum.rejected,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      // Create notification for the user
      if (noticeBoard && noticeBoard.user_id) {
        try {
          await supabase.rpc("create_system_notification", {
            p_user_id: noticeBoard.user_id,
            p_title: "Notice Board Declined",
            p_body: `Your notice "${noticeBoard.title}" has been declined. Please check if it meets our community guidelines.`,
            p_type: NotificationTypeEnum.notice_board_declined,
            p_resource_id: id,
            p_image: noticeBoard.image,
          });
        } catch (notificationErr) {
          console.error("Failed to create notification:", notificationErr);
          // Don't throw here as the main rejection was successful
        }
      }

      // Update local state
      set((state) => ({
        noticeBoards: state.noticeBoards.map((notice) =>
          notice.id === id
            ? { ...notice, status: NoticeBoardStatusEnum.rejected }
            : notice
        ),
        loading: false,
      }));

      toast.success("Notice board declined successfully");
      return true;
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to decline notice board";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      return false;
    }
  },
}));
