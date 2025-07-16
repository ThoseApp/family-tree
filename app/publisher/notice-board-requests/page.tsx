"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import NoticeBoardRequestsTable from "@/components/tables/notice-board-requests";
import { useNoticeBoardStore } from "@/stores/notice-board-store";
import { useUserStore } from "@/stores/user-store";
import { LoadingIcon } from "@/components/loading-icon";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { NoticeBoard } from "@/lib/types";
import {
  NoticeBoardStatusEnum,
  NotificationTypeEnum,
} from "@/lib/constants/enums";

const PublisherNoticeBoardRequestsPage = () => {
  const { user } = useUserStore();
  const { loading } = useNoticeBoardStore();
  const [pendingNoticeBoards, setPendingNoticeBoards] = useState<NoticeBoard[]>(
    []
  );
  const [processingItems, setProcessingItems] = useState<Set<string>>(
    new Set()
  );

  // Fetch pending notice boards
  const fetchPendingNoticeBoards = async () => {
    try {
      const { data, error } = await supabase
        .from("notice_boards")
        .select("*")
        .eq("status", NoticeBoardStatusEnum.pending)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPendingNoticeBoards(data || []);
    } catch (err: any) {
      console.error("Error fetching pending notice boards:", err);
      toast.error("Failed to fetch notice board requests");
    }
  };

  useEffect(() => {
    fetchPendingNoticeBoards();

    // Set up real-time subscription for pending notice boards
    const channel = supabase
      .channel("publisher-notice-board-requests-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notice_boards",
          filter: `status=eq.${NoticeBoardStatusEnum.pending}`,
        },
        (payload) => {
          console.log("New notice board request received:", payload);
          const newNoticeBoard = payload.new as NoticeBoard;
          setPendingNoticeBoards((prev) => [newNoticeBoard, ...prev]);
          toast.info(`New notice board request: "${newNoticeBoard.title}"`);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notice_boards",
        },
        (payload) => {
          console.log("Notice board updated:", payload);
          const updatedNoticeBoard = payload.new as NoticeBoard;

          // Remove from pending if status changed from pending
          if (updatedNoticeBoard.status !== NoticeBoardStatusEnum.pending) {
            setPendingNoticeBoards((prev) =>
              prev.filter((nb) => nb.id !== updatedNoticeBoard.id)
            );
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "notice_boards",
        },
        (payload) => {
          console.log("Notice board deleted:", payload);
          const deletedNoticeBoard = payload.old as NoticeBoard;
          setPendingNoticeBoards((prev) =>
            prev.filter((nb) => nb.id !== deletedNoticeBoard.id)
          );
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Handle approve notice board request
  const handleApprove = async (noticeBoardId: string) => {
    if (!user) {
      toast.error("User not authenticated");
      return;
    }

    // Set this item as processing
    setProcessingItems((prev) => new Set(prev).add(noticeBoardId));

    try {
      const { error } = await supabase
        .from("notice_boards")
        .update({
          status: NoticeBoardStatusEnum.approved,
          updated_at: new Date().toISOString(),
        })
        .eq("id", noticeBoardId);

      if (error) throw error;

      // Find the notice board to get user info for notification
      const approvedNoticeBoard = pendingNoticeBoards.find(
        (nb) => nb.id === noticeBoardId
      );

      if (approvedNoticeBoard && approvedNoticeBoard.user_id) {
        // Create notification for the user
        const notificationData = {
          title: "Notice Board Approved",
          body: `Your notice "${approvedNoticeBoard.title}" has been approved by the publisher and is now visible to everyone.`,
          type: NotificationTypeEnum.notice_board_approved,
          resource_id: noticeBoardId,
          user_id: approvedNoticeBoard.user_id,
          read: false,
          image: approvedNoticeBoard.image,
        };

        const { error: notificationError } = await supabase
          .from("notifications")
          .insert(notificationData);

        if (notificationError) {
          console.warn("Failed to create notification:", notificationError);
        }
      }

      // Remove from pending list
      setPendingNoticeBoards((prev) =>
        prev.filter((nb) => nb.id !== noticeBoardId)
      );
      toast.success("Notice board approved successfully");
    } catch (err: any) {
      console.error("Error approving notice board:", err);
      toast.error("Failed to approve notice board request");
    } finally {
      // Remove from processing
      setProcessingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(noticeBoardId);
        return newSet;
      });
    }
  };

  // Handle reject notice board request
  const handleReject = async (noticeBoardId: string) => {
    if (!user) {
      toast.error("User not authenticated");
      return;
    }

    // Set this item as processing
    setProcessingItems((prev) => new Set(prev).add(noticeBoardId));

    try {
      const { error } = await supabase
        .from("notice_boards")
        .update({
          status: NoticeBoardStatusEnum.rejected,
          updated_at: new Date().toISOString(),
        })
        .eq("id", noticeBoardId);

      if (error) throw error;

      // Find the notice board to get user info for notification
      const rejectedNoticeBoard = pendingNoticeBoards.find(
        (nb) => nb.id === noticeBoardId
      );

      if (rejectedNoticeBoard && rejectedNoticeBoard.user_id) {
        // Create notification for the user
        const notificationData = {
          title: "Notice Board Declined",
          body: `Your notice "${rejectedNoticeBoard.title}" has been declined by the publisher. Please check if it meets our community guidelines.`,
          type: NotificationTypeEnum.notice_board_declined,
          resource_id: noticeBoardId,
          user_id: rejectedNoticeBoard.user_id,
          read: false,
          image: rejectedNoticeBoard.image,
        };

        const { error: notificationError } = await supabase
          .from("notifications")
          .insert(notificationData);

        if (notificationError) {
          console.warn("Failed to create notification:", notificationError);
        }
      }

      // Remove from pending list
      setPendingNoticeBoards((prev) =>
        prev.filter((nb) => nb.id !== noticeBoardId)
      );
      toast.success("Notice board declined successfully");
    } catch (err: any) {
      console.error("Error declining notice board:", err);
      toast.error("Failed to decline notice board request");
    } finally {
      // Remove from processing
      setProcessingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(noticeBoardId);
        return newSet;
      });
    }
  };

  // Handle delete notice board request
  const handleDelete = async (noticeBoardId: string) => {
    if (!user) {
      toast.error("User not authenticated");
      return;
    }

    // Set this item as processing
    setProcessingItems((prev) => new Set(prev).add(noticeBoardId));

    try {
      const { error } = await supabase
        .from("notice_boards")
        .delete()
        .eq("id", noticeBoardId);

      if (error) throw error;

      // Remove from pending list
      setPendingNoticeBoards((prev) =>
        prev.filter((nb) => nb.id !== noticeBoardId)
      );
      toast.success("Notice board request deleted successfully");
    } catch (err: any) {
      console.error("Error deleting notice board:", err);
      toast.error("Failed to delete notice board request");
    } finally {
      // Remove from processing
      setProcessingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(noticeBoardId);
        return newSet;
      });
    }
  };

  return (
    <div className="flex flex-col gap-y-8 lg:gap-y-12">
      {/* HEADER SECTION */}
      <div>
        <h1 className="text-2xl font-semibold">Notice Board Requests</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review and approve notice board submissions from family members.
        </p>
      </div>

      {/* STATS CARD */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pendingNoticeBoards.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting your review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{processingItems.size}</div>
            <p className="text-xs text-muted-foreground">
              Currently being processed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Role</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Publisher</div>
            <p className="text-xs text-muted-foreground">Content manager</p>
          </CardContent>
        </Card>
      </div>

      {/* REQUESTS TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Notice Board Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && pendingNoticeBoards.length === 0 ? (
            <div className="flex items-center justify-center h-40">
              <LoadingIcon className="size-8" />
            </div>
          ) : pendingNoticeBoards.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No pending requests at this time.
              </p>
            </div>
          ) : (
            <NoticeBoardRequestsTable
              data={pendingNoticeBoards}
              onApprove={handleApprove}
              onDecline={handleReject}
              processingItems={processingItems}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PublisherNoticeBoardRequestsPage;
