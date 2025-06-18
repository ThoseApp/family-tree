"use client";

import Image from "next/image";
import { X, Edit3, ImageOff } from "lucide-react"; // Added ImageOff for error state
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import React from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"; // Adjust path as per your project structure
import { Button } from "@/components/ui/button"; // Adjust path as per your project structure
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

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imageName?: string;
  onConfirm: () => void;
  onEdit?: () => void;
  isLoading?: boolean; // Optional: for loading state on OK button
  showCaptionInput?: boolean; // Whether to show the caption input field
  captionValue?: string; // Current caption value
  onCaptionChange?: (value: string) => void; // Handler for caption changes
  showAlbumSelection?: boolean; // Whether to show album selection
  albums?: Album[]; // Available albums
  selectedAlbumId?: string; // Currently selected album ID
  onAlbumChange?: (albumId: string) => void; // Handler for album changes
  editMode?: boolean; // Whether in edit mode
  editButtonText?: string; // Text for edit button
  confirmButtonText?: string; // Text for confirm button
}

export const ImagePreviewModal = ({
  isOpen,
  onClose,
  imageUrl,
  imageName = "image.jpeg",
  onConfirm,
  onEdit,
  isLoading,
  showCaptionInput = false,
  captionValue = "",
  onCaptionChange = () => {},
  showAlbumSelection = false,
  albums = [],
  selectedAlbumId = "",
  onAlbumChange = () => {},
  editMode = false,
  editButtonText = "Edit",
  confirmButtonText = "OK",
}: ImagePreviewModalProps) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [caption, setCaption] = useState(captionValue);
  const maxCaptionLength = 200;

  // Sync captionValue prop with local state
  React.useEffect(() => {
    setCaption(captionValue);
  }, [captionValue]);

  const handleCaptionChange = (value: string) => {
    if (value.length <= maxCaptionLength) {
      setCaption(value);
      onCaptionChange(value);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl w-full bg-white dark:bg-gray-900 p-0 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              Image Preview
              {imageName && (
                <span className="text-base font-normal text-gray-500 dark:text-gray-400 ml-3">
                  {imageName}
                </span>
              )}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="p-6 flex-grow overflow-y-auto">
          <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            {!imgLoaded && !imgError && (
              <div className="absolute inset-0 flex items-center justify-center animate-pulse">
                <div className="w-24 h-24 bg-gray-200 dark:bg-gray-600 rounded-full" />
              </div>
            )}
            {imgError ? (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <ImageOff className="w-12 h-12 text-gray-400 mb-2" />
                <p className="text-gray-500 dark:text-gray-400">
                  Image not available
                </p>
              </div>
            ) : (
              <Image
                src={imageUrl}
                alt={imageName || "Image preview"}
                layout="fill"
                objectFit="contain"
                className={`transition-transform duration-200 ${
                  imgLoaded ? "hover:scale-105" : ""
                }`}
                onLoadingComplete={() => setImgLoaded(true)}
                onError={() => setImgError(true)}
                priority
              />
            )}
          </div>

          {(showCaptionInput || showAlbumSelection) && (
            <div className="mt-4 space-y-4">
              {showAlbumSelection && (
                <div>
                  <Label
                    htmlFor="album-select"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block"
                  >
                    Album (Optional)
                  </Label>
                  <Select value={selectedAlbumId} onValueChange={onAlbumChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select an album or leave unorganized" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        No Album (Unorganized)
                      </SelectItem>
                      {albums.map((album) => (
                        <SelectItem key={album.id} value={album.id}>
                          {album.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {showCaptionInput && (
                <div>
                  <Label
                    htmlFor="caption"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block"
                  >
                    Caption
                  </Label>
                  <textarea
                    id="caption"
                    value={caption}
                    onChange={(e) => handleCaptionChange(e.target.value)}
                    placeholder="Add a caption for this image (optional)"
                    className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 resize-none min-h-[50px]"
                    maxLength={maxCaptionLength}
                    aria-label="Image caption"
                  />
                  <div className="flex justify-end mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <span>
                      {caption.length}/{maxCaptionLength}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="p-4 pt-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700  space-x-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700/50 transform hover:scale-105 transition-transform duration-150"
            aria-label="Cancel preview"
          >
            Cancel
          </Button>
          {onEdit && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={onEdit}
                    className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700/50 transform hover:scale-105 transition-transform duration-150"
                    aria-label="Edit image"
                  >
                    <Edit3 className="mr-2 h-4 w-4" />
                    {editButtonText}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit image details</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            aria-label="Confirm preview"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </>
            ) : (
              confirmButtonText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Example Usage (can be removed or kept for testing):
//
// const [isPreviewOpen, setIsPreviewOpen] = useState(false);
// const [currentImage, setCurrentImage] = useState({ url: "", name: "" });
//
// const openImagePreview = (url: string, name: string) => {
//   setCurrentImage({ url, name });
//   setIsPreviewOpen(true);
// };
//
// return (
//   <>
//     <Button onClick={() => openImagePreview("https://example.com/your-image.jpg", "vacation.jpeg")}>
//       Preview Image
//     </Button>
//     <ImagePreviewModal
//       isOpen={isPreviewOpen}
//       onClose={() => setIsPreviewOpen(false)}
//       imageUrl={currentImage.url}
//       imageName={currentImage.name}
//       onConfirm={() => {
//         console.log("Confirmed!");
//         setIsPreviewOpen(false);
//       }}
//       onEdit={() => {
//         console.log("Edit clicked!");
//         // Handle edit logic
//       }}
//     />
//   </>
// );
