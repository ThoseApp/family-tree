"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LoadingIcon } from "@/components/loading-icon";
import {
  UploadCloud,
  EyeOff,
  User,
  CheckCircle,
  CalendarIcon,
} from "lucide-react";
import { toast } from "sonner";
import { uploadImage } from "@/lib/file-upload";
import { BucketFolderEnum } from "@/lib/constants/enums";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/stores/user-store";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { EnhancedCalendar } from "@/components/ui/enhanced-calendar";
import { format } from "date-fns";

// Profile image size limit (smaller than general images for better UX)
const PROFILE_IMAGE_SIZE_MB = 5;

const SettingsPage = () => {
  const {
    user,
    loading: storeLoading,
    updateProfile,
    updatePassword,
    getUserProfile,
  } = useUserStore();

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    phoneNumber: "",
    bio: "",
    password: "",
    confirmPassword: "",
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [profileImagePreview, setProfileImagePreview] = useState<string>("");
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) {
      router.push("/sign-in");
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const profile = await getUserProfile();

        if (profile) {
          const fullName = `${profile.first_name || ""} ${
            profile.last_name || ""
          }`.trim();
          setFormData({
            fullName,
            firstName: profile.first_name || "",
            lastName: profile.last_name || "",
            dateOfBirth: profile.date_of_birth || "",
            phoneNumber: profile.phone_number || "",
            bio: profile.bio || "",
            password: "",
            confirmPassword: "",
          });

          if (profile.image) {
            setProfileImagePreview(profile.image);
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, getUserProfile, router]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Auto-update firstName and lastName when fullName changes
    if (field === "fullName") {
      const nameParts = value.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";
      setFormData((prev) => ({
        ...prev,
        firstName,
        lastName,
      }));
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > PROFILE_IMAGE_SIZE_MB * 1024 * 1024) {
      toast.error(`File size must be less than ${PROFILE_IMAGE_SIZE_MB}MB`);
      return;
    }

    // Show preview
    const previewUrl = URL.createObjectURL(file);
    setProfileImagePreview(previewUrl);

    // Upload image
    handleImageUpload(file);
  };

  const handleImageUpload = async (file: File) => {
    try {
      setImageUploading(true);

      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      const imageUrl = await uploadImage(file, BucketFolderEnum.avatars);

      if (!imageUrl) {
        throw new Error("Failed to upload image");
      }

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ image: imageUrl })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      setProfileImagePreview(imageUrl);
      toast.success("Profile image uploaded successfully!");
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast.error(error.message || "Failed to upload image");
      // Reset preview on error
      const profile = await getUserProfile();
      setProfileImagePreview(profile?.image || "");
    } finally {
      setImageUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!formData.firstName.trim()) {
      toast.error("Full name is required");
      return;
    }

    setLoading(true);
    try {
      const result = await updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        phoneNumber: formData.phoneNumber,
        bio: formData.bio,
      });

      if (result?.success) {
        setProfileSuccess(true);
        setTimeout(() => setProfileSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!formData.password) {
      toast.error("Password is required");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const result = await updatePassword(formData.password);
      if (result?.success) {
        setFormData((prev) => ({
          ...prev,
          password: "",
          confirmPassword: "",
        }));
        setPasswordSuccess(true);
        setTimeout(() => setPasswordSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Error updating password:", error);
    } finally {
      setLoading(false);
    }
  };

  const isValidImageUrl = (url: string) => {
    if (!url) return false;
    return url.startsWith("http") || url.startsWith("/");
  };

  const isLoading = loading || storeLoading || imageUploading;

  if (storeLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingIcon className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-8 lg:gap-y-12 ">
      {/* HEADER SECTION */}
      <div className="flex md:items-center md:flex-row flex-col md:justify-between gap-y-4">
        <h1 className="text-2xl font-semibold">Settings</h1>
      </div>

      {/* PROFILE PHOTO SECTION */}
      <Card className="bg-white rounded-xl shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          <div className="md:col-span-1">
            <CardHeader className="p-0">
              <CardTitle className="text-lg font-semibold">
                Profile Photo
              </CardTitle>
              <CardDescription className="text-sm text-gray-500 mt-1">
                This image will be displayed on your profile
              </CardDescription>
            </CardHeader>
          </div>
          <div className="md:col-span-2">
            <CardContent className="p-0">
              {/* Current Image Display */}
              {profileImagePreview && isValidImageUrl(profileImagePreview) ? (
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <Image
                    src={profileImagePreview}
                    alt="Profile preview"
                    fill
                    className="object-cover rounded-full"
                  />
                  {imageUploading && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                      <LoadingIcon className="h-6 w-6 text-white" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative w-32 h-32 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                  <User className="h-12 w-12 text-muted-foreground" />
                </div>
              )}

              {/* Upload Area */}
              <div
                className={cn(
                  "flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 bg-yellow-50/30 cursor-pointer transition-colors",
                  imageUploading && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => !imageUploading && fileInputRef.current?.click()}
              >
                <div className="bg-yellow-100 p-3 rounded-lg mb-3">
                  {imageUploading ? (
                    <LoadingIcon className="h-6 w-6 text-yellow-600" />
                  ) : (
                    <UploadCloud className="h-6 w-6 text-yellow-600" />
                  )}
                </div>
                <p className="text-sm font-medium text-gray-700">
                  <span className="text-yellow-600 font-semibold cursor-pointer">
                    {imageUploading ? "Uploading..." : "Click to upload"}
                  </span>{" "}
                  {!imageUploading && "or drag and drop"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  JPG, PNG, or JPEG (Max {PROFILE_IMAGE_SIZE_MB}MB, Recommended
                  size 600-1000px)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageSelect}
                  disabled={imageUploading}
                />
              </div>
            </CardContent>
          </div>
        </div>
      </Card>

      {/* PERSONAL INFORMATION SECTION */}
      <Card className="bg-white rounded-xl shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          <div className="md:col-span-1">
            <CardHeader className="p-0">
              <CardTitle className="text-lg font-semibold">
                Personal Information
              </CardTitle>
              <CardDescription className="text-sm text-gray-500 mt-1">
                Upload your information here
              </CardDescription>
            </CardHeader>
          </div>
          <div className="md:col-span-2 space-y-6">
            <div>
              <Label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Full Name
              </Label>
              <Input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                className="bg-yellow-50/30 border-gray-200 rounded-lg"
                disabled={isLoading}
              />
            </div>
            <div>
              <Label
                htmlFor="dob"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Date of Birth
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-yellow-50/30 border-gray-200 rounded-lg",
                      !formData.dateOfBirth && "text-muted-foreground"
                    )}
                    disabled={isLoading}
                  >
                    {formData.dateOfBirth ? (
                      format(new Date(formData.dateOfBirth), "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <EnhancedCalendar
                    mode="single"
                    selected={
                      formData.dateOfBirth
                        ? new Date(formData.dateOfBirth)
                        : undefined
                    }
                    onSelect={(date) => {
                      if (date) {
                        handleInputChange(
                          "dateOfBirth",
                          date.toISOString().split("T")[0]
                        );
                      }
                    }}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) =>
                  handleInputChange("phoneNumber", e.target.value)
                }
                className="bg-yellow-50/30 border-gray-200 rounded-lg"
                disabled={isLoading}
              />
            </div>
            <div>
              <Label
                htmlFor="bio"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Bio
              </Label>
              <Textarea
                id="bio"
                rows={5}
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                className="bg-yellow-50/30 border-gray-200 rounded-lg"
                disabled={isLoading}
              />
            </div>
            <div className="relative">
              <Label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="bg-yellow-50/30 border-gray-200 rounded-lg pr-10"
                disabled={isLoading}
              />
              <span className="absolute inset-y-0 right-0 top-7 pr-3 flex items-center cursor-pointer">
                <EyeOff className="h-5 w-5 text-gray-400" />
              </span>
            </div>
            <div>
              <Label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
                className="bg-yellow-50/30 border-gray-200 rounded-lg"
                disabled={isLoading}
              />
            </div>
            <div className="p-0 mt-4 flex justify-between gap-x-3 items-center">
              <div className="flex items-center">
                {profileSuccess && (
                  <div className="flex items-center text-green-600 mr-4">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    <span className="text-sm">Profile updated!</span>
                  </div>
                )}
                {passwordSuccess && (
                  <div className="flex items-center text-green-600 mr-4">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    <span className="text-sm">Password updated!</span>
                  </div>
                )}
              </div>
              <div className="flex gap-x-3">
                <Button
                  variant="outline"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      password: "",
                      confirmPassword: "",
                    }))
                  }
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                {formData.password || formData.confirmPassword ? (
                  <Button
                    className="bg-yellow-500 hover:bg-yellow-600 text-white"
                    onClick={handleUpdatePassword}
                    disabled={isLoading}
                  >
                    {isLoading && <LoadingIcon className="mr-2 h-4 w-4" />}
                    Update Password
                  </Button>
                ) : (
                  <Button
                    className="bg-yellow-500 hover:bg-yellow-600 text-white"
                    onClick={handleSaveProfile}
                    disabled={isLoading}
                  >
                    {isLoading && <LoadingIcon className="mr-2 h-4 w-4" />}
                    Save Changes
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SettingsPage;
