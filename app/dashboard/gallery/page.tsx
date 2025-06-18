"use client";

import { Button } from "@/components/ui/button";
import {
  AlignJustify,
  Download,
  LayoutGrid,
  Plus,
  Search,
  Filter,
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import GalleryTable from "@/components/tables/gallery";
import { useGalleryStore } from "@/stores/gallery-store";
import { useAlbumStore } from "@/stores/album-store";
import { LoadingIcon } from "@/components/loading-icon";
import { ImagePreviewModal } from "@/components/modals/image-preview-modal";
import { CreateAlbumModal } from "@/components/modals/create-album-modal";
import { ImportFromWebModal } from "@/components/modals/import-from-web-modal";
import { toast } from "sonner";
import AlbumGrid from "@/components/album-grid";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUserStore } from "@/stores/user-store";
import { MAX_IMAGE_SIZE_MB, MAX_VIDEO_SIZE_MB } from "@/lib/constants";
import { GalleryStatusEnum } from "@/lib/constants/enums";

const Page = () => {
  const { user } = useUserStore();
  const {
    userGallery,
    isLoading,
    fetchUserGallery,
    fetchUserGalleryByStatus,
    uploadToGallery,
    importFromWeb,
    deleteFromGallery,
    updateGalleryDetails,
  } = useGalleryStore();
  const {
    userAlbums,
    isLoading: albumsLoading,
    fetchUserAlbums,
    createAlbum,
    deleteAlbum,
  } = useAlbumStore();
  const [viewMode, setViewMode] = useState<"albums" | "grid" | "table">(
    "albums"
  );
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);
  const [captionInput, setCaptionInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAlbumId, setSelectedAlbumId] = useState("none");
  const [isCreateAlbumModalOpen, setIsCreateAlbumModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    if (user) {
      if (statusFilter === "all") {
        fetchUserGallery(user.id);
      } else {
        fetchUserGalleryByStatus(
          user.id,
          statusFilter as keyof typeof GalleryStatusEnum
        );
      }
      fetchUserAlbums(user.id);
    }
  }, [user, statusFilter]);

  /**
   * Handle Upload of image of video
   * @param e Input on Chaage Event
   * @returns
   */

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    console.log("[ADMIN_ID]", process.env.NEXT_PUBLIC_ADMIN_ID);

    console.log(file);

    // Basic validation
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
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
        user?.id,
        selectedAlbumId && selectedAlbumId !== "none"
          ? selectedAlbumId
          : undefined
      );
      toast.success("Gallery uploaded successfully");
      setIsPreviewOpen(false);
      setSelectedImage(null);
      setSelectedAlbumId("none");
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
    try {
      if (!dateString) return "";
      return new Date(dateString).toLocaleTimeString();
    } catch (error) {
      return "Invalid time";
    }
  };

  const handleCreateAlbum = async (name: string, description?: string) => {
    if (!user) {
      toast.error("User not authenticated");
      return;
    }

    try {
      await createAlbum(name, description, user.id);
      toast.success("Album created successfully");
    } catch (error) {
      toast.error("Failed to create album");
    }
  };

  const handleImportFromWeb = async (imageUrl: string, caption: string) => {
    if (!user) {
      toast.error("User not authenticated");
      return;
    }

    try {
      await importFromWeb(imageUrl, caption, user.id);
      toast.success("Image imported successfully");
    } catch (error) {
      toast.error("Failed to import image from web");
    }
  };

  const handleAlbumClick = (album: any) => {
    // Navigate to album view - you can implement this based on your routing needs
    console.log("Album clicked:", album);
    // For now, switch to grid view filtered by this album
    setViewMode("grid");
    // You might want to add album filtering logic here
  };

  // Calculate status counts
  const statusCounts = {
    total: userGallery.length,
    approved: userGallery.filter((item) => item.status === "approved").length,
    pending: userGallery.filter((item) => item.status === "pending").length,
    rejected: userGallery.filter((item) => item.status === "rejected").length,
  };

  return (
    <div className="flex flex-col gap-y-8 lg:gap-y-12">
      {/* HEADER SECTION */}
      <div className="flex md:items-center md:flex-row flex-col md:justify-between gap-y-4">
        <div>
          <h1 className="text-2xl font-semibold">Manage Family Gallery</h1>
          {!isLoading && (viewMode === "grid" || viewMode === "table") && (
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span>Total: {statusCounts.total}</span>
              <span className="text-green-600">
                Approved: {statusCounts.approved}
              </span>
              <span className="text-yellow-600">
                Pending: {statusCounts.pending}
              </span>
              <span className="text-red-600">
                Rejected: {statusCounts.rejected}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "albums" ? "default" : "outline"}
              size="sm"
              className="rounded-full"
              onClick={() => setViewMode("albums")}
            >
              Albums
            </Button>

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
          {viewMode === "albums" && (
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setIsCreateAlbumModalOpen(true)}
            >
              <Plus className="size-5 mr-2" />
              New Folder
            </Button>
          )}

          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => setIsImportModalOpen(true)}
          >
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

      {viewMode === "grid" && (
        <div className="flex items-center gap-4">
          <div className="relative w-full flex-1">
            <Input
              placeholder="Search by caption..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>

          <div className="flex items-center gap-2">
            {/* <Filter className="h-4 w-4 text-muted-foreground" /> */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {(isLoading && userGallery.length === 0) ||
      (albumsLoading && userAlbums.length === 0) ? (
        <div className="flex items-center justify-center h-40">
          <LoadingIcon className="size-8" />
        </div>
      ) : viewMode === "albums" ? (
        <AlbumGrid albums={userAlbums} onAlbumClick={handleAlbumClick} />
      ) : viewMode === "table" ? (
        <GalleryTable
          data={userGallery}
          onUserClick={handlePreviewImage}
          deleteImage={handleDeleteImage}
          previewImage={handlePreviewImage}
        />
      ) : (
        <div className="mt-4">
          <GalleryGrid
            gallery={userGallery.filter((img) =>
              (img.caption || img.file_name || "")
                .toLowerCase()
                .includes(searchQuery.toLowerCase())
            )}
            onImageClick={(image) => {
              // Convert the grid image format to the format expected by handlePreviewImage
              const formattedImage = {
                id: image.id,
                name: image.caption || image.file_name,
                image: image.url,
              };
              handlePreviewImage(formattedImage);
            }}
          />
        </div>
      )}

      {/* Show a message when no results are found */}
      {!isLoading &&
        viewMode === "grid" &&
        searchQuery &&
        userGallery.filter((img) =>
          (img.caption || img.file_name || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        ).length === 0 && (
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
        showAlbumSelection={!!selectedImage?.file}
        albums={userAlbums}
        selectedAlbumId={selectedAlbumId}
        onAlbumChange={setSelectedAlbumId}
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

      {/* CREATE ALBUM MODAL */}
      <CreateAlbumModal
        isOpen={isCreateAlbumModalOpen}
        onClose={() => setIsCreateAlbumModalOpen(false)}
        onConfirm={handleCreateAlbum}
        isLoading={albumsLoading}
      />

      {/* IMPORT FROM WEB MODAL */}
      <ImportFromWebModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onConfirm={handleImportFromWeb}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Page;
