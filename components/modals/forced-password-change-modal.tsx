"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingIcon } from "@/components/loading-icon";
import { toast } from "sonner";
import { useUserStore } from "@/stores/user-store";
import {
  Lock,
  AlertTriangle,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import PasswordInput from "@/components/ui/password-input";
import { supabase } from "@/lib/supabase/client";

interface ForcedPasswordChangeModalProps {
  isOpen: boolean;
  onSuccess: () => void; // Called when password is successfully changed
}

interface FormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface FormErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  general?: string;
}

interface PasswordRequirement {
  text: string;
  met: boolean;
}

export const ForcedPasswordChangeModal: React.FC<
  ForcedPasswordChangeModalProps
> = ({ isOpen, onSuccess }) => {
  const { user } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Password requirements validation
  const getPasswordRequirements = (password: string): PasswordRequirement[] => [
    { text: "At least 8 characters long", met: password.length >= 8 },
    {
      text: "Contains at least one uppercase letter",
      met: /[A-Z]/.test(password),
    },
    {
      text: "Contains at least one lowercase letter",
      met: /[a-z]/.test(password),
    },
    { text: "Contains at least one number", met: /\d/.test(password) },
    {
      text: "Contains at least one special character",
      met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    },
  ];

  const passwordRequirements = getPasswordRequirements(formData.newPassword);
  const isPasswordValid = passwordRequirements.every((req) => req.met);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (!isPasswordValid) {
      newErrors.newPassword = "Password does not meet requirements";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (
      formData.currentPassword &&
      formData.newPassword &&
      formData.currentPassword === formData.newPassword
    ) {
      newErrors.newPassword =
        "New password must be different from current password";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      // First verify current password by attempting to re-authenticate
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password: formData.currentPassword,
      });

      if (reauthError) {
        setErrors({ currentPassword: "Current password is incorrect" });
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.newPassword,
      });

      if (updateError) {
        throw updateError;
      }

      // Update user metadata to remove the requires_password_change flag
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          requires_password_change: false,
          password_changed_at: new Date().toISOString(),
        },
      });

      if (metadataError) {
        console.warn("Failed to update user metadata:", metadataError);
        // Don't fail the entire operation for this
      }

      toast.success("Password updated successfully!");
      onSuccess();
    } catch (error: any) {
      console.error("Password change error:", error);
      setErrors({
        general:
          error.message || "Failed to update password. Please try again.",
      });
      toast.error("Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto"
        hideClose={true} // Prevent closing the modal
      >
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">
                Password Change Required
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1">
                For security purposes, you must change your password before
                continuing.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Alert className="bg-amber-50 border-amber-200">
          <Lock className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            Your account was created with a temporary password. Please create a
            new, secure password to continue using the platform.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{errors.general}</AlertDescription>
            </Alert>
          )}

          {/* Current Password */}
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                value={formData.currentPassword}
                onChange={(e) =>
                  handleInputChange("currentPassword", e.target.value)
                }
                disabled={loading}
                className={errors.currentPassword ? "border-red-500" : ""}
                placeholder="Enter your current password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                disabled={loading}
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {errors.currentPassword && (
              <p className="text-sm text-red-600">{errors.currentPassword}</p>
            )}
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={formData.newPassword}
                onChange={(e) =>
                  handleInputChange("newPassword", e.target.value)
                }
                disabled={loading}
                className={errors.newPassword ? "border-red-500" : ""}
                placeholder="Enter your new password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowNewPassword(!showNewPassword)}
                disabled={loading}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {errors.newPassword && (
              <p className="text-sm text-red-600">{errors.newPassword}</p>
            )}
          </div>

          {/* Password Requirements */}
          {formData.newPassword && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Password Requirements:
              </Label>
              <div className="space-y-1">
                {passwordRequirements.map((requirement, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    {requirement.met ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span
                      className={
                        requirement.met ? "text-green-600" : "text-red-500"
                      }
                    >
                      {requirement.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
                disabled={loading}
                className={errors.confirmPassword ? "border-red-500" : ""}
                placeholder="Confirm your new password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading || !isPasswordValid}
          >
            {loading && <LoadingIcon className="mr-2 h-4 w-4" />}
            Change Password
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ForcedPasswordChangeModal;
