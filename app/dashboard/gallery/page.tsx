"use client";

import { Button } from "@/components/ui/button";
import { AlignJustify, Download, LayoutGrid, Plus, Search } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import GalleryTable from "@/components/tables/gallery";
import { useGalleryStore } from "@/stores/gallery-store";
import { LoadingIcon } from "@/components/loading-icon";
import { ImagePreviewModal } from "@/components/modals/image-preview-modal";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import GalleryGrid from "@/components/gallery";
import { Input } from "@/components/ui/input";
import { useUserStore } from "@/stores/user-store";
import { MAX_IMAGE_SIZE_MB, MAX_VIDEO_SIZE_MB } from "@/lib/constants";

const Page = () => {
  const { user } = useUserStore();
  const {
    userGallery,
    isLoading,
    fetchUserGallery,
    uploadToGallery,
    deleteFromGallery,
    updateGalleryDetails,
  } = useGalleryStore();
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);
  const [captionInput, setCaptionInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (user) {
      fetchUserGallery(user.id);
    }
  }, [user]);

  /**
   * Handle Upload of image of video
   * @param e Input on Chaage Event
   * @returns
   */

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Basic validation
    if (!file.type.startsWith("image/") || !file.type.startsWith("video/")) {
      toast.error("Please select an image or video file");
      return;
    }

    const fileType = file.type.startsWith("image/") ? "image" : "video";

    const maxSize =
      (fileType === "image" ? MAX_IMAGE_SIZE_MB : MAX_VIDEO_SIZE_MB) *
      1024 *
      1024; // 5MB
    if (file.size > maxSize) {
      toast.error(
        `${fileType.charAt(0).toUpperCase()} size must be less than ${maxSize}`
      );
      return;
    }

    // Preview before upload
    const imageUrl = URL.createObjectURL(file);
    setSelectedImage({
      url: imageUrl,
      name: file.name,
      file: file,
      caption: "",
    });
    setCaptionInput("");
    setIsPreviewOpen(true);

    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUploadConfirm = async () => {
    if (!user) {
      toast.error("User not authenticated");
      return;
    }

    if (!selectedImage?.file) return;

    try {
      await uploadToGallery(
        selectedImage.file,
        captionInput || selectedImage.name,
        user?.id
      );
      toast.success("Gallery uploaded successfully");
      setIsPreviewOpen(false);
      setSelectedImage(null);
    } catch (error) {
      toast.error("Failed to upload image");
    }
  };

  const handlePreviewImage = (image: any) => {
    setSelectedImage({
      url: image.image || image.url,
      name: image.name,
      id: image.id,
    });
    setIsPreviewOpen(true);
  };

  const handleDeleteImage = async (id: string) => {
    setImageToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!imageToDelete) return;

    try {
      await deleteFromGallery(imageToDelete);
      toast.success("Image deleted successfully");
      // If we're previewing the image that was deleted, close the preview
      if (selectedImage?.id === imageToDelete) {
        setIsPreviewOpen(false);
        setSelectedImage(null);
      }
    } catch (error) {
      toast.error("Failed to delete image");
    } finally {
      setIsDeleteDialogOpen(false);
      setImageToDelete(null);
    }
  };

  // Helper function to safely format dates
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown date";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return "Invalid date";
    }
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return "Unknown time";
    try {
      return new Date(dateString).toLocaleTimeString();
    } catch (error) {
      return "Invalid time";
    }
  };

  // Convert gallery store images to the format expected by the GalleryTable component
  const tableData = userGallery.map((img) => ({
    id: img.id,
    name: img.caption || `Image-${img.id}`,
    image: img.url,
    fileSize: img.file_size,
    uploadDate: formatDate(img.uploaded_at || img.created_at),
    uploadTime: formatTime(img.uploaded_at || img.created_at),
    uploader: "Me", // Placeholder - would come from user data
  }));

  // Format for GalleryGrid component
  const gridData = userGallery.map((img) => ({
    id: img.id,
    url: img.url,
    caption: img.caption || `Image-${img.id}`,
    uploaded_at: img.uploaded_at,
    created_at: img.created_at || new Date().toISOString(),
    updated_at: img.updated_at,
    user_id: img.user_id || (user?.id ?? ""),
    file_name: img.file_name || img.caption || `Image-${img.id}`,
    file_size: img.file_size || 0,
  }));

  // Filter images based on search query
  const filteredTableData = tableData.filter((img) =>
    img.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGridData = gridData.filter((img) =>
    (img.caption || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-y-8 lg:gap-y-12">
      {/* HEADER SECTION */}
      <div className="flex md:items-center md:flex-row flex-col md:justify-between gap-y-4">
        <h1 className="text-2xl font-semibold">Manage Family Gallery</h1>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "table" ? "default" : "outline"}
              size="icon"
              className="rounded-full"
              onClick={() => setViewMode("table")}
            >
              <AlignJustify className="size-5" />
            </Button>

            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              className="rounded-full"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="size-5" />
            </Button>
          </div>
          <Button variant="outline" className="rounded-full">
            <Download className="size-5 mr-2" />
            Import from Web
          </Button>

          <Button
            className="bg-foreground text-background rounded-full hover:bg-foreground/80"
            onClick={() => fileInputRef.current?.click()}
          >
            <Plus className="size-5 mr-2" />
            Upload File (Image/Video)
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*,video/*"
            onChange={handleFileUpload}
          />
        </div>
      </div>

      {/* Search input */}
      <div className="relative w-full max-w-md">
        <Input
          placeholder="Search by caption..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>

      {isLoading && (userGallery.length === 0 || gridData.length === 0) ? (
        <div className="flex items-center justify-center h-40">
          <LoadingIcon className="size-8" />
        </div>
      ) : viewMode === "table" ? (
        <GalleryTable
          data={filteredTableData as any}
          onUserClick={handlePreviewImage}
          deleteImage={handleDeleteImage}
          previewImage={handlePreviewImage}
        />
      ) : (
        <div className="mt-4">
          <GalleryGrid
            gallery={filteredGridData}
            onImageClick={(image) => {
              // Convert the grid image format to the format expected by handlePreviewImage
              const formattedImage = {
                id: image.id,
                name: image.caption,
                image: image.url,
              };
              handlePreviewImage(formattedImage);
            }}
          />
        </div>
      )}

      {/* Show a message when no results are found */}
      {!isLoading &&
        searchQuery &&
        ((viewMode === "table" && filteredTableData.length === 0) ||
          (viewMode === "grid" && filteredGridData.length === 0)) && (
          <div className="text-center py-10">
            <p className="text-muted-foreground">
              No images found matching &quot;{searchQuery}&quot;
            </p>
          </div>
        )}

      {/* Image Preview Modal */}
      <ImagePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          // If we were viewing a temporary file (new upload), revoke the URL
          if (selectedImage?.file && selectedImage?.url) {
            URL.revokeObjectURL(selectedImage.url);
          }
        }}
        imageUrl={selectedImage?.url || ""}
        imageName={selectedImage?.name || ""}
        captionValue={captionInput}
        onCaptionChange={(value) => setCaptionInput(value)}
        onConfirm={
          selectedImage?.file
            ? handleUploadConfirm
            : () => setIsPreviewOpen(false)
        }
        onEdit={
          selectedImage?.file
            ? undefined
            : () => {
                // Implement edit functionality if needed
                setIsPreviewOpen(false);
              }
        }
        isLoading={isLoading}
        showCaptionInput={!!selectedImage?.file}
      />

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this image? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isLoading}
              className="rounded-full"
            >
              {isLoading && <LoadingIcon className="mr-2" />}
              Delete
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Page;
