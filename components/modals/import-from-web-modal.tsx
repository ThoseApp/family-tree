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
import { Label } from "@/components/ui/label";
import { LoadingIcon } from "@/components/loading-icon";
import { Globe, AlertCircle } from "lucide-react";
import Image from "next/image";

interface ImportFromWebModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (imageUrl: string, caption: string) => Promise<void>;
  isLoading?: boolean;
}

export const ImportFromWebModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: ImportFromWebModalProps) => {
  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [isValidUrl, setIsValidUrl] = useState(false);
  const [urlError, setUrlError] = useState("");

  // Validate and preview image URL
  const validateImageUrl = async (url: string) => {
    if (!url.trim()) {
      setIsValidUrl(false);
      setPreviewUrl("");
      setUrlError("");
      return;
    }

    try {
      // Basic URL validation
      const urlObj = new URL(url);

      // Check if it's a valid image URL pattern
      const imageExtensions = /\.(jpg|jpeg|png|gif|bmp|webp)(\?.*)?$/i;
      const isImageUrl =
        imageExtensions.test(urlObj.pathname) ||
        url.includes("unsplash.com") ||
        url.includes("pexels.com") ||
        url.includes("imgur.com") ||
        url.includes("cloudinary.com") ||
        url.includes("picsum.photos");

      if (!isImageUrl) {
        setUrlError(
          "URL doesn't appear to be a valid image link. Try using direct image URLs ending in .jpg, .png, etc."
        );
        setIsValidUrl(false);
        setPreviewUrl("");
        return;
      }

      // Test if image loads with CORS support
      const img = new window.Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        setIsValidUrl(true);
        setPreviewUrl(url);
        setUrlError("");
      };

      img.onerror = () => {
        // Try without crossOrigin for preview (even if it might fail during import)
        const fallbackImg = new window.Image();
        fallbackImg.onload = () => {
          setIsValidUrl(true);
          setPreviewUrl(url);
          setUrlError(
            "⚠️ This image may work but could have CORS restrictions during import"
          );
        };
        fallbackImg.onerror = () => {
          setUrlError(
            "Unable to load image from this URL. The image may not exist or be accessible."
          );
          setIsValidUrl(false);
          setPreviewUrl("");
        };
        fallbackImg.src = url;
      };

      img.src = url;
    } catch (error) {
      setUrlError("Invalid URL format");
      setIsValidUrl(false);
      setPreviewUrl("");
    }
  };

  const handleUrlChange = (url: string) => {
    setImageUrl(url);

    // Debounce validation
    const timeoutId = setTimeout(() => {
      validateImageUrl(url);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const handleConfirm = async () => {
    if (!imageUrl.trim() || !isValidUrl) return;

    try {
      await onConfirm(imageUrl.trim(), caption.trim() || "Imported from web");
      // Reset form
      setImageUrl("");
      setCaption("");
      setPreviewUrl("");
      setIsValidUrl(false);
      setUrlError("");
      onClose();
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setImageUrl("");
      setCaption("");
      setPreviewUrl("");
      setIsValidUrl(false);
      setUrlError("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Import from Web
          </DialogTitle>
          <DialogDescription>
            Enter a valid image URL to import it to your gallery.
            <br />
            <span className="text-xs text-muted-foreground mt-1 block">
              ✅ Best: Direct image URLs (ending in .jpg, .png, etc.)
              <br />
              ⚠️ Limited: Some sites may block access due to CORS restrictions
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="image-url">Image URL *</Label>
            <Input
              id="image-url"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              disabled={isLoading}
              className={urlError ? "border-red-300" : ""}
            />
            {urlError && (
              <div className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                {urlError}
              </div>
            )}
          </div>

          {previewUrl && isValidUrl && (
            <div className="grid gap-2">
              <Label>Preview</Label>
              <div className="relative w-full h-48 bg-gray-100 rounded-md overflow-hidden">
                <Image
                  src={previewUrl}
                  alt="Preview"
                  fill
                  className="object-contain"
                  onError={() => {
                    setUrlError("Failed to load image preview");
                    setIsValidUrl(false);
                    setPreviewUrl("");
                  }}
                />
              </div>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="caption">Caption (Optional)</Label>
            <Input
              id="caption"
              placeholder="Enter a caption for this image..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              disabled={isLoading}
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
            disabled={isLoading || !imageUrl.trim() || !isValidUrl}
            className="bg-foreground text-background rounded-full hover:bg-foreground/80"
          >
            {isLoading && <LoadingIcon className="mr-2" />}
            Import Image
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
