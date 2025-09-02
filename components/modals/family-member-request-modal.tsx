"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FamilyMember } from "@/lib/types";
import { useUserStore } from "@/stores/user-store";
import { toast } from "sonner";
import { LoadingIcon } from "@/components/loading-icon";
import { Textarea } from "@/components/ui/textarea";
import { EnhancedCalendar } from "@/components/ui/enhanced-calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Upload, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { uploadImage } from "@/lib/file-upload";
import { BucketFolderEnum } from "@/lib/constants/enums";
import { useFamilyMemberDropdowns } from "@/hooks/use-family-member-dropdowns";

interface FamilyMemberRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const FamilyMemberRequestModal: React.FC<
  FamilyMemberRequestModalProps
> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<Partial<FamilyMember>>({
    lifeStatus: "Alive",
    emailAddress: "",
    fathers_uid: undefined,
    mothers_uid: undefined,
    spouse_uid: undefined,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUserStore();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageUploading, setImageUploading] = useState(false);

  // Family member dropdown data
  const {
    isLoading: dropdownsLoading,
    error: dropdownsError,
    allMembers,
    fatherOptions,
    motherOptions,
    spouseOptions,
    getMotherOptionsForFather,
    getFirstHusbandForMother,
  } = useFamilyMemberDropdowns();

  // Selected relationship state for conditional dropdowns
  const [selectedFatherId, setSelectedFatherId] = useState<string>("");
  const [selectedMotherId, setSelectedMotherId] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      setFormData({
        lifeStatus: "Alive",
        emailAddress: "",
        fathers_uid: undefined,
        mothers_uid: undefined,
        spouse_uid: undefined,
      });
      setSelectedDate(undefined);
      setSelectedImage(null);
      setImagePreview("");
      setSelectedFatherId("");
      setSelectedMotherId("");
    }
  }, [isOpen]);

  const handleChange = (
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

  const handleSelectChange = (name: keyof FamilyMember, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle father selection with conditional mother dropdown
  const handleFatherSelect = (fatherId: string) => {
    const actualFatherId = fatherId === "none" ? "" : fatherId;
    setSelectedFatherId(actualFatherId);

    // Find the selected father to get the name
    const father = actualFatherId
      ? allMembers.find((member) => member.unique_id === actualFatherId)
      : null;
    const fatherName = father ? `${father.first_name} ${father.last_name}` : "";

    setFormData((prev) => ({
      ...prev,
      fatherName,
      fathers_uid: actualFatherId || undefined,
      // Clear mother selection when father changes
      motherName: "",
      mothers_uid: undefined,
    }));

    // Reset mother selection
    setSelectedMotherId("");
  };

  // Handle mother selection with auto father selection
  const handleMotherSelect = (motherId: string) => {
    const actualMotherId = motherId === "none" ? "" : motherId;
    setSelectedMotherId(actualMotherId);

    // Find the selected mother to get the name
    const mother = actualMotherId
      ? allMembers.find((member) => member.unique_id === actualMotherId)
      : null;
    const motherName = mother ? `${mother.first_name} ${mother.last_name}` : "";

    setFormData((prev) => ({
      ...prev,
      motherName,
      mothers_uid: actualMotherId || undefined,
    }));

    // If no father is selected and mother has a husband, auto-select the first husband
    if (!selectedFatherId && actualMotherId) {
      const firstHusband = getFirstHusbandForMother(actualMotherId);
      if (firstHusband) {
        const husband = allMembers.find(
          (member) => member.unique_id === firstHusband
        );
        if (husband) {
          setSelectedFatherId(firstHusband);
          setFormData((prev) => ({
            ...prev,
            fatherName: `${husband.first_name} ${husband.last_name}`,
            fathers_uid: firstHusband,
          }));
        }
      }
    }
  };

  // Handle spouse selection (only for males)
  const handleSpouseSelect = (spouseId: string) => {
    const actualSpouseId = spouseId === "none" ? "" : spouseId;
    const spouse = actualSpouseId
      ? allMembers.find((member) => member.unique_id === actualSpouseId)
      : null;
    const spouseName = spouse ? `${spouse.first_name} ${spouse.last_name}` : "";

    setFormData((prev) => ({
      ...prev,
      spouseName,
      spouse_uid: actualSpouseId || undefined,
    }));
  };

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
    setFormData((prev) => ({
      ...prev,
      birthDate: date ? format(date, "yyyy-MM-dd") : "",
    }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }
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
          setFormData((prev) => ({ ...prev, imageSrc: result }));
          toast.success("Image uploaded successfully!");
        } else {
          throw new Error("Upload failed");
        }
      } catch (error) {
        toast.error("Failed to upload image");
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
    setFormData((prev) => ({ ...prev, imageSrc: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to submit a request.");
      return;
    }
    if (!formData.name?.trim()) {
      toast.error("Name is required");
      return;
    }

    // Validate that at least one parent is selected (not required for females)
    const hasFather = (formData.fatherName || "").trim() !== "";
    const hasMother = (formData.motherName || "").trim() !== "";

    if (!hasFather && !hasMother && formData.gender !== "Female") {
      toast.error(
        "At least one parent (Father or Mother) is required for male members"
      );
      return;
    }

    // Validate email format if provided
    const email = (formData.emailAddress || "").trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      // Clean up form data before sending
      const cleanedData = {
        ...formData,
        name: formData.name.trim(),
        fatherName: hasFather ? formData.fatherName?.trim() : undefined,
        motherName: hasMother ? formData.motherName?.trim() : undefined,
        spouseName: formData.spouseName?.trim() || undefined,
        description: formData.description?.trim() || "",
        lifeStatus: formData.lifeStatus || "Alive",
        emailAddress: email || undefined,
        fathers_uid: formData.fathers_uid || undefined,
        mothers_uid: formData.mothers_uid || undefined,
        spouse_uid: formData.spouse_uid || undefined,
        requested_by_user_id: user.id,
      };

      const response = await fetch("/api/family-member-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanedData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit request.");
      }
      toast.success("Family member request submitted successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request New Family Member</DialogTitle>
          <DialogDescription>
            Fill in the details for the new family member. Your request will be
            sent for admin approval.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
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
                  id="image-upload-request"
                />
                <Label
                  htmlFor="image-upload-request"
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
                  Max file size: 5MB.
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter full name"
                value={formData.name || ""}
                onChange={handleChange}
                disabled={dropdownsLoading}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select
                value={formData.gender || ""}
                onValueChange={(value) => handleSelectChange("gender", value)}
                disabled={dropdownsLoading}
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

          {/* Life Status and Email */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="lifeStatus">Life Status</Label>
              <Select
                value={formData.lifeStatus || "Alive"}
                onValueChange={(value) =>
                  handleSelectChange(
                    "lifeStatus",
                    value as "Alive" | "Deceased"
                  )
                }
                disabled={dropdownsLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select life status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Alive">Alive</SelectItem>
                  <SelectItem value="Deceased">Deceased</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="emailAddress">Email Address</Label>
              <Input
                id="emailAddress"
                name="emailAddress"
                type="email"
                placeholder="Enter email address (optional)"
                value={formData.emailAddress || ""}
                onChange={handleChange}
                disabled={dropdownsLoading}
                maxLength={255}
              />
            </div>
          </div>
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
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <EnhancedCalendar
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
          {/* Parents - At least one is required for males */}
          <div className="grid gap-2">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">
                Parents {formData.gender !== "Female" ? "*" : ""}
              </Label>
              <span className="text-xs text-muted-foreground">
                {formData.gender === "Female"
                  ? "(Optional for female members)"
                  : "(At least one parent is required for male members)"}
              </span>
            </div>

            {dropdownsError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
                Failed to load family members: {dropdownsError}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="fatherName">Father&apos;s Name</Label>
              {dropdownsLoading ? (
                <div className="flex items-center justify-center h-10 border rounded">
                  <LoadingIcon className="h-4 w-4" />
                  <span className="ml-2 text-sm">Loading fathers...</span>
                </div>
              ) : (
                <Select
                  value={selectedFatherId || "none"}
                  onValueChange={handleFatherSelect}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select father" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Father</SelectItem>
                    {fatherOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="motherName">Mother&apos;s Name</Label>
              {dropdownsLoading ? (
                <div className="flex items-center justify-center h-10 border rounded">
                  <LoadingIcon className="h-4 w-4" />
                  <span className="ml-2 text-sm">Loading mothers...</span>
                </div>
              ) : (
                <Select
                  value={selectedMotherId || "none"}
                  onValueChange={handleMotherSelect}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select mother" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Mother</SelectItem>
                    {/* Show conditional mothers based on father selection */}
                    {(selectedFatherId
                      ? getMotherOptionsForFather(selectedFatherId)
                      : motherOptions
                    ).map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="orderOfBirth">Order of Birth</Label>
              <Input
                id="orderOfBirth"
                name="orderOfBirth"
                type="number"
                min="1"
                placeholder="e.g., 1, 2, 3..."
                value={formData.orderOfBirth || ""}
                onChange={handleChange}
                disabled={dropdownsLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="spouseName">Spouse Name</Label>
              {formData.gender === "Male" ? (
                dropdownsLoading ? (
                  <div className="flex items-center justify-center h-10 border rounded">
                    <LoadingIcon className="h-4 w-4" />
                    <span className="ml-2 text-sm">Loading...</span>
                  </div>
                ) : (
                  <Select
                    value={
                      formData.spouseName?.trim()
                        ? spouseOptions.find((option) =>
                            option.label.includes(
                              formData.spouseName?.split(" (")[0] || ""
                            )
                          )?.value || "none"
                        : "none"
                    }
                    onValueChange={handleSpouseSelect}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select spouse" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Spouse</SelectItem>
                      {spouseOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )
              ) : (
                <Input
                  id="spouseName"
                  name="spouseName"
                  placeholder="Spouse selection only for males"
                  value={formData.spouseName || ""}
                  disabled={true}
                  className="bg-gray-50 text-gray-500"
                />
              )}
              {formData.gender !== "Male" && (
                <p className="text-xs text-muted-foreground">
                  Spouse selection is only available for male family members
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
                placeholder="e.g., 1, 2, 3..."
                value={formData.orderOfMarriage || ""}
                onChange={handleChange}
                disabled={dropdownsLoading}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Enter any additional information about this family member (optional)"
              value={formData.description || ""}
              onChange={handleChange}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading || imageUploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isLoading ||
                imageUploading ||
                dropdownsLoading ||
                !formData.name?.trim() ||
                (formData.gender !== "Female" &&
                  !formData.fatherName?.trim() &&
                  !formData.motherName?.trim())
              }
            >
              {(isLoading || imageUploading || dropdownsLoading) && (
                <LoadingIcon className="mr-2 h-4 w-4" />
              )}
              {dropdownsLoading
                ? "Loading Family Data..."
                : imageUploading
                ? "Uploading Image..."
                : "Submit Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
