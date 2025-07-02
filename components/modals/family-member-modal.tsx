"use client";

import React, { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Upload, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { FamilyMember } from "@/lib/types";
import Image from "next/image";
import { toast } from "sonner";
import { uploadImage } from "@/lib/file-upload";
import { BucketFolderEnum } from "@/lib/constants/enums";

interface FamilyMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (familyMemberData: Omit<FamilyMember, "id">) => Promise<void>;
  isLoading?: boolean;
  editData?: FamilyMember | null;
  mode: "add" | "edit";
}

// Utility function to safely parse date
const parseDate = (dateString?: string): Date | undefined => {
  if (!dateString || typeof dateString !== "string") return undefined;

  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? undefined : date;
  } catch (error) {
    console.warn("Invalid date string:", dateString);
    return undefined;
  }
};

// Utility function to check if image is a default/placeholder
const isDefaultImage = (imageSrc?: string): boolean => {
  if (!imageSrc) return true;
  return (
    imageSrc === "" ||
    imageSrc === "/images/default-profile.png" ||
    imageSrc.includes("placeholder") ||
    imageSrc.includes("default")
  );
};

export const FamilyMemberModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  editData,
  mode,
}: FamilyMemberModalProps) => {
  const [formData, setFormData] = useState<Omit<FamilyMember, "id">>({
    name: "",
    fatherName: "",
    motherName: "",
    spouseName: "",
    birthDate: "",
    description: "",
    imageSrc: "",
    gender: "",
    orderOfBirth: 1,
    orderOfMarriage: 1,
  });
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageUploading, setImageUploading] = useState(false);

  // Reset form function
  const resetForm = () => {
    setFormData({
      name: "",
      gender: "",
      description: "",
      imageSrc: "",
      birthDate: "",
      fatherName: "",
      motherName: "",
      orderOfBirth: 1,
      spouseName: "",
      orderOfMarriage: 1,
    });
    setSelectedDate(undefined);
    setSelectedImage(null);
    setImagePreview("");
  };

  // Initialize form data when modal opens or editData changes
  useEffect(() => {
    if (editData && mode === "edit") {
      const parsedDate = parseDate(editData.birthDate);

      setFormData({
        name: editData.name || "",
        gender: editData.gender || "",
        description: editData.description || "",
        imageSrc: editData.imageSrc || "",
        birthDate: editData.birthDate || "",
        fatherName: editData.fatherName || "",
        motherName: editData.motherName || "",
        orderOfBirth: editData.orderOfBirth || 1,
        spouseName: editData.spouseName || "",
        orderOfMarriage: editData.orderOfMarriage || 1,
      });

      // Set image preview only if it's not a default image
      setImagePreview(
        !isDefaultImage(editData.imageSrc) ? editData.imageSrc || "" : ""
      );

      // Set date only if it's valid
      setSelectedDate(parsedDate);
    } else {
      // Reset form for add mode
      resetForm();
    }
  }, [editData, mode, isOpen]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "orderOfBirth" || name === "orderOfMarriage"
          ? parseInt(value) || 1
          : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
    setFormData((prev) => ({
      ...prev,
      birthDate: date ? format(date, "yyyy-MM-dd") : "",
    }));
  };

  // Clear date function
  const clearDate = () => {
    setSelectedDate(undefined);
    setFormData((prev) => ({
      ...prev,
      birthDate: "",
    }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }

      setSelectedImage(file);
      setImageUploading(true);

      try {
        const result = await uploadImage(file, BucketFolderEnum.users);
        if (result) {
          setImagePreview(result);
          setFormData((prev) => ({
            ...prev,
            imageSrc: result,
          }));
          toast.success("Image uploaded successfully!");
        } else {
          throw new Error("Upload failed");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error("Failed to upload image");
        // Reset the file input and selected image on error
        setSelectedImage(null);
        e.target.value = "";
      } finally {
        setImageUploading(false);
      }
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview("");
    setFormData((prev) => ({
      ...prev,
      imageSrc: "",
    }));
  };

  const handleConfirm = async () => {
    // Validate required fields
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    // Validate order values with proper fallbacks
    const orderOfBirth = formData.orderOfBirth ?? 1;
    const orderOfMarriage = formData.orderOfMarriage ?? 1;

    if (orderOfBirth < 1) {
      toast.error("Order of birth must be at least 1");
      return;
    }

    if (orderOfMarriage < 1) {
      toast.error("Order of marriage must be at least 1");
      return;
    }

    try {
      // Clean up form data before sending with proper null handling
      const cleanedData = {
        ...formData,
        name: formData.name.trim(),
        fatherName: (formData.fatherName || "").trim() || undefined,
        motherName: (formData.motherName || "").trim() || undefined,
        spouseName: (formData.spouseName || "").trim() || undefined,
        description: (formData.description || "").trim() || "",
        gender: formData.gender || undefined,
        orderOfBirth,
        orderOfMarriage,
        // Ensure imageSrc is either a valid string or empty string
        imageSrc: formData.imageSrc || "",
      };

      await onConfirm(cleanedData);
      // Don't close here - let the parent handle it after successful update
    } catch (error) {
      // Error handling is done in the parent component
      console.error("Error in modal confirm:", error);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      resetForm(); // Reset form when closing
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add New Family Member" : "Edit Family Member"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Add a new member to your family tree with their details."
              : "Update the family member's information."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Image Upload */}
          <div className="grid gap-2">
            <Label>Profile Picture</Label>
            <div className="flex items-center gap-4">
              {imagePreview ? (
                <div className="relative">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                    onClick={removeImage}
                    disabled={imageUploading}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                  {imageUploading ? (
                    <LoadingIcon className="h-6 w-6 text-gray-400" />
                  ) : (
                    <Upload className="h-8 w-8 text-gray-400" />
                  )}
                </div>
              )}
              <div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isLoading || imageUploading}
                  className="hidden"
                  id="image-upload"
                />
                <Label
                  htmlFor="image-upload"
                  className={cn(
                    "cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2",
                    (isLoading || imageUploading) &&
                      "pointer-events-none opacity-50"
                  )}
                >
                  {imageUploading ? (
                    <>
                      <LoadingIcon className="h-4 w-4 mr-2" />
                      Uploading...
                    </>
                  ) : (
                    "Choose Image"
                  )}
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Max file size: 5MB. Supported formats: JPEG, PNG, WebP
                </p>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter full name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={isLoading}
                required
                maxLength={100}
              />
              {formData.name.length > 90 && (
                <p className="text-xs text-orange-600">
                  Name is getting long. Names will be truncated to fit database
                  limits.
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => handleSelectChange("gender", value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Birth Date */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label>Birth Date</Label>
              {selectedDate && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearDate}
                  disabled={isLoading}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Clear Date
                </Button>
              )}
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                  disabled={isLoading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateChange}
                  initialFocus
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Parents */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="fatherName">Father&apos;s Name</Label>
              <Input
                id="fatherName"
                name="fatherName"
                placeholder="Enter father's name"
                value={formData.fatherName}
                onChange={handleInputChange}
                disabled={isLoading}
                maxLength={100}
              />
              {(formData.fatherName?.length || 0) > 90 && (
                <p className="text-xs text-orange-600">
                  Name is getting long and may be truncated.
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="motherName">Mother&apos;s Name</Label>
              <Input
                id="motherName"
                name="motherName"
                placeholder="Enter mother's name"
                value={formData.motherName}
                onChange={handleInputChange}
                disabled={isLoading}
                maxLength={100}
              />
              {(formData.motherName?.length || 0) > 90 && (
                <p className="text-xs text-orange-600">
                  Name is getting long and may be truncated.
                </p>
              )}
            </div>
          </div>

          {/* Order and Spouse */}
          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="orderOfBirth">Order of Birth</Label>
              <Input
                id="orderOfBirth"
                name="orderOfBirth"
                type="number"
                min="1"
                max="50"
                placeholder="1"
                value={formData.orderOfBirth}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="spouseName">Spouse Name</Label>
              <Input
                id="spouseName"
                name="spouseName"
                placeholder="Enter spouse name"
                value={formData.spouseName}
                onChange={handleInputChange}
                disabled={isLoading}
                maxLength={100}
              />
              {(formData.spouseName?.length || 0) > 90 && (
                <p className="text-xs text-orange-600">
                  Name is getting long and may be truncated.
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="orderOfMarriage">Order of Marriage</Label>
              <Input
                id="orderOfMarriage"
                name="orderOfMarriage"
                type="number"
                min="1"
                max="10"
                placeholder="1"
                value={formData.orderOfMarriage}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Enter a brief description about this family member"
              value={formData.description}
              onChange={handleInputChange}
              disabled={isLoading}
              rows={3}
              maxLength={500}
            />
            <div className="text-xs text-muted-foreground text-right">
              {formData.description.length}/500 characters
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading || imageUploading}
            className="rounded-full"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || imageUploading || !formData.name.trim()}
            className="bg-foreground text-background rounded-full hover:bg-foreground/80"
          >
            {(isLoading || imageUploading) && <LoadingIcon className="mr-2" />}
            {imageUploading
              ? "Uploading Image..."
              : mode === "add"
              ? "Add Family Member"
              : "Update Family Member"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
