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

const NoticeBoardRequestsPage = () => {
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
      .channel("notice-board-requests-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notice_boards",
          filter: `status=eq.${NoticeBoardStatusEnum.pending}`,
        },
        (payload: any) => {
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
        (payload: any) => {
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
        (payload: any) => {
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
          body: `Your notice "${approvedNoticeBoard.title}" has been approved and is now visible to everyone.`,
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

  // Handle decline notice board request
  const handleDecline = async (noticeBoardId: string) => {
    if (!user) {
      toast.error("User not authenticated");
      return;
    }

    // Set this item as processing
    setProcessingItems((prev) => new Set(prev).add(noticeBoardId));

    try {
      // Find the notice board to get user info for notification
      const declinedNoticeBoard = pendingNoticeBoards.find(
        (nb) => nb.id === noticeBoardId
      );

      if (!declinedNoticeBoard) {
        throw new Error("Notice board not found in pending list");
      }

      // Update status to rejected
      const { error: updateError } = await supabase
        .from("notice_boards")
        .update({
          status: NoticeBoardStatusEnum.rejected,
          updated_at: new Date().toISOString(),
        })
        .eq("id", noticeBoardId);

      if (updateError) {
        console.error("Error updating notice board status:", updateError);
        throw updateError;
      }

      // Create notification for the user
      if (declinedNoticeBoard.user_id) {
        try {
          const notificationData = {
            title: "Notice Board Declined",
            body: `Your notice "${declinedNoticeBoard.title}" has been declined. Please check if it meets our community guidelines and you can edit and resubmit it.`,
            type: NotificationTypeEnum.notice_board_declined,
            resource_id: noticeBoardId,
            user_id: declinedNoticeBoard.user_id,
            read: false,
            image: declinedNoticeBoard.image,
          };

          const { error: notificationError } = await supabase
            .from("notifications")
            .insert(notificationData);

          if (notificationError) {
            console.warn("Failed to create notification:", notificationError);
            // Don't fail the whole operation if notification fails
          } else {
          }
        } catch (notificationErr: any) {
          console.warn("Notification creation failed:", notificationErr);
        }
      }

      // Remove from pending list (since it's no longer pending)
      setPendingNoticeBoards((prev) =>
        prev.filter((nb) => nb.id !== noticeBoardId)
      );
      toast.success("Notice board declined successfully");
    } catch (err: any) {
      console.error("Error declining notice board:", err);
      toast.error(`Failed to decline notice board request: ${err.message}`);
    } finally {
      // Remove from processing
      setProcessingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(noticeBoardId);
        return newSet;
      });
    }
  };

  // Handle preview notice board
  const handlePreviewNoticeBoard = (noticeBoard: NoticeBoard) => {
    // For now, just log the notice board details
    // You could implement a modal or navigation to a preview page here
  };

  if (loading && pendingNoticeBoards.length === 0) {
    return (
      <div className="flex items-center justify-center h-40">
        <LoadingIcon className="size-8" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-8 lg:gap-y-12">
      {/* HEADER SECTION */}
      <div className="flex md:items-center md:flex-row flex-col md:justify-between gap-y-4">
        <div>
          <h1 className="text-2xl font-semibold">Notice Board Requests</h1>
          <p className="text-muted-foreground mt-1">
            Review and manage pending notice board submissions from family
            members
          </p>
        </div>

        {pendingNoticeBoards.length > 0 && (
          <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
            {pendingNoticeBoards.length} pending request
            {pendingNoticeBoards.length === 1 ? "" : "s"}
          </div>
        )}
      </div>

      {pendingNoticeBoards.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No pending requests
              </h3>
              <p className="text-sm text-muted-foreground">
                All notice board submissions have been reviewed. New requests
                will appear here.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* NOTICE BOARD REQUESTS TABLE */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Notice Board Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <NoticeBoardRequestsTable
                data={pendingNoticeBoards}
                onUserClick={handlePreviewNoticeBoard}
                onApprove={handleApprove}
                onDecline={handleDecline}
                processingItems={processingItems}
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default NoticeBoardRequestsPage;
