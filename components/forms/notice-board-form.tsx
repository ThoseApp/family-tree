"use client";

import { NoticeBoard } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import React, { useState, useEffect, useRef } from "react";
import { LoadingIcon } from "@/components/loading-icon";
import { Badge } from "@/components/ui/badge";
import {
  ImageIcon,
  X,
  Upload,
  Trash2,
  FileText,
  Paperclip,
} from "lucide-react";
import { uploadImage, uploadDocument } from "@/lib/file-upload";
import { BucketFolderEnum } from "@/lib/constants/enums";
import Image from "next/image";
import { toast } from "sonner";

interface NoticeBoardFormProps {
  defaultValues?: Partial<NoticeBoard>;
  loading: boolean;
  onSubmit: (data: Omit<NoticeBoard, "id">) => void;
  onCancel: () => void;
}

const NoticeBoardForm = ({
  defaultValues,
  loading,
  onSubmit,
  onCancel,
}: NoticeBoardFormProps) => {
  const isEditing = !!defaultValues?.id;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  const [formData, setFormData] = useState<Omit<NoticeBoard, "id">>({
    title: defaultValues?.title || "",
    description: defaultValues?.description || "",
    image: defaultValues?.image || "",
    pdf_url: defaultValues?.pdf_url || "",
    pdf_name: defaultValues?.pdf_name || "",
    pinned: defaultValues?.pinned || false,
    editor: defaultValues?.editor || "",
    posteddate:
      defaultValues?.posteddate || new Date().toISOString().split("T")[0],
    postedtime:
      defaultValues?.postedtime ||
      new Date().toTimeString().split(" ")[0].substring(0, 5),
    tags: defaultValues?.tags || [],
  });

  const [tagInput, setTagInput] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, pinned: checked }));
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()],
        }));
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (JPEG, PNG, etc.)");
      return;
    }

    setUploading(true);
    try {
      const imageUrl = await uploadImage(file, BucketFolderEnum.notice_boards);
      if (imageUrl) {
        setFormData((prev) => ({ ...prev, image: imageUrl }));
        toast.success("Image uploaded successfully");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
      // Clear the input so the same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image: "" }));
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handlePdfUploadClick = () => {
    pdfInputRef.current?.click();
  };

  const handlePdfFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is a PDF
    if (file.type !== "application/pdf") {
      toast.error("Please select a PDF file");
      return;
    }

    // Check file size (50MB limit for PDFs)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      toast.error("PDF file size exceeds 50MB limit");
      return;
    }

    setUploadingPdf(true);
    try {
      const pdfUrl = await uploadDocument(file, BucketFolderEnum.notice_boards);
      if (pdfUrl) {
        setFormData((prev) => ({
          ...prev,
          pdf_url: pdfUrl,
          pdf_name: file.name,
        }));
        toast.success("PDF uploaded successfully");
      }
    } catch (error) {
      console.error("Error uploading PDF:", error);
      toast.error("Failed to upload PDF");
    } finally {
      setUploadingPdf(false);
      // Clear the input so the same file can be selected again if needed
      if (pdfInputRef.current) {
        pdfInputRef.current.value = "";
      }
    }
  };

  const handleRemovePdf = () => {
    setFormData((prev) => ({
      ...prev,
      pdf_url: "",
      pdf_name: "",
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Check if the image is a valid URL
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

  // Reset form when defaultValues change
  useEffect(() => {
    if (defaultValues) {
      setFormData({
        title: defaultValues.title || "",
        description: defaultValues.description || "",
        image: defaultValues.image || "",
        pdf_url: defaultValues.pdf_url || "",
        pdf_name: defaultValues.pdf_name || "",
        pinned: defaultValues.pinned || false,
        editor: defaultValues.editor || "",
        posteddate:
          defaultValues.posteddate || new Date().toISOString().split("T")[0],
        postedtime:
          defaultValues.postedtime ||
          new Date().toTimeString().split(" ")[0].substring(0, 5),
        tags: defaultValues.tags || [],
      });
    }
  }, [defaultValues]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Notice" : "Add New Notice"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter notice title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter notice description"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Image (Optional)</Label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            {formData.image && isValidImageUrl(formData.image) ? (
              <div className="relative w-full h-40 rounded border overflow-hidden">
                <Image
                  src={formData.image}
                  alt="Notice image preview"
                  fill
                  className="object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 rounded-full"
                  onClick={handleRemoveImage}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                onClick={handleUploadClick}
                className="cursor-pointer border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center hover:border-primary transition-colors"
              >
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">
                  {uploading ? (
                    <span className="flex items-center">
                      <LoadingIcon className="mr-2" /> Uploading...
                    </span>
                  ) : (
                    "Click to upload an image"
                  )}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  JPG, PNG, GIF up to 10MB
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>PDF Attachment (Optional)</Label>
            <input
              type="file"
              ref={pdfInputRef}
              onChange={handlePdfFileChange}
              accept="application/pdf"
              className="hidden"
            />

            {formData.pdf_url ? (
              <div className="flex items-center justify-between p-3 border rounded-md bg-gray-50">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-sm font-medium">
                      {formData.pdf_name || "PDF Document"}
                    </p>
                    <p className="text-xs text-gray-500">PDF File</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleRemovePdf}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </div>
            ) : (
              <div
                onClick={handlePdfUploadClick}
                className="cursor-pointer border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center hover:border-primary transition-colors"
              >
                <Paperclip className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">
                  {uploadingPdf ? (
                    <span className="flex items-center">
                      <LoadingIcon className="mr-2" /> Uploading PDF...
                    </span>
                  ) : (
                    "Click to upload a PDF document"
                  )}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  PDF files up to 50MB
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="editor">Posted By</Label>
            <Input
              id="editor"
              name="editor"
              value={formData.editor}
              onChange={handleInputChange}
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Add tag and press Enter"
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="px-2 py-1">
                  {tag}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 ml-1 p-0"
                    onClick={() => handleRemoveTag(tag)}
                    type="button"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="pinned"
              checked={formData.pinned}
              onCheckedChange={handleCheckboxChange}
            />
            <Label htmlFor="pinned" className="cursor-pointer">
              Pin this notice to the top
            </Label>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading || uploading || uploadingPdf}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading || uploading || uploadingPdf}>
            {loading || uploading || uploadingPdf ? (
              <LoadingIcon />
            ) : isEditing ? (
              "Update"
            ) : (
              "Add Notice"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default NoticeBoardForm;
