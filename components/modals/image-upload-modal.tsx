import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { LoadingIcon } from "@/components/loading-icon";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { uploadImage } from "@/lib/file-upload";
import { BucketFolderEnum } from "@/lib/constants/enums";

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageUploaded: (imageUrl: string) => void;
  title?: string;
  currentImageUrl?: string;
}

const ImageUploadModal = ({
  isOpen,
  onClose,
  onImageUploaded,
  title = "Upload Image",
  currentImageUrl,
}: ImageUploadModalProps) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(currentImageUrl || "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select an image to upload");
      return;
    }

    setUploading(true);
    try {
      const imageUrl = await uploadImage(
        selectedFile,
        BucketFolderEnum.landing_page
      );
      if (imageUrl) {
        onImageUploaded(imageUrl);
        toast.success("Image uploaded successfully!");
        handleClose();
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(currentImageUrl || "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const isValidImageUrl = (url: string) => {
    if (!url) return false;
    try {
      return (
        url.startsWith("http://") ||
        url.startsWith("https://") ||
        url.startsWith("/")
      );
    } catch {
      return false;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Image Preview */}
          {previewUrl && isValidImageUrl(previewUrl) ? (
            <div className="relative w-full h-64 rounded-lg border overflow-hidden">
              <Image
                src={previewUrl}
                alt="Preview"
                fill
                className="object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 rounded-full"
                onClick={handleRemoveImage}
                disabled={uploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="w-full h-64 rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center text-muted-foreground">
              <ImageIcon className="h-12 w-12 mb-4" />
              <p className="text-sm">No image selected</p>
            </div>
          )}

          {/* File Input */}
          <div className="space-y-2">
            <Label htmlFor="image-upload">Select Image</Label>
            <div className="flex items-center space-x-2">
              <Input
                ref={fileInputRef}
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={uploading}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Upload className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Supported formats: JPEG, PNG, WebP. Max size: 5MB
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={uploading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={uploading || !selectedFile}
            className="bg-foreground text-background hover:bg-foreground/80"
          >
            {uploading ? (
              <>
                <LoadingIcon className="h-4 w-4 mr-2" />
                Uploading...
              </>
            ) : (
              "Upload Image"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageUploadModal;
