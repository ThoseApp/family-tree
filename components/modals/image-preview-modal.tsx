"use client";

import Image from "next/image";
import { X, Edit3 } from "lucide-react"; // Assuming lucide-react for icons

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
}

export const ImagePreviewModal = ({
  isOpen,
  onClose,
  imageUrl,
  imageName = "image.jpeg", // Default image name
  onConfirm,
  onEdit,
  isLoading,
  showCaptionInput = false,
  captionValue = "",
  onCaptionChange = () => {},
}: ImagePreviewModalProps) => {
  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl bg-white dark:bg-gray-800 p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Image Preview
              {imageName && (
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                  {imageName}
                </span>
              )}
            </DialogTitle>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>

        <div className="p-6">
          <div className="relative w-full aspect-[2/1] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={imageName || "Image preview"}
                layout="fill"
                objectFit="contain" // Or "cover", depending on desired behavior
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                <p className="text-gray-500 dark:text-gray-400">
                  Image not available
                </p>
              </div>
            )}
          </div>

          {showCaptionInput && (
            <div className="mt-4">
              <Label
                htmlFor="caption"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Caption
              </Label>
              <Input
                id="caption"
                value={captionValue}
                onChange={(e) => onCaptionChange(e.target.value)}
                placeholder="Add a caption for this image"
                className="mt-1"
              />
            </div>
          )}
        </div>

        <DialogFooter className="p-6 pt-0 sm:justify-between bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={onClose}
            className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            Cancel
          </Button>
          <div className="flex items-center space-x-2">
            {onEdit && (
              <Button
                variant="outline"
                onClick={onEdit}
                className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                <Edit3 className="mr-2 h-4 w-4" />
                Edit Image
              </Button>
            )}
            <Button
              onClick={onConfirm}
              disabled={isLoading}
              className="bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white"
            >
              {isLoading ? "Processing..." : "OK"}
            </Button>
          </div>
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
