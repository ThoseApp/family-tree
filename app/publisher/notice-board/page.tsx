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

const PublisherNoticeBoardPage = () => {
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
      let editorName = "Publisher";

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

      await createNoticeBoard(noticeData, user?.id);
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

  // Handle actual deletion
  const handleDelete = async () => {
    if (!noticeBoardToDelete) return;

    try {
      await deleteNoticeBoard(noticeBoardToDelete);
      setIsDeleteDialogOpen(false);
      setNoticeBoardToDelete(null);
    } catch (error) {
      console.error("Error deleting notice:", error);
    }
  };

  // Handle pin toggle
  const handlePinToggle = async (id: string, pinned: boolean) => {
    try {
      await togglePinned(id, !pinned);
    } catch (error) {
      console.error("Error toggling pin:", error);
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
        <div>
          <h1 className="text-2xl font-semibold">Notice Board Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create and manage family notice board posts. Your posts are
            automatically approved.
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Display Mode Toggle */}
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

          {/* Add Notice Button */}
          <Button onClick={toggleNewNotice} id="add-notice-button">
            <Plus className="mr-2 h-4 w-4" />
            {newNotice ? "Hide Form" : "Add Notice"}
          </Button>
        </div>
      </div>

      {/* NEW NOTICE FORM */}
      {newNotice && (
        <div className="mb-8">
          <NewNoticeCard
            onClose={toggleNewNotice}
            onSubmit={handleCreateNotice}
            loading={loading}
          />
        </div>
      )}

      {/* SEARCH AND FILTERS SECTION */}
      <NoticeBoardSearchFilters
        noticeBoards={noticeBoards}
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* NOTICES DISPLAY */}
      {loading && noticeBoards.length === 0 ? (
        <div className="flex items-center justify-center h-40">
          <LoadingIcon className="size-8" />
        </div>
      ) : (
        <>
          {displayMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNotices.map((notice) => (
                <NoticeBoardCard
                  key={notice.id}
                  noticeBoard={notice}
                  onEdit={() => handleEdit(notice)}
                  onDelete={() => handleDeleteClick(notice.id)}
                  onTogglePin={() => handlePinToggle(notice.id, notice.pinned)}
                  showActions={true}
                />
              ))}
            </div>
          ) : (
            <NoticeBoardTable
              data={filteredNotices}
              onEditClick={handleEdit}
              onDeleteClick={handleDeleteClick}
              onTogglePinClick={handlePinToggle}
            />
          )}
        </>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              notice board post.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* EDIT DIALOG */}
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
    </div>
  );
};

export default PublisherNoticeBoardPage;
