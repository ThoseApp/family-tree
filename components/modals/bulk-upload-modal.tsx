"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Play,
  Loader2,
  RotateCcw,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Album } from "@/stores/album-store";
import { useGalleryStore, BulkItemStatus } from "@/stores/gallery-store";
import { MAX_IMAGE_SIZE_MB, MAX_VIDEO_SIZE_MB } from "@/lib/constants";

const MAX_BULK_FILES = 50;

interface BulkFileItem {
  key: string;
  file: File;
  caption: string;
  previewUrl: string; // object URL for images; "" for videos
  isVideo: boolean;
  status: BulkItemStatus;
  error?: string;
}

interface RejectedFile {
  name: string;
  reason: string;
}

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: { id: string } | null;
  albums: Album[];
  defaultAlbumId?: string;
  onComplete: () => void;
}

const BulkUploadModal = ({
  isOpen,
  onClose,
  user,
  albums,
  defaultAlbumId,
  onComplete,
}: BulkUploadModalProps) => {
  const { bulkUploadToGallery } = useGalleryStore();
  const [items, setItems] = useState<BulkFileItem[]>([]);
  const [rejected, setRejected] = useState<RejectedFile[]>([]);
  const [albumId, setAlbumId] = useState<string>(defaultAlbumId ?? "none");
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync the shared album to the currently-open album each time the modal opens.
  useEffect(() => {
    if (isOpen) setAlbumId(defaultAlbumId ?? "none");
  }, [isOpen, defaultAlbumId]);

  const patchItem = (key: string, patch: Partial<BulkFileItem>) => {
    setItems((prev) =>
      prev.map((it) => (it.key === key ? { ...it, ...patch } : it))
    );
  };

  const addFiles = (fileList: FileList | File[]) => {
    const incoming = Array.from(fileList);
    const accepted: BulkFileItem[] = [];
    const newRejected: RejectedFile[] = [];

    for (const file of incoming) {
      if (items.length + accepted.length >= MAX_BULK_FILES) {
        newRejected.push({
          name: file.name,
          reason: `Batch limit of ${MAX_BULK_FILES} files reached`,
        });
        continue;
      }

      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      if (!isImage && !isVideo) {
        newRejected.push({ name: file.name, reason: "Not an image or video" });
        continue;
      }

      const maxMb = isImage ? MAX_IMAGE_SIZE_MB : MAX_VIDEO_SIZE_MB;
      if (file.size > maxMb * 1024 * 1024) {
        newRejected.push({
          name: file.name,
          reason: `Exceeds ${maxMb}MB limit`,
        });
        continue;
      }

      accepted.push({
        key: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        caption: file.name,
        previewUrl: isVideo ? "" : URL.createObjectURL(file),
        isVideo,
        status: "queued",
      });
    }

    if (accepted.length) setItems((prev) => [...prev, ...accepted]);
    if (newRejected.length) setRejected((prev) => [...prev, ...newRejected]);
  };

  const removeItem = (key: string) => {
    setItems((prev) => {
      const target = prev.find((it) => it.key === key);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((it) => it.key !== key);
    });
  };

  const resetAndClose = () => {
    items.forEach((it) => {
      if (it.previewUrl) URL.revokeObjectURL(it.previewUrl);
    });
    setItems([]);
    setRejected([]);
    setIsUploading(false);
    onClose();
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  const handleUploadAll = async () => {
    if (!user) {
      toast.error("User not authenticated");
      return;
    }
    const pending = items.filter(
      (it) => it.status === "queued" || it.status === "failed"
    );
    if (pending.length === 0) return;

    setIsUploading(true);

    const captions: Record<string, string> = {};
    pending.forEach((it) => {
      captions[it.key] = it.caption;
    });
    const entries = pending.map((it) => ({ key: it.key, file: it.file }));

    try {
      const { success, failed } = await bulkUploadToGallery(
        entries,
        {
          userId: user.id,
          albumId: albumId !== "none" ? albumId : undefined,
          captions,
        },
        (key, patch) => patchItem(key, patch)
      );

      if (failed === 0) {
        toast.success(`Uploaded ${success} file${success > 1 ? "s" : ""}`);
      } else {
        toast.warning(`${success} uploaded, ${failed} failed`);
      }
      onComplete();
    } catch (err) {
      toast.error("Bulk upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const retryItem = async (key: string) => {
    const item = items.find((it) => it.key === key);
    if (!item || !user) return;

    const { success } = await bulkUploadToGallery(
      [{ key: item.key, file: item.file }],
      {
        userId: user.id,
        albumId: albumId !== "none" ? albumId : undefined,
        captions: { [key]: item.caption },
      },
      (k, patch) => patchItem(k, patch)
    );

    if (success > 0) onComplete();
  };

  if (!isOpen) return null;

  const doneCount = items.filter((it) => it.status === "done").length;
  const hasUploaded = items.some((it) => it.status !== "queued");
  const pendingCount = items.filter(
    (it) => it.status === "queued" || it.status === "failed"
  ).length;

  return (
    <Dialog open={isOpen} onOpenChange={resetAndClose}>
      <DialogContent className="sm:max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>Bulk Upload</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Album selector */}
          <div>
            <Label className="text-sm font-medium mb-1 block">
              Album (applies to all files)
            </Label>
            <Select value={albumId} onValueChange={setAlbumId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an album or leave unorganized" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Album (Unorganized)</SelectItem>
                {albums.map((album) => (
                  <SelectItem key={album.id} value={album.id}>
                    {album.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Drop zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-3">
              Drop images/videos here (up to {MAX_BULK_FILES})
            </p>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              Select Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files) addFiles(e.target.files);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
            />
          </div>

          {/* Rejected files */}
          {rejected.length > 0 && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 space-y-1">
              <p className="text-sm font-medium text-red-700">
                Skipped {rejected.length} file(s):
              </p>
              {rejected.map((r, i) => (
                <p key={i} className="text-xs text-red-600">
                  {r.name} — {r.reason}
                </p>
              ))}
            </div>
          )}

          {/* Review grid */}
          {items.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{items.length} file(s)</p>
                {hasUploaded && (
                  <p className="text-sm text-muted-foreground">
                    {doneCount} / {items.length} done
                  </p>
                )}
              </div>

              {items.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center gap-3 border rounded-md p-2"
                >
                  <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded bg-gray-900">
                    {item.isVideo ? (
                      <div className="flex h-full w-full items-center justify-center">
                        <Play className="h-5 w-5 text-white fill-white" />
                      </div>
                    ) : (
                      <Image
                        src={item.previewUrl}
                        alt={item.file.name}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <Input
                      value={item.caption}
                      onChange={(e) =>
                        patchItem(item.key, { caption: e.target.value })
                      }
                      disabled={isUploading}
                      className="h-8 text-sm"
                    />
                    {item.status === "failed" && item.error && (
                      <p className="text-xs text-red-600 mt-1 truncate">
                        {item.error}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    {item.status === "uploading" && (
                      <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                    )}
                    {item.status === "done" && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    {item.status === "failed" && (
                      <>
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => retryItem(item.key)}
                          aria-label="Retry"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    {item.status === "queued" && !isUploading && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => removeItem(item.key)}
                        aria-label="Remove"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="pt-2">
          <Button variant="outline" onClick={resetAndClose}>
            {hasUploaded ? "Close" : "Cancel"}
          </Button>
          <Button
            onClick={handleUploadAll}
            disabled={isUploading || pendingCount === 0}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              `Upload all (${pendingCount})`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkUploadModal;
