"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingIcon } from "@/components/loading-icon";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { FamilyMember } from "@/lib/types";
import {
  Mail,
  User,
  Phone,
  Calendar as CalendarIcon,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { EnhancedCalendar } from "@/components/ui/enhanced-calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  familyMember: FamilyMember | null;
  onSuccess?: () => void;
}

interface FormData {
  email: string;
  phoneNumber: string;
  dateOfBirth: Date | undefined;
}

interface FormErrors {
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
}

export const CreateAccountModal: React.FC<CreateAccountModalProps> = ({
  isOpen,
  onClose,
  familyMember,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    phoneNumber: "",
    dateOfBirth: undefined,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Reset form when modal opens/closes or family member changes
  useEffect(() => {
    if (isOpen && familyMember) {
      setFormData({
        email: "",
        phoneNumber: "",
        dateOfBirth: familyMember.birthDate
          ? new Date(familyMember.birthDate)
          : undefined,
      });
      setErrors({});
    }
  }, [isOpen, familyMember]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Date validation is handled by the calendar component automatically

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    field: Exclude<keyof FormData, "dateOfBirth">,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!familyMember) {
      toast.error("No family member selected");
      return;
    }

    // Check if family member is deceased
    if (familyMember.lifeStatus === "Deceased") {
      toast.error("Cannot create account for deceased family member", {
        description: `${familyMember.name} is marked as deceased.`,
      });
      return;
    }

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setLoading(true);

    try {
      // Get current user session for authentication
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("Authentication required");
      }

      // Parse the family member's name
      const nameParts = familyMember.name.split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      // Call the API to create the account
      const response = await fetch("/api/admin/create-family-accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          familyMemberId: familyMember.id,
          firstName: firstName,
          lastName: lastName,
          email: formData.email,
          phoneNumber: formData.phoneNumber || undefined,
          dateOfBirth: formData.dateOfBirth
            ? formData.dateOfBirth.toISOString().split("T")[0]
            : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        toast.success(
          `Account created successfully for ${familyMember.name}. Login credentials will be sent to ${formData.email}.`
        );
        onSuccess?.();
        onClose();
      } else {
        throw new Error(result.error || "Failed to create account");
      }
    } catch (error: any) {
      console.error("Error creating account:", error);
      toast.error(error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!familyMember) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Create User Account
          </DialogTitle>
          <DialogDescription>
            Create a user account for{" "}
            <span className="font-medium">{familyMember.name}</span>. They will
            receive login credentials via email.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Family Member Info */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <h4 className="font-medium text-sm text-gray-700">
              Family Member Details
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Name:</span>
                <p className="font-medium">{familyMember.name}</p>
              </div>
              <div>
                <span className="text-gray-500">Unique ID:</span>
                <p className="font-medium">{familyMember.id}</p>
              </div>
              {familyMember.birthDate && (
                <div>
                  <span className="text-gray-500">Birth Date:</span>
                  <p className="font-medium">
                    {new Date(familyMember.birthDate).toLocaleDateString()}
                  </p>
                </div>
              )}
              {familyMember.gender && (
                <div>
                  <span className="text-gray-500">Gender:</span>
                  <p className="font-medium capitalize">
                    {familyMember.gender}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Account Details Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                disabled={loading}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number (Optional)
              </Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="Enter phone number"
                value={formData.phoneNumber}
                onChange={(e) =>
                  handleInputChange("phoneNumber", e.target.value)
                }
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Date of Birth (Optional)
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.dateOfBirth && "text-muted-foreground",
                      errors.dateOfBirth ? "border-red-500" : ""
                    )}
                    disabled={loading}
                  >
                    {formData.dateOfBirth ? (
                      format(formData.dateOfBirth, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <EnhancedCalendar
                    mode="single"
                    selected={formData.dateOfBirth}
                    onSelect={(date) => {
                      setFormData((prev) => ({ ...prev, dateOfBirth: date }));
                      // Clear error for this field when user selects a date
                      if (errors.dateOfBirth) {
                        setErrors((prev) => ({
                          ...prev,
                          dateOfBirth: undefined,
                        }));
                      }
                    }}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.dateOfBirth && (
                <p className="text-sm text-red-500">{errors.dateOfBirth}</p>
              )}
            </div>
          </div>

          {/* Info Alert */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              A secure password will be automatically generated and sent to the
              provided email address along with login instructions.
            </AlertDescription>
          </Alert>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || !formData.email.trim()}
            className="bg-foreground text-background hover:bg-foreground/80"
          >
            {loading ? (
              <>
                <LoadingIcon className="mr-2 h-4 w-4" />
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
