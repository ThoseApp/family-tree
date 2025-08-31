"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import FamilyMembersTable from "@/components/tables/family-members";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Users,
  Upload,
  Search,
  Filter,
  X,
  UserCheck,
  UserX,
  Mars,
  Venus,
} from "lucide-react";
import { FamilyMemberModal } from "@/components/modals/family-member-modal";
import { CreateAccountModal } from "@/components/modals/create-account-modal";
import { useFamilyMembersStore } from "@/stores/family-members-store";
import { FamilyMember } from "@/lib/types";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LoadingIcon } from "@/components/loading-icon";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

// Utility function to calculate age with proper validation
const calculateAge = (birthDate?: string): number | null => {
  if (!birthDate || typeof birthDate !== "string") return null;

  const birth = new Date(birthDate);
  if (isNaN(birth.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age >= 0 ? age : null;
};

// Debounce utility function
const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Utility function to safely get string value
const safeString = (value?: string | null): string => {
  return value && typeof value === "string" ? value : "";
};

const FamilyMembersPage = () => {
  const {
    familyMembers,
    isLoading,
    error,
    fetchFamilyMembers,
    addFamilyMember,
    updateFamilyMember,
    removeFamilyMember,
    clearError,
    clearStorage,
  } = useFamilyMembersStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [deletingMember, setDeletingMember] = useState<FamilyMember | null>(
    null
  );

  // Create Account Modal state
  const [isCreateAccountModalOpen, setIsCreateAccountModalOpen] =
    useState(false);
  const [creatingAccountFor, setCreatingAccountFor] =
    useState<FamilyMember | null>(null);

  // Loading states for different operations
  const [operationLoading, setOperationLoading] = useState({
    adding: false,
    editing: false,
    deleting: false,
  });

  // Enhanced filtering states with debounced search
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [birthYearFilter, setBirthYearFilter] = useState<string>("all");
  const [relationshipFilter, setRelationshipFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Debounced search function
  const debouncedSetSearch = useCallback(
    debounce((value: string) => {
      setSearchQuery(value);
    }, 300),
    []
  );

  // Update search query when input changes
  useEffect(() => {
    debouncedSetSearch(searchInput);
  }, [searchInput, debouncedSetSearch]);

  useEffect(() => {
    fetchFamilyMembers();
  }, [fetchFamilyMembers]);

  // Global error handler for quota exceeded errors
  useEffect(() => {
    const handleStorageError = (event: ErrorEvent) => {
      if (
        event.error?.name === "QuotaExceededError" ||
        event.message?.includes("QuotaExceeded") ||
        event.message?.includes("quota")
      ) {
        toast.error("Storage quota exceeded. Clear cached data to continue.", {
          action: {
            label: "Clear Storage",
            onClick: () => {
              clearStorage();
              window.location.reload();
            },
          },
        });
      }
    };

    window.addEventListener("error", handleStorageError);

    return () => {
      window.removeEventListener("error", handleStorageError);
    };
  }, [clearStorage]);

  useEffect(() => {
    if (error) {
      // Check if it's a storage-related error
      if (
        error.includes("storage") ||
        error.includes("quota") ||
        error.includes("QuotaExceeded")
      ) {
        toast.error(
          "Storage quota exceeded. Click here to clear cached data and continue.",
          {
            action: {
              label: "Clear Storage",
              onClick: () => {
                clearStorage();
                window.location.reload();
              },
            },
          }
        );
      } else {
        toast.error(error);
      }
      clearError();
    }
  }, [error, clearError, clearStorage]);

  // Enhanced filtering logic with better performance and error handling
  const filteredFamilyMembers = useMemo(() => {
    let filtered = [...familyMembers];

    // Search filter with proper null/undefined handling
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((member) => {
        const name = safeString(member.name).toLowerCase();
        const description = safeString(member.description).toLowerCase();
        const fatherName = safeString(member.fatherName).toLowerCase();
        const motherName = safeString(member.motherName).toLowerCase();
        const spouseName = safeString(member.spouseName).toLowerCase();
        const birthDate = safeString(member.birthDate);

        return (
          name.includes(searchLower) ||
          description.includes(searchLower) ||
          fatherName.includes(searchLower) ||
          motherName.includes(searchLower) ||
          spouseName.includes(searchLower) ||
          birthDate.includes(searchQuery)
        );
      });
    }

    // Gender filter
    if (genderFilter !== "all") {
      filtered = filtered.filter((member) => member.gender === genderFilter);
    }

    // Birth year filter with improved age calculation
    if (birthYearFilter !== "all") {
      filtered = filtered.filter((member) => {
        const age = calculateAge(member.birthDate);
        if (age === null) return false;

        switch (birthYearFilter) {
          case "0-18":
            return age >= 0 && age <= 18;
          case "19-35":
            return age >= 19 && age <= 35;
          case "36-55":
            return age >= 36 && age <= 55;
          case "56-75":
            return age >= 56 && age <= 75;
          case "75+":
            return age > 75;
          default:
            return true;
        }
      });
    }

    // Relationship filter with proper string handling
    if (relationshipFilter !== "all") {
      filtered = filtered.filter((member) => {
        const spouseName = safeString(member.spouseName).trim();
        const fatherName = safeString(member.fatherName).trim();
        const motherName = safeString(member.motherName).trim();

        switch (relationshipFilter) {
          case "has-spouse":
            return spouseName !== "";
          case "no-spouse":
            return spouseName === "";
          case "has-parents":
            return fatherName !== "" || motherName !== "";
          case "no-parents":
            return fatherName === "" && motherName === "";
          default:
            return true;
        }
      });
    }

    // Sort the filtered results with better fallback handling
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return safeString(a.name).localeCompare(safeString(b.name));
        case "birth-date":
          const aDate = a.birthDate ? new Date(a.birthDate) : null;
          const bDate = b.birthDate ? new Date(b.birthDate) : null;

          if (!aDate && !bDate) return 0;
          if (!aDate) return 1;
          if (!bDate) return -1;

          if (isNaN(aDate.getTime()) && isNaN(bDate.getTime())) return 0;
          if (isNaN(aDate.getTime())) return 1;
          if (isNaN(bDate.getTime())) return -1;

          return aDate.getTime() - bDate.getTime();
        case "gender":
          return safeString(a.gender).localeCompare(safeString(b.gender));
        case "order-birth":
          const orderA = a.orderOfBirth ?? Number.MAX_SAFE_INTEGER;
          const orderB = b.orderOfBirth ?? Number.MAX_SAFE_INTEGER;
          return orderA - orderB;
        default:
          return safeString(a.name).localeCompare(safeString(b.name));
      }
    });

    return filtered;
  }, [
    familyMembers,
    searchQuery, // Using debounced searchQuery instead of searchInput
    genderFilter,
    birthYearFilter,
    relationshipFilter,
    sortBy,
  ]);

  // Clear all filters
  const clearAllFilters = () => {
    setSearchInput("");
    setSearchQuery("");
    setGenderFilter("all");
    setBirthYearFilter("all");
    setRelationshipFilter("all");
    setSortBy("name");
  };

  // Check if any filters are active
  const hasActiveFilters =
    searchQuery.trim() ||
    genderFilter !== "all" ||
    birthYearFilter !== "all" ||
    relationshipFilter !== "all" ||
    sortBy !== "name";

  // Count active filters
  const activeFiltersCount = [
    searchQuery.trim(),
    genderFilter !== "all" ? genderFilter : null,
    birthYearFilter !== "all" ? birthYearFilter : null,
    relationshipFilter !== "all" ? relationshipFilter : null,
    sortBy !== "name" ? sortBy : null,
  ].filter(Boolean).length;

  // Calculate filtered statistics with proper safety checks
  const filteredStats = useMemo(() => {
    const total = filteredFamilyMembers.length;
    const male = filteredFamilyMembers.filter(
      (m) => m.gender === "Male"
    ).length;
    const female = filteredFamilyMembers.filter(
      (m) => m.gender === "Female"
    ).length;
    const withSpouse = filteredFamilyMembers.filter(
      (m) => safeString(m.spouseName).trim() !== ""
    ).length;

    // Calculate average age with proper validation
    const membersWithValidBirthDate = filteredFamilyMembers
      .map((m) => ({ member: m, age: calculateAge(m.birthDate) }))
      .filter(({ age }) => age !== null);

    const averageAge =
      membersWithValidBirthDate.length > 0
        ? Math.round(
            membersWithValidBirthDate.reduce(
              (sum, { age }) => sum + (age || 0),
              0
            ) / membersWithValidBirthDate.length
          )
        : 0;

    return {
      total,
      male,
      female,
      withSpouse,
      averageAge,
      malePercentage: total > 0 ? Math.round((male / total) * 100) : 0,
      femalePercentage: total > 0 ? Math.round((female / total) * 100) : 0,
    };
  }, [filteredFamilyMembers]);

  // Improved error handling for add operation
  const handleAddFamilyMember = async (
    memberData: Omit<FamilyMember, "id">
  ) => {
    setOperationLoading((prev) => ({ ...prev, adding: true }));
    try {
      await addFamilyMember(memberData);
      toast.success("Family member added successfully!");
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Failed to add family member:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while adding the family member";
      toast.error(errorMessage);
    } finally {
      setOperationLoading((prev) => ({ ...prev, adding: false }));
    }
  };

  // Improved error handling for edit operation
  const handleEditFamilyMember = async (
    memberData: Omit<FamilyMember, "id">
  ) => {
    if (!editingMember) return;

    setOperationLoading((prev) => ({ ...prev, editing: true }));
    try {
      await updateFamilyMember(editingMember.id, memberData);
      toast.success("Family member updated successfully!");
      setIsEditModalOpen(false);
      setEditingMember(null);
    } catch (error) {
      console.error("Failed to update family member:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while updating the family member";
      toast.error(errorMessage);
    } finally {
      setOperationLoading((prev) => ({ ...prev, editing: false }));
    }
  };

  // Improved error handling for delete operation
  const handleDeleteFamilyMember = async () => {
    if (!deletingMember) return;

    setOperationLoading((prev) => ({ ...prev, deleting: true }));
    try {
      await removeFamilyMember(deletingMember.id);
      toast.success("Family member removed successfully!");
      setDeletingMember(null);
    } catch (error) {
      console.error("Failed to remove family member:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while removing the family member";
      toast.error(errorMessage);
    } finally {
      setOperationLoading((prev) => ({ ...prev, deleting: false }));
    }
  };

  // Handle creating user account for family member
  const handleCreateAccount = (member: FamilyMember) => {
    setCreatingAccountFor(member);
    setIsCreateAccountModalOpen(true);
  };

  const handleCreateAccountSuccess = () => {
    // Optionally refresh data or show additional success feedback
    toast.success("User account created successfully!");
  };

  const openEditModal = (member: FamilyMember) => {
    setEditingMember(member);
    setIsEditModalOpen(true);
  };

  const openDeleteDialog = (member: FamilyMember) => {
    setDeletingMember(member);
  };

  const handleMemberClick = (member: FamilyMember) => {
    // Handle member click - could navigate to detail page
    console.log("Member clicked:", member);
  };

  // Improved filter clearing with proper accessibility
  const clearFilter = (filterType: string) => {
    switch (filterType) {
      case "search":
        setSearchInput("");
        setSearchQuery("");
        break;
      case "gender":
        setGenderFilter("all");
        break;
      case "birthYear":
        setBirthYearFilter("all");
        break;
      case "relationship":
        setRelationshipFilter("all");
        break;
      case "sortBy":
        setSortBy("name");
        break;
    }
  };

  return (
    <div className="flex flex-col gap-y-8 lg:gap-y-12">
      {/* HEADER SECTION */}
      <div className="flex md:items-center md:flex-row flex-col md:justify-between gap-y-4">
        <div>
          <h1 className="text-2xl font-semibold">Family Members</h1>
          <p className="text-muted-foreground mt-1">
            Manage your family tree members and their information
          </p>
          {hasActiveFilters && (
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <span>
                Showing {filteredStats.total} of {familyMembers.length} members
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* <Button
            variant="outline"
            className="rounded-full"
            onClick={() => {
              // TODO: Implement bulk upload functionality
              toast.info("Bulk upload feature coming soon!");
            }}
          >
            <Upload className="size-4 mr-2" />
            Import Members
          </Button> */}

          <Button
            className="bg-foreground text-background rounded-full hover:bg-foreground/80"
            onClick={() => setIsAddModalOpen(true)}
            disabled={operationLoading.adding}
          >
            {operationLoading.adding ? (
              <LoadingIcon className="size-4 mr-2" />
            ) : (
              <Plus className="size-4 mr-2" />
            )}
            Add Family Member
          </Button>
        </div>
      </div>

      {/* ENHANCED FILTERING SECTION */}
      <div className="space-y-4">
        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative w-full flex-1">
            <Input
              placeholder="Search by name, description, or family relations..."
              value={searchInput}
              onChange={(e) => {
                // Limit input length for security
                const value = e.target.value.slice(0, 100);
                setSearchInput(value);
              }}
              className="pl-10 rounded-full"
              maxLength={100}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>

          <div className="flex items-center gap-2">
            <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="rounded-full relative">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge className="ml-2 h-5 w-5 p-0 text-xs rounded-full">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Filter Options</h4>
                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAllFilters}
                        className="h-8 px-2 text-xs"
                      >
                        Clear All
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {/* Gender Filter */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Gender
                      </label>
                      <Select
                        value={genderFilter}
                        onValueChange={setGenderFilter}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Filter by gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Genders</SelectItem>
                          <SelectItem value="Male">
                            <div className="flex items-center gap-2">
                              <UserCheck className="h-4 w-4" />
                              Male
                            </div>
                          </SelectItem>
                          <SelectItem value="Female">
                            <div className="flex items-center gap-2">
                              <UserX className="h-4 w-4" />
                              Female
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Age Group Filter */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Age Group
                      </label>
                      <Select
                        value={birthYearFilter}
                        onValueChange={setBirthYearFilter}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Filter by age" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Ages</SelectItem>
                          <SelectItem value="0-18">0-18 years</SelectItem>
                          <SelectItem value="19-35">19-35 years</SelectItem>
                          <SelectItem value="36-55">36-55 years</SelectItem>
                          <SelectItem value="56-75">56-75 years</SelectItem>
                          <SelectItem value="75+">75+ years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Relationship Filter */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Relationship Status
                      </label>
                      <Select
                        value={relationshipFilter}
                        onValueChange={setRelationshipFilter}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Filter by relationships" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Members</SelectItem>
                          <SelectItem value="has-spouse">Has Spouse</SelectItem>
                          <SelectItem value="no-spouse">No Spouse</SelectItem>
                          <SelectItem value="has-parents">
                            Has Parent Info
                          </SelectItem>
                          <SelectItem value="no-parents">
                            No Parent Info
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Sort By */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Sort By
                      </label>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="name">Name (A-Z)</SelectItem>
                          <SelectItem value="birth-date">Birth Date</SelectItem>
                          <SelectItem value="gender">Gender</SelectItem>
                          <SelectItem value="order-birth">
                            Birth Order
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Active Filters Display with improved accessibility */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Active filters:
            </span>
            {searchQuery.trim() && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Search: &quot;{searchQuery}&quot;
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto w-auto p-0 hover:bg-transparent"
                  onClick={() => clearFilter("search")}
                  aria-label="Clear search filter"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {genderFilter !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Gender: {genderFilter}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto w-auto p-0 hover:bg-transparent"
                  onClick={() => clearFilter("gender")}
                  aria-label="Clear gender filter"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {birthYearFilter !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Age: {birthYearFilter}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto w-auto p-0 hover:bg-transparent"
                  onClick={() => clearFilter("birthYear")}
                  aria-label="Clear age filter"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {relationshipFilter !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Relationship: {relationshipFilter.replace("-", " ")}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto w-auto p-0 hover:bg-transparent"
                  onClick={() => clearFilter("relationship")}
                  aria-label="Clear relationship filter"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {sortBy !== "name" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Sort: {sortBy.replace("-", " ")}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto w-auto p-0 hover:bg-transparent"
                  onClick={() => clearFilter("sortBy")}
                  aria-label="Clear sort filter"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* ENHANCED STATS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {hasActiveFilters ? "Filtered" : "Total"} Members
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {hasActiveFilters
                ? `of ${familyMembers.length} total`
                : "Active family members"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Male Members</CardTitle>
            <Mars className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredStats.male}</div>
            <p className="text-xs text-muted-foreground">
              {filteredStats.malePercentage}% of filtered members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Female Members
            </CardTitle>
            <Venus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredStats.female}</div>
            <p className="text-xs text-muted-foreground">
              {filteredStats.femalePercentage}% of filtered members
            </p>
          </CardContent>
        </Card>
      </div>

      {/* TABLE SECTION */}
      <Card>
        <CardHeader>
          <CardTitle>Family Members List</CardTitle>
          <CardDescription>
            {hasActiveFilters
              ? `Showing ${filteredStats.total} filtered members from your family tree`
              : "View and manage all family members in your family tree"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && familyMembers.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <LoadingIcon className="mr-2" />
              Loading family members...
            </div>
          ) : filteredFamilyMembers.length === 0 && familyMembers.length > 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground mb-4">
                No family members found matching your filters
              </p>
              <Button
                variant="outline"
                onClick={clearAllFilters}
                className="rounded-full"
              >
                Clear All Filters
              </Button>
            </div>
          ) : (
            <FamilyMembersTable
              data={filteredFamilyMembers}
              onEdit={openEditModal}
              onDelete={openDeleteDialog}
              onCreateAccount={handleCreateAccount}
              onUserClick={handleMemberClick}
              showSearchInput={false}
            />
          )}
        </CardContent>
      </Card>

      {/* ADD MODAL */}
      <FamilyMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onConfirm={handleAddFamilyMember}
        isLoading={operationLoading.adding}
        mode="add"
      />

      {/* EDIT MODAL */}
      <FamilyMemberModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingMember(null);
        }}
        onConfirm={handleEditFamilyMember}
        isLoading={operationLoading.editing}
        editData={editingMember}
        mode="edit"
      />

      {/* DELETE CONFIRMATION DIALOG */}
      <AlertDialog
        open={!!deletingMember}
        onOpenChange={() => setDeletingMember(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              <strong>{safeString(deletingMember?.name)}</strong> from your
              family tree.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={operationLoading.deleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFamilyMember}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={operationLoading.deleting}
            >
              {operationLoading.deleting && (
                <LoadingIcon className="mr-2 h-4 w-4" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* CREATE ACCOUNT MODAL */}
      <CreateAccountModal
        isOpen={isCreateAccountModalOpen}
        onClose={() => {
          setIsCreateAccountModalOpen(false);
          setCreatingAccountFor(null);
        }}
        familyMember={creatingAccountFor}
        onSuccess={handleCreateAccountSuccess}
      />
    </div>
  );
};

export default FamilyMembersPage;
