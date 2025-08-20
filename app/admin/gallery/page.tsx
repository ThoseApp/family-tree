"use client";

import { Button } from "@/components/ui/button";
import {
  AlignJustify,
  Download,
  LayoutGrid,
  Plus,
  Search,
  Filter,
  Folder,
  ImageIcon,
  Calendar,
  X,
  FileImage,
  FileVideo,
} from "lucide-react";
import React, { useState, useEffect, useRef, useMemo } from "react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
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
    fetchUserGalleryByAlbum,
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
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCaption, setEditingCaption] = useState("");
  const [selectedAlbum, setSelectedAlbum] = useState<any>(null);
  const [albumGallery, setAlbumGallery] = useState<any[]>([]);

  // Enhanced filtering states
  const [fileTypeFilter, setFileTypeFilter] = useState<string>("all");
  const [albumFilter, setAlbumFilter] = useState<string>("all");
  const [dateRangeFilter, setDateRangeFilter] = useState<string>("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<string>("newest");

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

  // Enhanced filtering logic
  const filteredGallery = useMemo(() => {
    let filtered = [...userGallery];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((item) =>
        (item.caption || item.file_name || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
    }

    // File type filter
    if (fileTypeFilter !== "all") {
      filtered = filtered.filter((item) => {
        const fileName = item.file_name || "";
        const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(fileName);
        const isVideo = /\.(mp4|avi|mov|wmv|flv|webm)$/i.test(fileName);

        if (fileTypeFilter === "images") return isImage;
        if (fileTypeFilter === "videos") return isVideo;
        return true;
      });
    }

    // Album filter
    if (albumFilter !== "all") {
      if (albumFilter === "no-album") {
        filtered = filtered.filter((item) => !item.album_id);
      } else {
        filtered = filtered.filter((item) => item.album_id === albumFilter);
      }
    }

    // Date range filter
    if (dateRangeFilter !== "all") {
      const now = new Date();
      const filterDate = new Date();

      switch (dateRangeFilter) {
        case "today":
          filterDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          filterDate.setDate(now.getDate() - 7);
          break;
        case "month":
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case "year":
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      if (dateRangeFilter !== "all") {
        filtered = filtered.filter((item) => {
          const itemDate = new Date(item.created_at);
          return itemDate >= filterDate;
        });
      }
    }

    // Sort the filtered results
    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);

      switch (sortBy) {
        case "newest":
          return dateB.getTime() - dateA.getTime();
        case "oldest":
          return dateA.getTime() - dateB.getTime();
        case "name":
          return (a.caption || a.file_name || "").localeCompare(
            b.caption || b.file_name || ""
          );
        default:
          return dateB.getTime() - dateA.getTime();
      }
    });

    return filtered;
  }, [
    userGallery,
    searchQuery,
    fileTypeFilter,
    albumFilter,
    dateRangeFilter,
    sortBy,
  ]);

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setFileTypeFilter("all");
    setAlbumFilter("all");
    setDateRangeFilter("all");
    setSortBy("newest");
  };

  // Check if any filters are active
  const hasActiveFilters =
    searchQuery ||
    statusFilter !== "all" ||
    fileTypeFilter !== "all" ||
    albumFilter !== "all" ||
    dateRangeFilter !== "all" ||
    sortBy !== "newest";

  // Count active filters
  const activeFiltersCount = [
    searchQuery,
    statusFilter !== "all" ? statusFilter : null,
    fileTypeFilter !== "all" ? fileTypeFilter : null,
    albumFilter !== "all" ? albumFilter : null,
    dateRangeFilter !== "all" ? dateRangeFilter : null,
    sortBy !== "newest" ? sortBy : null,
  ].filter(Boolean).length;

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
      url: image.url, // Fix: Use image.url directly as that's the actual property
      name: image.title || image.name || image.caption || image.file_name,
      id: image.id,
      caption: image.title || image.caption,
      file_name: image.file_name,
    });
    setEditingCaption(image.title || image.caption || "");
    setIsEditMode(false);
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

  const handleEditImage = () => {
    setIsEditMode(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedImage?.id) {
      toast.error("No image selected");
      return;
    }

    try {
      await updateGalleryDetails(selectedImage.id, {
        caption: editingCaption,
      });

      // Update the selected image with new caption
      setSelectedImage({
        ...selectedImage,
        caption: editingCaption,
        name: editingCaption || selectedImage.file_name,
      });

      setIsEditMode(false);
      toast.success("Image updated successfully");
    } catch (error) {
      toast.error("Failed to update image");
    }
  };

  const handleCancelEdit = () => {
    setEditingCaption(selectedImage?.caption || "");
    setIsEditMode(false);
  };

  const handleAlbumClick = (album: any) => {
    // Navigate to album view - you can implement this based on your routing needs
    console.log("Album clicked:", album);
    // For now, switch to grid view filtered by this album
    setViewMode("grid");
    // You might want to add album filtering logic here
  };

  const handleSidebarAlbumClick = async (album: any) => {
    if (!user) return;

    try {
      setSelectedAlbum(album);
      const albumItems = await fetchUserGalleryByAlbum(user.id, album.id);
      setAlbumGallery(albumItems);
    } catch (error) {
      toast.error("Failed to load album contents");
    }
  };

  const handleBackToAllAlbums = () => {
    setSelectedAlbum(null);
    setAlbumGallery([]);
  };

  // Calculate status counts
  const statusCounts = {
    total: filteredGallery.length,
    approved: filteredGallery.filter((item) => item.status === "approved")
      .length,
    pending: filteredGallery.filter((item) => item.status === "pending").length,
    rejected: filteredGallery.filter((item) => item.status === "rejected")
      .length,
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
            id="upload-gallery-button"
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

      {/* ENHANCED FILTERING SECTION */}
      {(viewMode === "grid" || viewMode === "table") && (
        <div className="space-y-4">
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative w-full flex-1">
              <Input
                placeholder="Search by caption or filename..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-full"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>

            <div className="flex items-center gap-2">
              <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="rounded-full relative">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                    {activeFiltersCount > 0 && (
                      <Badge className="ml-2 h-5 w-5 p-0 text-xs rounded-full">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4" align="end">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Filter Options</h4>
                      {hasActiveFilters && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearAllFilters}
                          className="h-8 px-2 text-xs"
                        >
                          Clear All
                        </Button>
                      )}
                    </div>

                    <div className="space-y-3">
                      {/* Status Filter */}
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Status
                        </label>
                        <Select
                          value={statusFilter}
                          onValueChange={setStatusFilter}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Filter by status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* File Type Filter */}
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          File Type
                        </label>
                        <Select
                          value={fileTypeFilter}
                          onValueChange={setFileTypeFilter}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Filter by type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="images">
                              <div className="flex items-center gap-2">
                                <FileImage className="h-4 w-4" />
                                Images
                              </div>
                            </SelectItem>
                            <SelectItem value="videos">
                              <div className="flex items-center gap-2">
                                <FileVideo className="h-4 w-4" />
                                Videos
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Album Filter */}
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Album
                        </label>
                        <Select
                          value={albumFilter}
                          onValueChange={setAlbumFilter}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Filter by album" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Albums</SelectItem>
                            <SelectItem value="no-album">No Album</SelectItem>
                            {userAlbums.map((album) => (
                              <SelectItem key={album.id} value={album.id}>
                                {album.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Date Range Filter */}
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Date Range
                        </label>
                        <Select
                          value={dateRangeFilter}
                          onValueChange={setDateRangeFilter}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Filter by date" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Time</SelectItem>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="week">This Week</SelectItem>
                            <SelectItem value="month">This Month</SelectItem>
                            <SelectItem value="year">This Year</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Sort By */}
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Sort By
                        </label>
                        <Select value={sortBy} onValueChange={setSortBy}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Sort by" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="newest">Newest First</SelectItem>
                            <SelectItem value="oldest">Oldest First</SelectItem>
                            <SelectItem value="name">Name (A-Z)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Active filters:
              </span>
              {searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: &quot;{searchQuery}&quot;
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setSearchQuery("")}
                  />
                </Badge>
              )}
              {statusFilter !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Status: {statusFilter}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setStatusFilter("all")}
                  />
                </Badge>
              )}
              {fileTypeFilter !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Type: {fileTypeFilter}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setFileTypeFilter("all")}
                  />
                </Badge>
              )}
              {albumFilter !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Album:{" "}
                  {albumFilter === "no-album"
                    ? "No Album"
                    : userAlbums.find((a) => a.id === albumFilter)?.name ||
                      albumFilter}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setAlbumFilter("all")}
                  />
                </Badge>
              )}
              {dateRangeFilter !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Date: {dateRangeFilter}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setDateRangeFilter("all")}
                  />
                </Badge>
              )}
              {sortBy !== "newest" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Sort: {sortBy}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setSortBy("newest")}
                  />
                </Badge>
              )}
            </div>
          )}
        </div>
      )}

      {(isLoading && userGallery.length === 0) ||
      (albumsLoading && userAlbums.length === 0) ? (
        <div className="flex items-center justify-center h-40">
          <LoadingIcon className="size-8" />
        </div>
      ) : viewMode === "albums" ? (
        <div className="flex h-[calc(100vh-200px)] bg-gray-50 rounded-lg overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-yellow-50">
              <h2 className="text-lg font-semibold text-gray-900">
                Media Library
              </h2>
            </div>
            <div className="flex-1 p-4">
              <div className="space-y-2">
                {selectedAlbum && (
                  <div
                    className="flex items-center gap-2 text-gray-600 hover:bg-gray-100 p-2 rounded cursor-pointer mb-2"
                    onClick={handleBackToAllAlbums}
                  >
                    <span className="text-sm">← Back to Albums</span>
                  </div>
                )}
                {!selectedAlbum && userAlbums.length > 0 ? (
                  userAlbums.map((album) => (
                    <div
                      key={album.id}
                      className="flex items-center gap-2 text-gray-700 hover:bg-yellow-50 p-2 rounded cursor-pointer"
                      onClick={() => handleSidebarAlbumClick(album)}
                    >
                      <Folder className="w-4 h-4" />
                      <span className="text-sm">{album.name}</span>
                      <span className="text-xs text-gray-400 ml-auto">
                        {album.item_count}
                      </span>
                    </div>
                  ))
                ) : !selectedAlbum ? (
                  <div className="text-gray-500 text-sm p-2">No albums yet</div>
                ) : null}
              </div>
              <div className="mt-6">
                <button
                  onClick={() => setIsCreateAlbumModalOpen(true)}
                  className="flex items-center gap-2 text-yellow-600 hover:text-yellow-700 text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  New Folder
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Breadcrumb */}
            <div className="p-4 bg-white border-b border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Media Library</span>
                <span>›</span>
                {selectedAlbum ? (
                  <>
                    <span
                      className="hover:text-gray-900 cursor-pointer"
                      onClick={handleBackToAllAlbums}
                    >
                      Albums
                    </span>
                    <span>›</span>
                    <span className="font-medium text-gray-900">
                      {selectedAlbum.name}
                    </span>
                  </>
                ) : (
                  <span className="font-medium text-gray-900">Albums</span>
                )}
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6">
              {selectedAlbum ? (
                // Show album contents
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {selectedAlbum.name}
                      </h2>
                      {selectedAlbum.description && (
                        <p className="text-gray-600 text-sm mt-1">
                          {selectedAlbum.description}
                        </p>
                      )}
                      <p className="text-gray-500 text-sm mt-1">
                        {albumGallery.length} items
                      </p>
                    </div>
                  </div>

                  {albumGallery.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No items in this album yet
                      </h3>
                      <p className="text-gray-500 text-sm">
                        Upload images or videos to this album to see them here
                      </p>
                    </div>
                  ) : (
                    <GalleryGrid
                      gallery={albumGallery}
                      onImageClick={handlePreviewImage}
                    />
                  )}
                </div>
              ) : userAlbums.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    You have no album yet
                  </h3>
                  <button
                    onClick={() => setIsCreateAlbumModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-medium rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Create
                  </button>
                </div>
              ) : (
                <AlbumGrid
                  albums={userAlbums}
                  onAlbumClick={handleSidebarAlbumClick}
                />
              )}
            </div>
          </div>
        </div>
      ) : viewMode === "table" ? (
        <GalleryTable
          data={filteredGallery}
          onUserClick={handlePreviewImage}
          deleteImage={handleDeleteImage}
          previewImage={handlePreviewImage}
          showSearchInput={false}
        />
      ) : (
        <div className="mt-4">
          <GalleryGrid
            gallery={filteredGallery}
            onImageClick={(image) => {
              // Pass the image directly as the format is already correct
              handlePreviewImage(image);
            }}
          />
        </div>
      )}

      {/* Show a message when no results are found */}
      {!isLoading &&
        (viewMode === "grid" || viewMode === "table") &&
        filteredGallery.length === 0 &&
        userGallery.length > 0 && (
          <div className="text-center py-10">
            <p className="text-muted-foreground mb-4">
              No items found matching your filters
            </p>
            <Button
              variant="outline"
              onClick={clearAllFilters}
              className="rounded-full"
            >
              Clear All Filters
            </Button>
          </div>
        )}

      {/* Image Preview Modal */}
      <ImagePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setIsEditMode(false);
          setEditingCaption("");
          // If we were viewing a temporary file (new upload), revoke the URL
          if (selectedImage?.file && selectedImage?.url) {
            URL.revokeObjectURL(selectedImage.url);
          }
        }}
        imageUrl={selectedImage?.url || ""}
        imageName={selectedImage?.name || ""}
        captionValue={selectedImage?.file ? captionInput : editingCaption}
        onCaptionChange={(value) => {
          if (selectedImage?.file) {
            setCaptionInput(value);
          } else {
            setEditingCaption(value);
          }
        }}
        onConfirm={
          selectedImage?.file
            ? handleUploadConfirm
            : isEditMode
            ? handleSaveEdit
            : () => setIsPreviewOpen(false)
        }
        onEdit={
          selectedImage?.file
            ? undefined
            : isEditMode
            ? handleCancelEdit
            : handleEditImage
        }
        isLoading={isLoading}
        showCaptionInput={!!selectedImage?.file || isEditMode}
        showAlbumSelection={!!selectedImage?.file}
        albums={userAlbums}
        selectedAlbumId={selectedAlbumId}
        onAlbumChange={setSelectedAlbumId}
        editMode={isEditMode}
        editButtonText={isEditMode ? "Cancel" : "Edit"}
        confirmButtonText={
          selectedImage?.file ? "Upload" : isEditMode ? "Save Changes" : "OK"
        }
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
