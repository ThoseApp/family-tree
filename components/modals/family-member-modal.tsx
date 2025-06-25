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

interface FamilyMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (familyMemberData: Omit<FamilyMember, "id">) => Promise<void>;
  isLoading?: boolean;
  editData?: FamilyMember | null;
  mode: "add" | "edit";
}

export const FamilyMemberModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  editData,
  mode,
}: FamilyMemberModalProps) => {
  const [formData, setFormData] = useState({
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
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  // Initialize form data when modal opens or editData changes
  useEffect(() => {
    if (editData && mode === "edit") {
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
      setImagePreview(
        editData.imageSrc && editData.imageSrc !== "/images/default-profile.png"
          ? editData.imageSrc
          : ""
      );
      if (editData.birthDate) {
        setSelectedDate(new Date(editData.birthDate));
      }
    } else {
      // Reset form for add mode
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
    if (date) {
      setFormData((prev) => ({
        ...prev,
        birthDate: format(date, "yyyy-MM-dd"),
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData((prev) => ({
          ...prev,
          imageSrc: result,
        }));
      };
      reader.readAsDataURL(file);
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
    if (!formData.name.trim()) return;

    try {
      await onConfirm(formData);
      onClose();
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  const handleClose = () => {
    if (!isLoading) {
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
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <Upload className="h-8 w-8 text-gray-400" />
                </div>
              )}
              <div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isLoading}
                  className="hidden"
                  id="image-upload"
                />
                <Label
                  htmlFor="image-upload"
                  className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                >
                  Choose Image
                </Label>
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
              />
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
            <Label>Birth Date</Label>
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
              />
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
              />
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
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="orderOfMarriage">Order of Marriage</Label>
              <Input
                id="orderOfMarriage"
                name="orderOfMarriage"
                type="number"
                min="1"
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
            disabled={isLoading || !formData.name.trim()}
            className="bg-foreground text-background rounded-full hover:bg-foreground/80"
          >
            {isLoading && <LoadingIcon className="mr-2" />}
            {mode === "add" ? "Add Family Member" : "Update Family Member"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
