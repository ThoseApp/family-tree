"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LoadingIcon } from "@/components/loading-icon";
import { Label } from "@/components/ui/label";

interface CreateAlbumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string, description?: string) => Promise<void>;
  isLoading?: boolean;
}

export const CreateAlbumModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: CreateAlbumModalProps) => {
  const [albumName, setAlbumName] = useState("");
  const [albumDescription, setAlbumDescription] = useState("");

  const handleConfirm = async () => {
    if (!albumName.trim()) return;

    try {
      await onConfirm(albumName.trim(), albumDescription.trim() || undefined);
      // Reset form
      setAlbumName("");
      setAlbumDescription("");
      onClose();
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setAlbumName("");
      setAlbumDescription("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Album</DialogTitle>
          <DialogDescription>
            Create a new album to organize your photos and videos.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="album-name">Album Name *</Label>
            <Input
              id="album-name"
              placeholder="Enter album name..."
              value={albumName}
              onChange={(e) => setAlbumName(e.target.value)}
              disabled={isLoading}
              maxLength={50}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="album-description">Description (Optional)</Label>
            <Textarea
              id="album-description"
              placeholder="Enter album description..."
              value={albumDescription}
              onChange={(e) => setAlbumDescription(e.target.value)}
              disabled={isLoading}
              rows={3}
              maxLength={200}
            />
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="rounded-full"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || !albumName.trim()}
            className="bg-foreground text-background rounded-full hover:bg-foreground/80"
          >
            {isLoading && <LoadingIcon className="mr-2" />}
            Create Album
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
