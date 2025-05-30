"use client";

import React, { useEffect, useState } from "react";
import NewNoticeCard from "@/components/cards/new-notice-card";
import NoticeBoardCard from "@/components/cards/notice-board-card";
import NoticeBoardTable from "@/components/tables/notice-board";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LoadingIcon } from "@/components/loading-icon";
import { cn } from "@/lib/utils";
import { Plus, Grid, Table } from "lucide-react";
import { useNoticeBoardStore } from "@/stores/notice-board-store";
import { NoticeBoard } from "@/lib/types";
import { toast } from "sonner";
import { useUserStore } from "@/stores/user-store";

const AdminNoticeBoardPage = () => {
  const { user } = useUserStore();
  const {
    noticeBoards,
    loading,
    fetchNoticeBoards,
    createNoticeBoard,
    updateNoticeBoard,
    deleteNoticeBoard,
    togglePinned,
  } = useNoticeBoardStore();

  const [newNotice, setNewNotice] = useState(false);
  const [displayMode, setDisplayMode] = useState<"grid" | "table">("grid");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [noticeBoardToDelete, setNoticeBoardToDelete] = useState<string | null>(
    null
  );

  // Fetch notice boards on component mount
  useEffect(() => {
    fetchNoticeBoards();
  }, [fetchNoticeBoards]);

  // Toggle form visibility
  const toggleNewNotice = () => {
    setNewNotice(!newNotice);
  };

  // Handle creating a new notice (this will be called from NewNoticeCard)
  const handleCreateNotice = async (data: Omit<NoticeBoard, "id">) => {
    try {
      // Get user profile to get the full name
      const { getUserProfile } = useUserStore.getState();
      let editorName = "Admin";

      if (user) {
        try {
          const profile = await getUserProfile();
          if (profile) {
            editorName = `${profile.first_name} ${profile.last_name}`;
          }
        } catch (error) {
          console.warn("Could not get user profile, using default editor name");
        }
      }

      // Add the current user as the editor if available
      const noticeData = {
        ...data,
        editor: data.editor || editorName,
      };

      await createNoticeBoard(noticeData);
      setNewNotice(false);
    } catch (error) {
      console.error("Error creating notice:", error);
      toast.error("Failed to create notice");
    }
  };

  // Handle editing a notice (inline editing for future implementation)
  const handleEdit = (noticeBoard: NoticeBoard) => {
    // For now, just show a message - can be extended later
    toast.info("Edit functionality can be added in a future update");
  };

  // Handle delete confirmation
  const handleDeleteClick = (id: string) => {
    setNoticeBoardToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  // Handle deleting a notice
  const handleDeleteConfirm = async () => {
    if (!noticeBoardToDelete) return;

    try {
      await deleteNoticeBoard(noticeBoardToDelete);
      setIsDeleteDialogOpen(false);
      setNoticeBoardToDelete(null);
      toast.success("Notice deleted successfully!");
    } catch (error) {
      console.error("Error deleting notice:", error);
      toast.error("Failed to delete notice");
    }
  };

  // Handle toggling pin status
  const handleTogglePin = async (id: string, pinned: boolean) => {
    try {
      await togglePinned(id, !pinned);
      toast.success(`Notice ${!pinned ? "pinned" : "unpinned"} successfully!`);
    } catch (error) {
      console.error("Error toggling pin status:", error);
      toast.error("Failed to toggle pin status");
    }
  };

  // Get pinned and unpinned notices
  const pinnedNotices = noticeBoards.filter((notice) => notice.pinned);
  const unpinnedNotices = noticeBoards.filter((notice) => !notice.pinned);
  const sortedNotices = [...pinnedNotices, ...unpinnedNotices];

  return (
    <div className="flex flex-col gap-y-8 lg:gap-y-12">
      {/* HEADER SECTION */}
      <div className="flex md:items-center md:flex-row flex-col md:justify-between gap-y-4">
        <h1 className="text-2xl font-semibold">Family Notice Board</h1>

        <div className="flex items-center gap-4">
          {/* Display Mode Toggle */}
          {!newNotice && (
            <div className="flex items-center space-x-2">
              <Button
                variant={displayMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setDisplayMode("grid")}
              >
                <Grid className="h-4 w-4 mr-2" />
                Grid
              </Button>
              <Button
                variant={displayMode === "table" ? "default" : "outline"}
                size="sm"
                onClick={() => setDisplayMode("table")}
              >
                <Table className="h-4 w-4 mr-2" />
                Table
              </Button>
            </div>
          )}

          {/* Add Notice Button */}
          <Button
            className="bg-foreground text-background rounded-full hover:bg-foreground/80"
            onClick={toggleNewNotice}
          >
            <Plus className="size-5" />
            New Notice
          </Button>
        </div>
      </div>

      {/* GRID SECTION */}
      <div className={cn("", newNotice && "flex items-start gap-4 w-full")}>
        <div
          className={cn(
            displayMode === "grid"
              ? "grid grid-cols-1 lg:grid-cols-2 gap-4"
              : "w-full",
            newNotice && "lg:grid-cols-1 w-1/2"
          )}
        >
          {loading && noticeBoards.length === 0 ? (
            <div className="flex justify-center items-center h-40">
              <LoadingIcon className="h-8 w-8" />
            </div>
          ) : noticeBoards.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No notices yet
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first family notice to get started
              </p>
              <Button onClick={() => setNewNotice(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Notice
              </Button>
            </div>
          ) : displayMode === "grid" ? (
            sortedNotices.map((noticeBoard) => (
              <NoticeBoardCard key={noticeBoard.id} noticeBoard={noticeBoard} />
            ))
          ) : (
            <NoticeBoardTable
              data={sortedNotices}
              onEditClick={handleEdit}
              onDeleteClick={handleDeleteClick}
              onTogglePinClick={handleTogglePin}
            />
          )}
        </div>
        {newNotice && (
          <div className="w-1/2">
            <NewNoticeCard
              onClose={toggleNewNotice}
              onSubmit={handleCreateNotice}
              loading={loading}
            />
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              notice and remove it from the family board.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setNoticeBoardToDelete(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? <LoadingIcon className="h-4 w-4" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminNoticeBoardPage;
