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
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingIcon } from "@/components/loading-icon";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import {
  FamilyMemberAccountCreation,
  BulkAccountCreationRequest,
  BulkAccountCreationResult,
} from "@/lib/types";
import {
  Mail,
  Users,
  Phone,
  Calendar as CalendarIcon,
  AlertCircle,
  CheckCircle,
  XCircle,
  Search,
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
import { dummyProfileImage } from "@/lib/constants";

interface UserAccountWithFamily {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  family_tree_uid?: string;
  image?: string;
  date_of_birth?: string;
  hasAccount: boolean;
}

interface BulkCreateAccountsModalProps {
  isOpen: boolean;
  onClose: () => void;
  familyMembersWithoutAccounts: UserAccountWithFamily[];
  onSuccess?: () => void;
}

interface SelectedMember extends UserAccountWithFamily {
  email: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
}

enum CreationStep {
  SELECT_MEMBERS = "select",
  ENTER_DETAILS = "details",
  CREATING = "creating",
  RESULTS = "results",
}

export const BulkCreateAccountsModal: React.FC<
  BulkCreateAccountsModalProps
> = ({ isOpen, onClose, familyMembersWithoutAccounts, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState<CreationStep>(
    CreationStep.SELECT_MEMBERS
  );
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [memberDetails, setMemberDetails] = useState<
    Record<string, SelectedMember>
  >({});
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<BulkAccountCreationResult | null>(
    null
  );
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [searchTerm, setSearchTerm] = useState("");

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(CreationStep.SELECT_MEMBERS);
      setSelectedMembers([]);
      setMemberDetails({});
      setResults(null);
      setValidationErrors({});
      setProgress(0);
      setSearchTerm("");
    }
  }, [isOpen]);

  const handleMemberToggle = (memberId: string) => {
    setSelectedMembers((prev) => {
      const isSelected = prev.includes(memberId);
      if (isSelected) {
        // Remove from selection and details
        const newDetails = { ...memberDetails };
        delete newDetails[memberId];
        setMemberDetails(newDetails);
        return prev.filter((id) => id !== memberId);
      } else {
        // Add to selection and initialize details
        const member = familyMembersWithoutAccounts.find(
          (m) => m.id === memberId
        );
        if (member) {
          setMemberDetails((prev) => ({
            ...prev,
            [memberId]: {
              ...member,
              email: "",
              phoneNumber: "",
              dateOfBirth: member.date_of_birth
                ? new Date(member.date_of_birth)
                : undefined,
            },
          }));
        }
        return [...prev, memberId];
      }
    });
  };

  const handleDetailChange = (
    memberId: string,
    field: keyof SelectedMember,
    value: string | Date | undefined
  ) => {
    setMemberDetails((prev) => ({
      ...prev,
      [memberId]: {
        ...prev[memberId],
        [field]: value,
      },
    }));

    // Clear validation error for this field
    const errorKey = `${memberId}-${field}`;
    if (validationErrors[errorKey]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const validateDetails = (): boolean => {
    const errors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    selectedMembers.forEach((memberId) => {
      const details = memberDetails[memberId];
      if (!details) return;

      // Email validation
      if (!details.email.trim()) {
        errors[`${memberId}-email`] = "Email is required";
      } else if (!emailRegex.test(details.email)) {
        errors[`${memberId}-email`] = "Invalid email format";
      }

      // Date validation is handled by the calendar component automatically
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (currentStep === CreationStep.SELECT_MEMBERS) {
      if (selectedMembers.length === 0) {
        toast.error("Please select at least one family member");
        return;
      }
      setCurrentStep(CreationStep.ENTER_DETAILS);
    } else if (currentStep === CreationStep.ENTER_DETAILS) {
      if (!validateDetails()) {
        toast.error("Please fix the validation errors");
        return;
      }
      handleBulkCreate();
    }
  };

  const handleBulkCreate = async () => {
    setCurrentStep(CreationStep.CREATING);
    setLoading(true);
    setProgress(0);

    try {
      // Get current user session for authentication
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("Authentication required");
      }

      // Prepare accounts data
      const accounts: FamilyMemberAccountCreation[] = selectedMembers.map(
        (memberId) => {
          const details = memberDetails[memberId];
          return {
            familyMemberId: details.family_tree_uid || details.id,
            firstName: details.first_name,
            lastName: details.last_name,
            email: details.email,
            password: "", // Will be generated by API
            phoneNumber: details.phoneNumber || undefined,
            dateOfBirth: details.dateOfBirth
              ? details.dateOfBirth.toISOString().split("T")[0]
              : undefined,
          };
        }
      );

      const requestData: BulkAccountCreationRequest = { accounts };

      // Call the bulk creation API
      const response = await fetch("/api/admin/create-family-accounts", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result: BulkAccountCreationResult = await response.json();
      setResults(result);
      setProgress(100);
      setCurrentStep(CreationStep.RESULTS);

      if (result.successCount > 0) {
        toast.success(`Successfully created ${result.successCount} account(s)`);
        onSuccess?.();
      }

      if (result.failureCount > 0) {
        toast.error(`Failed to create ${result.failureCount} account(s)`);
      }
    } catch (error: any) {
      console.error("Error creating accounts:", error);
      toast.error(error.message || "Failed to create accounts");
      setCurrentStep(CreationStep.ENTER_DETAILS);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  // Filter family members based on search term
  const filteredMembersWithoutAccounts = familyMembersWithoutAccounts.filter(
    (member) => {
      if (!searchTerm) return true;

      const searchLower = searchTerm.toLowerCase();
      const fullName = `${member.first_name} ${member.last_name}`.toLowerCase();
      const familyId = (member.family_tree_uid || member.id).toLowerCase();

      return (
        fullName.includes(searchLower) ||
        familyId.includes(searchLower) ||
        member.first_name.toLowerCase().includes(searchLower) ||
        member.last_name.toLowerCase().includes(searchLower)
      );
    }
  );

  const renderSelectMembersStep = () => (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Select family members to create accounts for (
        {familyMembersWithoutAccounts.length} total):
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or family ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Results count */}
      {searchTerm && (
        <div className="text-sm text-muted-foreground">
          Showing {filteredMembersWithoutAccounts.length} of{" "}
          {familyMembersWithoutAccounts.length} members
        </div>
      )}

      <div className="max-h-[400px] overflow-y-auto space-y-2">
        {filteredMembersWithoutAccounts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm ? (
              <>
                No family members found matching &quot;{searchTerm}&quot;.
                <br />
                <Button
                  variant="link"
                  className="p-0 h-auto text-sm"
                  onClick={() => setSearchTerm("")}
                >
                  Clear search
                </Button>
              </>
            ) : (
              "No family members available for account creation."
            )}
          </div>
        ) : (
          filteredMembersWithoutAccounts.map((member) => (
            <div
              key={member.id}
              className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50"
            >
              <Checkbox
                checked={selectedMembers.includes(member.id)}
                onCheckedChange={() => handleMemberToggle(member.id)}
              />
              <Avatar className="h-8 w-8">
                <AvatarImage src={member.image || dummyProfileImage} />
                <AvatarFallback>
                  {member.first_name[0]}
                  {member.last_name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-medium">
                  {member.first_name} {member.last_name}
                </div>
                <div className="text-sm text-muted-foreground">
                  ID: {member.family_tree_uid || member.id}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedMembers.length > 0 && (
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="text-sm font-medium text-blue-900">
            {selectedMembers.length} member(s) selected
            {searchTerm &&
              filteredMembersWithoutAccounts.length <
                familyMembersWithoutAccounts.length && (
                <span className="text-blue-700">
                  {" "}
                  (from {filteredMembersWithoutAccounts.length} filtered
                  results)
                </span>
              )}
          </div>
        </div>
      )}
    </div>
  );

  const renderEnterDetailsStep = () => (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Enter email addresses and optional details for selected members:
      </div>

      <div className="max-h-[500px] overflow-y-auto space-y-6">
        {selectedMembers.map((memberId) => {
          const member = familyMembersWithoutAccounts.find(
            (m) => m.id === memberId
          );
          const details = memberDetails[memberId];
          if (!member || !details) return null;

          return (
            <div key={memberId} className="p-4 border rounded-lg space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={member.image || dummyProfileImage} />
                  <AvatarFallback>
                    {member.first_name[0]}
                    {member.last_name[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">
                    {member.first_name} {member.last_name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ID: {member.family_tree_uid || member.id}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor={`email-${memberId}`}
                    className="flex items-center gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    Email Address *
                  </Label>
                  <Input
                    id={`email-${memberId}`}
                    type="email"
                    value={details.email}
                    onChange={(e) =>
                      handleDetailChange(memberId, "email", e.target.value)
                    }
                    placeholder="Enter email address"
                    className={
                      validationErrors[`${memberId}-email`]
                        ? "border-red-500"
                        : ""
                    }
                  />
                  {validationErrors[`${memberId}-email`] && (
                    <div className="text-sm text-red-500 mt-1">
                      {validationErrors[`${memberId}-email`]}
                    </div>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor={`phone-${memberId}`}
                    className="flex items-center gap-2"
                  >
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </Label>
                  <Input
                    id={`phone-${memberId}`}
                    type="tel"
                    value={details.phoneNumber || ""}
                    onChange={(e) =>
                      handleDetailChange(
                        memberId,
                        "phoneNumber",
                        e.target.value
                      )
                    }
                    placeholder="Optional phone number"
                  />
                </div>
              </div>

              <div>
                <Label
                  htmlFor={`dob-${memberId}`}
                  className="flex items-center gap-2"
                >
                  <CalendarIcon className="h-4 w-4" />
                  Date of Birth
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !details.dateOfBirth && "text-muted-foreground",
                        validationErrors[`${memberId}-dateOfBirth`]
                          ? "border-red-500"
                          : ""
                      )}
                    >
                      {details.dateOfBirth ? (
                        format(details.dateOfBirth, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <EnhancedCalendar
                      mode="single"
                      selected={details.dateOfBirth}
                      onSelect={(date) => {
                        handleDetailChange(
                          memberId,
                          "dateOfBirth",
                          date ? date.toISOString() : ""
                        );
                      }}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {validationErrors[`${memberId}-dateOfBirth`] && (
                  <div className="text-sm text-red-500 mt-1">
                    {validationErrors[`${memberId}-dateOfBirth`]}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderCreatingStep = () => (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <LoadingIcon className="h-12 w-12" />
      </div>
      <div>
        <h3 className="text-lg font-medium">Creating Accounts...</h3>
        <p className="text-muted-foreground">
          Please wait while we create {selectedMembers.length} account(s)
        </p>
      </div>
      <Progress value={progress} className="w-full" />
    </div>
  );

  const renderResultsStep = () => {
    if (!results) return null;

    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-medium">Account Creation Complete</h3>
          <p className="text-muted-foreground">
            {results.successCount} successful, {results.failureCount} failed
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {results.totalRequested}
            </div>
            <div className="text-sm text-blue-700">Total Requested</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {results.successCount}
            </div>
            <div className="text-sm text-green-700">Successful</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {results.failureCount}
            </div>
            <div className="text-sm text-red-700">Failed</div>
          </div>
        </div>

        {results.results.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Results Details:</h4>
            <div className="max-h-[300px] overflow-y-auto space-y-2">
              {results.results.map((result, index) => {
                const member = selectedMembers[index]
                  ? familyMembersWithoutAccounts.find(
                      (m) => m.id === selectedMembers[index]
                    )
                  : null;

                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 border rounded-lg"
                  >
                    {result.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <div className="flex-1">
                      <div className="font-medium">
                        {member
                          ? `${member.first_name} ${member.last_name}`
                          : "Unknown Member"}
                      </div>
                      {result.success ? (
                        <div className="text-sm text-green-600">
                          Account created - {result.email}
                        </div>
                      ) : (
                        <div className="text-sm text-red-600">
                          {result.error}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {results.errors.length > 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <div className="font-medium">Errors encountered:</div>
                {results.errors.map((error, index) => (
                  <div key={index} className="text-sm">
                    {error}
                  </div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  };

  const getDialogTitle = () => {
    switch (currentStep) {
      case CreationStep.SELECT_MEMBERS:
        return "Select Family Members";
      case CreationStep.ENTER_DETAILS:
        return "Enter Account Details";
      case CreationStep.CREATING:
        return "Creating Accounts";
      case CreationStep.RESULTS:
        return "Account Creation Results";
      default:
        return "Bulk Create Accounts";
    }
  };

  const getDialogDescription = () => {
    switch (currentStep) {
      case CreationStep.SELECT_MEMBERS:
        return "Choose which family members to create user accounts for.";
      case CreationStep.ENTER_DETAILS:
        return "Provide email addresses and optional details for each selected member.";
      case CreationStep.CREATING:
        return "Creating user accounts and sending login credentials via email.";
      case CreationStep.RESULTS:
        return "Review the results of the bulk account creation process.";
      default:
        return "Create multiple user accounts at once.";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {getDialogTitle()}
          </DialogTitle>
          <DialogDescription>{getDialogDescription()}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {currentStep === CreationStep.SELECT_MEMBERS &&
            renderSelectMembersStep()}
          {currentStep === CreationStep.ENTER_DETAILS &&
            renderEnterDetailsStep()}
          {currentStep === CreationStep.CREATING && renderCreatingStep()}
          {currentStep === CreationStep.RESULTS && renderResultsStep()}
        </div>

        <DialogFooter className="flex gap-2">
          {currentStep === CreationStep.SELECT_MEMBERS && (
            <>
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleNextStep}
                disabled={selectedMembers.length === 0}
              >
                Next: Enter Details ({selectedMembers.length})
              </Button>
            </>
          )}

          {currentStep === CreationStep.ENTER_DETAILS && (
            <>
              <Button
                variant="outline"
                onClick={() => setCurrentStep(CreationStep.SELECT_MEMBERS)}
                disabled={loading}
              >
                Back
              </Button>
              <Button onClick={handleNextStep} disabled={loading}>
                Create {selectedMembers.length} Account(s)
              </Button>
            </>
          )}

          {currentStep === CreationStep.CREATING && (
            <Button variant="outline" disabled>
              Creating...
            </Button>
          )}

          {currentStep === CreationStep.RESULTS && (
            <Button onClick={handleClose}>Close</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
