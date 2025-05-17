"use client";

import NoticeBoardCard from "@/components/cards/notice-board-card";
import NoticeBoardForm from "@/components/forms/notice-board-form";
import NoticeBoardTable from "@/components/tables/notice-board";
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
import { Plus, ChevronDown, ChevronUp } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNoticeBoardStore } from "@/stores/notice-board-store";
import { NoticeBoard } from "@/lib/types";
import { toast } from "sonner";

const NoticeBoardPage = () => {
  const {
    noticeBoards,
    loading,
    fetchNoticeBoards,
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

  useEffect(() => {
    fetchNoticeBoards();
  }, [fetchNoticeBoards]);

  const handleSubmit = async (data: Omit<NoticeBoard, "id">) => {
    try {
      await createNoticeBoard(data);
      setShowForm(false);
    } catch (error) {
      toast.error("Failed to create notice");
    }
  };

  const handleEdit = (noticeBoard: NoticeBoard) => {
    setSelectedNoticeBoard(noticeBoard);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (data: Omit<NoticeBoard, "id">) => {
    if (!selectedNoticeBoard) return;

    try {
      await updateNoticeBoard(selectedNoticeBoard.id, data);
      setIsEditDialogOpen(false);
      setSelectedNoticeBoard(null);
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

  return (
    <div className="flex flex-col gap-y-8 lg:gap-y-12">
      {/* HEADER SECTION */}
      <div className="flex md:items-center md:flex-row flex-col md:justify-between gap-y-4">
        <h1 className="text-2xl font-semibold">Family Notice Board</h1>
        {/* <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDisplayMode("grid")}
              className={displayMode === "grid" ? "bg-muted" : ""}
            >
              Grid
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDisplayMode("table")}
              className={displayMode === "table" ? "bg-muted" : ""}
            >
              Table
            </Button>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
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
        </div> */}
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

      {/* CONTENT SECTION */}
      {loading && noticeBoards.length === 0 ? (
        <div className="flex justify-center items-center h-40">
          <LoadingIcon className="h-8 w-8" />
        </div>
      ) : (
        <>
          {displayMode === "grid" ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {noticeBoards.map((noticeBoard) => (
                <NoticeBoardCard
                  key={noticeBoard.id}
                  noticeBoard={noticeBoard}
                />
              ))}
            </div>
          ) : (
            <NoticeBoardTable
              data={noticeBoards}
              onEditClick={handleEdit}
              onDeleteClick={(id) => {
                setNoticeBoardToDelete(id);
                setIsDeleteDialogOpen(true);
              }}
              onTogglePinClick={handleTogglePin}
            />
          )}
        </>
      )}

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
