"use client";

import NoticeBoardCard from "@/components/cards/notice-board-card";
import NoticeBoardForm from "@/components/forms/notice-board-form";
import NoticeBoardTable from "@/components/tables/notice-board";
import NoticeBoardSearchFilters, {
  SearchFilters,
} from "@/components/search/notice-board-search-filters";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoadingIcon } from "@/components/loading-icon";
import { Plus, ChevronDown, ChevronUp, Grid, Table } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNoticeBoardStore } from "@/stores/notice-board-store";
import { useUserStore } from "@/stores/user-store";
import { NoticeBoard } from "@/lib/types";
import { toast } from "sonner";
import { getFilteredAndSortedNoticeBoards } from "@/lib/utils/notice-board-filters";
import { cn } from "@/lib/utils";

const NoticeBoardPage = () => {
  const { user } = useUserStore();
  const {
    noticeBoards,
    loading,
    fetchUserNoticeBoards,
    createNoticeBoard,
    updateNoticeBoard,
    deleteNoticeBoard,
    togglePinned,
  } = useNoticeBoardStore();

  const [showForm, setShowForm] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedNoticeBoard, setSelectedNoticeBoard] =
    useState<NoticeBoard | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [noticeBoardToDelete, setNoticeBoardToDelete] = useState<string | null>(
    null
  );
  const [displayMode, setDisplayMode] = useState<"grid" | "table">("grid");

  // Search and filter state
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: "",
    selectedTags: [],
    pinnedFilter: "all",
    editorFilter: "",
    dateFrom: undefined,
    dateTo: undefined,
  });

  useEffect(() => {
    if (user?.id) {
      fetchUserNoticeBoards(user.id);
    }
  }, [fetchUserNoticeBoards, user?.id]);

  // Get filtered and sorted notices
  const filteredNotices = getFilteredAndSortedNoticeBoards(
    noticeBoards,
    filters
  );

  const handleSubmit = async (data: Omit<NoticeBoard, "id">) => {
    if (!user?.id) {
      toast.error("User not authenticated");
      return;
    }

    try {
      await createNoticeBoard(data, user.id);
      setShowForm(false);
    } catch (error) {
      toast.error("Failed to create notice");
    }
  };

  const handleEdit = (noticeBoard: NoticeBoard) => {
    // Only allow editing of pending or rejected notices
    if (noticeBoard.status === "approved") {
      toast.error("Cannot edit approved notices");
      return;
    }
    setSelectedNoticeBoard(noticeBoard);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (data: Omit<NoticeBoard, "id">) => {
    if (!selectedNoticeBoard) return;

    try {
      // If updating a rejected notice, reset status to pending
      const updateData =
        selectedNoticeBoard.status === "rejected"
          ? { ...data, status: "pending" as const }
          : data;

      await updateNoticeBoard(selectedNoticeBoard.id, updateData);
      setIsEditDialogOpen(false);
      setSelectedNoticeBoard(null);

      if (selectedNoticeBoard.status === "rejected") {
        toast.success("Notice updated and resubmitted for approval");
      }
    } catch (error) {
      toast.error("Failed to update notice");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!noticeBoardToDelete) return;

    try {
      await deleteNoticeBoard(noticeBoardToDelete);
      setIsDeleteDialogOpen(false);
      setNoticeBoardToDelete(null);
    } catch (error) {
      toast.error("Failed to delete notice");
    }
  };

  const handleTogglePin = async (id: string, pinned: boolean) => {
    try {
      await togglePinned(id, pinned);
    } catch (error) {
      toast.error("Failed to toggle pin status");
    }
  };

  // Check if user can edit a notice
  const canEditNotice = (noticeBoard: NoticeBoard) => {
    return (
      noticeBoard.status === "pending" || noticeBoard.status === "rejected"
    );
  };

  return (
    <div className="flex flex-col gap-y-8 lg:gap-y-12">
      {/* HEADER SECTION */}
      <div className="flex md:items-center md:flex-row flex-col md:justify-between gap-y-4">
        <div>
          <h1 className="text-2xl font-semibold">My Notice Board</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your family notice board posts. Notices require admin
            approval before being visible to everyone.
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
          <Button onClick={() => setShowForm(!showForm)} id="add-notice-button">
            {showForm ? (
              <>
                <ChevronUp className="mr-2 h-4 w-4" /> Hide Form
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" /> Add Notice
              </>
            )}
          </Button>
        </div>
      </div>

      {/* FORM SECTION */}
      {showForm && (
        <div className="mb-8">
          <NoticeBoardForm
            loading={loading}
            onSubmit={handleSubmit}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* SEARCH AND FILTERS SECTION */}
      {!showForm && (
        <NoticeBoardSearchFilters
          noticeBoards={noticeBoards}
          filters={filters}
          onFiltersChange={setFilters}
        />
      )}

      {/* CONTENT SECTION */}
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
          <Button onClick={() => setShowForm(true)} id="add-notice-button">
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
      ) : (
        <>
          {displayMode === "grid" ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredNotices.map((noticeBoard) => (
                <NoticeBoardCard
                  key={noticeBoard.id}
                  noticeBoard={noticeBoard}
                  showStatus={true}
                  canEdit={canEditNotice(noticeBoard)}
                  onEdit={() => handleEdit(noticeBoard)}
                />
              ))}
            </div>
          ) : (
            <NoticeBoardTable
              data={filteredNotices}
              onEditClick={handleEdit}
              onDeleteClick={(id) => {
                setNoticeBoardToDelete(id);
                setIsDeleteDialogOpen(true);
              }}
              onTogglePinClick={handleTogglePin}
              showStatus={true}
              canEdit={canEditNotice}
            />
          )}
        </>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Notice</DialogTitle>
            {selectedNoticeBoard?.status === "rejected" && (
              <DialogDescription className="text-orange-600">
                This notice was previously declined. Making changes will
                resubmit it for approval.
              </DialogDescription>
            )}
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
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this notice? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              {loading ? <LoadingIcon /> : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NoticeBoardPage;
