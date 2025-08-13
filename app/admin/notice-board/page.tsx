"use client";

import React, { useEffect, useState } from "react";
import NewNoticeCard from "@/components/cards/new-notice-card";
import NoticeBoardCard from "@/components/cards/notice-board-card";
import NoticeBoardTable from "@/components/tables/notice-board";
import NoticeBoardSearchFilters, {
  SearchFilters,
} from "@/components/search/notice-board-search-filters";
import NoticeBoardForm from "@/components/forms/notice-board-form";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoadingIcon } from "@/components/loading-icon";
import { cn } from "@/lib/utils";
import { Plus, Grid, Table } from "lucide-react";
import { useNoticeBoardStore } from "@/stores/notice-board-store";
import { NoticeBoard } from "@/lib/types";
import { toast } from "sonner";
import { useUserStore } from "@/stores/user-store";
import { getFilteredAndSortedNoticeBoards } from "@/lib/utils/notice-board-filters";

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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedNoticeBoard, setSelectedNoticeBoard] =
    useState<NoticeBoard | null>(null);

  // Search and filter state
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: "",
    selectedTags: [],
    pinnedFilter: "all",
    editorFilter: "",
    dateFrom: undefined,
    dateTo: undefined,
  });

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

  // Handle editing a notice
  const handleEdit = (noticeBoard: NoticeBoard) => {
    setSelectedNoticeBoard(noticeBoard);
    setIsEditDialogOpen(true);
  };

  // Handle updating a notice
  const handleUpdate = async (data: Omit<NoticeBoard, "id">) => {
    if (!selectedNoticeBoard) return;

    try {
      await updateNoticeBoard(selectedNoticeBoard.id, data);
      setIsEditDialogOpen(false);
      setSelectedNoticeBoard(null);
      toast.success("Notice updated successfully!");
    } catch (error) {
      console.error("Error updating notice:", error);
      toast.error("Failed to update notice");
    }
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

  // Get filtered and sorted notices
  const filteredNotices = getFilteredAndSortedNoticeBoards(
    noticeBoards,
    filters
  );

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
            id="add-notice-button"
          >
            <Plus className="size-5" />
            New Notice
          </Button>
        </div>
      </div>

      {/* SEARCH AND FILTERS SECTION */}
      {!newNotice && (
        <NoticeBoardSearchFilters
          noticeBoards={noticeBoards}
          filters={filters}
          onFiltersChange={setFilters}
        />
      )}

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
          ) : filteredNotices.length === 0 && noticeBoards.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No notices yet
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first family notice to get started
              </p>
              <Button onClick={() => setNewNotice(true)} id="add-notice-button">
                <Plus className="h-4 w-4 mr-2" />
                Create Notice
              </Button>
            </div>
          ) : filteredNotices.length === 0 && noticeBoards.length > 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No notices match your filters
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Try adjusting your search criteria or clear all filters
              </p>
              <Button
                variant="outline"
                onClick={() =>
                  setFilters({
                    searchTerm: "",
                    selectedTags: [],
                    pinnedFilter: "all",
                    editorFilter: "",
                    dateFrom: undefined,
                    dateTo: undefined,
                  })
                }
              >
                Clear Filters
              </Button>
            </div>
          ) : displayMode === "grid" ? (
            filteredNotices.map((noticeBoard) => (
              <NoticeBoardCard
                key={noticeBoard.id}
                noticeBoard={noticeBoard}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                onTogglePin={handleTogglePin}
                showActions={true}
              />
            ))
          ) : (
            <NoticeBoardTable
              data={filteredNotices}
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Notice</DialogTitle>
          </DialogHeader>
          {selectedNoticeBoard && (
            <NoticeBoardForm
              defaultValues={selectedNoticeBoard}
              loading={loading}
              onSubmit={handleUpdate}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

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
