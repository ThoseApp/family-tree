"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { UploadCloud, EyeOff, Eye, CheckCircle } from "lucide-react";
import { useUserStore } from "@/stores/user-store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LoadingIcon } from "@/components/loading-icon";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { BucketFolderEnum } from "@/lib/constants/enums";
import { BUCKET_NAME } from "@/lib/constants";
import { uploadImage } from "@/lib/file-upload";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().optional(),
  phoneNumber: z.string().optional(),
  bio: z.string().optional(),
});

const passwordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const SettingsPage = () => {
  const {
    user,
    loading: storeLoading,
    updateProfile,
    updatePassword,
    getUserProfile,
  } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const router = useRouter();

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      phoneNumber: "",
      bio: "",
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

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
          profileForm.reset({
            firstName: profile.first_name || "",
            lastName: profile.last_name || "",
            dateOfBirth: profile.date_of_birth || "",
            phoneNumber: profile.phone_number || "",
            bio: profile.bio || "",
          });

          if (profile.avatar_url) {
            setAvatarUrl(profile.avatar_url);
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
  }, [user, getUserProfile, profileForm, router]);

  const handleProfileSubmit = async (values: z.infer<typeof profileSchema>) => {
    setLoading(true);
    try {
      const result = await updateProfile(values);
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

  const handlePasswordSubmit = async (
    values: z.infer<typeof passwordSchema>
  ) => {
    setLoading(true);
    try {
      const result = await updatePassword(values.password);
      if (result?.success) {
        passwordForm.reset();
        setPasswordSuccess(true);
        setTimeout(() => setPasswordSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Error updating password:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    const file = event.target.files[0];

    setUploading(true);
    try {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      // Use the centralized upload function
      const avatarUrl = await uploadImage(file, BucketFolderEnum.avatars);

      if (!avatarUrl) {
        throw new Error("Failed to upload image");
      }

      // Update profile with new avatar URL
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ image: avatarUrl })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      setAvatarUrl(avatarUrl);
      toast.success("Profile photo updated successfully");
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      toast.error(error.message || "Failed to upload profile photo");
    } finally {
      setUploading(false);
    }
  };

  const isLoading = loading || storeLoading || uploading;

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
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 bg-yellow-50/30">
                {avatarUrl ? (
                  <div className="mb-4 relative w-24 h-24 rounded-full overflow-hidden">
                    <Image
                      src={avatarUrl}
                      alt="Profile"
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="bg-yellow-100 p-3 rounded-lg mb-3">
                    <UploadCloud className="h-6 w-6 text-yellow-600" />
                  </div>
                )}
                <p className="text-sm font-medium text-gray-700">
                  <label
                    htmlFor="avatar-upload"
                    className="text-yellow-600 font-semibold cursor-pointer"
                  >
                    Click to upload
                  </label>{" "}
                  or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  JPG, PNG, or JPEG (Recommended size 600-1000px)
                </p>
                <input
                  id="avatar-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={isLoading}
                />
              </div>
            </CardContent>
          </div>
        </div>
      </Card>

      {/* PERSONAL INFORMATION SECTION */}
      <Card className="bg-white rounded-xl shadow-sm">
        <Form {...profileForm}>
          <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
              <div className="md:col-span-1">
                <CardHeader className="p-0">
                  <CardTitle className="text-lg font-semibold">
                    Personal Information
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-500 mt-1">
                    Update your information here
                  </CardDescription>
                </CardHeader>
              </div>
              <div className="md:col-span-2 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormField
                    control={profileForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <Label
                          htmlFor="firstName"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          First Name
                        </Label>
                        <FormControl>
                          <Input
                            id="firstName"
                            className="bg-yellow-50/30 border-gray-200 rounded-lg"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <Label
                          htmlFor="lastName"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Last Name
                        </Label>
                        <FormControl>
                          <Input
                            id="lastName"
                            className="bg-yellow-50/30 border-gray-200 rounded-lg"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={profileForm.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <Label
                        htmlFor="dateOfBirth"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Date of Birth
                      </Label>
                      <FormControl>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          className="bg-yellow-50/30 border-gray-200 rounded-lg"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <Label
                        htmlFor="phoneNumber"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Phone Number
                      </Label>
                      <FormControl>
                        <Input
                          id="phoneNumber"
                          type="tel"
                          className="bg-yellow-50/30 border-gray-200 rounded-lg"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <Label
                        htmlFor="bio"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Bio
                      </Label>
                      <FormControl>
                        <Textarea
                          id="bio"
                          rows={5}
                          className="bg-yellow-50/30 border-gray-200 rounded-lg"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="p-0 mt-4 flex justify-end gap-x-3 items-center">
                  {profileSuccess && (
                    <div className="flex items-center text-green-600 mr-2">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span className="text-sm">
                        Profile updated successfully!
                      </span>
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => profileForm.reset()}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-yellow-500 hover:bg-yellow-600 text-white"
                    disabled={isLoading}
                  >
                    {isLoading && <LoadingIcon className="mr-2" />}
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </Card>

      {/* PASSWORD SECTION */}
      <Card className="bg-white rounded-xl shadow-sm">
        <Form {...passwordForm}>
          <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
              <div className="md:col-span-1">
                <CardHeader className="p-0">
                  <CardTitle className="text-lg font-semibold">
                    Change Password
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-500 mt-1">
                    Update your password here
                  </CardDescription>
                </CardHeader>
              </div>
              <div className="md:col-span-2 space-y-6">
                <FormField
                  control={passwordForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <Label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        New Password
                      </Label>
                      <div className="relative">
                        <FormControl>
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            className="bg-yellow-50/30 border-gray-200 rounded-lg pr-10"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <span
                          className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <Eye className="h-5 w-5 text-gray-400" />
                          ) : (
                            <EyeOff className="h-5 w-5 text-gray-400" />
                          )}
                        </span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <Label
                        htmlFor="confirmPassword"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <FormControl>
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            className="bg-yellow-50/30 border-gray-200 rounded-lg pr-10"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <span
                          className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? (
                            <Eye className="h-5 w-5 text-gray-400" />
                          ) : (
                            <EyeOff className="h-5 w-5 text-gray-400" />
                          )}
                        </span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="p-0 mt-4 flex justify-end gap-x-3 items-center">
                  {passwordSuccess && (
                    <div className="flex items-center text-green-600 mr-2">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span className="text-sm">
                        Password updated successfully!
                      </span>
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => passwordForm.reset()}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-yellow-500 hover:bg-yellow-600 text-white"
                    disabled={isLoading}
                  >
                    {isLoading && <LoadingIcon className="mr-2" />}
                    Update Password
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default SettingsPage;
