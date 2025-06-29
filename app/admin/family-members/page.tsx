"use client";

import React, { useState, useEffect, useMemo } from "react";
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
} from "lucide-react";
import { FamilyMemberModal } from "@/components/modals/family-member-modal";
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
  } = useFamilyMembersStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [deletingMember, setDeletingMember] = useState<FamilyMember | null>(
    null
  );

  // Enhanced filtering states
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [birthYearFilter, setBirthYearFilter] = useState<string>("all");
  const [relationshipFilter, setRelationshipFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    fetchFamilyMembers();
  }, [fetchFamilyMembers]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  // Enhanced filtering logic
  const filteredFamilyMembers = useMemo(() => {
    let filtered = [...familyMembers];

    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter((member) => {
        return (
          member.name?.toLowerCase().includes(searchLower) ||
          member.description?.toLowerCase().includes(searchLower) ||
          member.fatherName?.toLowerCase().includes(searchLower) ||
          member.motherName?.toLowerCase().includes(searchLower) ||
          member.spouseName?.toLowerCase().includes(searchLower) ||
          member.birthDate?.includes(searchQuery)
        );
      });
    }

    // Gender filter
    if (genderFilter !== "all") {
      filtered = filtered.filter((member) => member.gender === genderFilter);
    }

    // Birth year filter
    if (birthYearFilter !== "all") {
      const currentYear = new Date().getFullYear();
      filtered = filtered.filter((member) => {
        if (!member.birthDate) return false;

        const birthYear = new Date(member.birthDate).getFullYear();
        const age = currentYear - birthYear;

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

    // Relationship filter
    if (relationshipFilter !== "all") {
      filtered = filtered.filter((member) => {
        switch (relationshipFilter) {
          case "has-spouse":
            return member.spouseName && member.spouseName.trim() !== "";
          case "no-spouse":
            return !member.spouseName || member.spouseName.trim() === "";
          case "has-parents":
            return (
              (member.fatherName && member.fatherName.trim() !== "") ||
              (member.motherName && member.motherName.trim() !== "")
            );
          case "no-parents":
            return (
              (!member.fatherName || member.fatherName.trim() === "") &&
              (!member.motherName || member.motherName.trim() === "")
            );
          default:
            return true;
        }
      });
    }

    // Sort the filtered results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return (a.name || "").localeCompare(b.name || "");
        case "birth-date":
          if (!a.birthDate && !b.birthDate) return 0;
          if (!a.birthDate) return 1;
          if (!b.birthDate) return -1;
          return (
            new Date(a.birthDate).getTime() - new Date(b.birthDate).getTime()
          );
        case "gender":
          return (a.gender || "").localeCompare(b.gender || "");
        case "order-birth":
          const orderA = a.orderOfBirth || 999;
          const orderB = b.orderOfBirth || 999;
          return orderA - orderB;
        default:
          return (a.name || "").localeCompare(b.name || "");
      }
    });

    return filtered;
  }, [
    familyMembers,
    searchQuery,
    genderFilter,
    birthYearFilter,
    relationshipFilter,
    sortBy,
  ]);

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery("");
    setGenderFilter("all");
    setBirthYearFilter("all");
    setRelationshipFilter("all");
    setSortBy("name");
  };

  // Check if any filters are active
  const hasActiveFilters =
    searchQuery ||
    genderFilter !== "all" ||
    birthYearFilter !== "all" ||
    relationshipFilter !== "all" ||
    sortBy !== "name";

  // Count active filters
  const activeFiltersCount = [
    searchQuery,
    genderFilter !== "all" ? genderFilter : null,
    birthYearFilter !== "all" ? birthYearFilter : null,
    relationshipFilter !== "all" ? relationshipFilter : null,
    sortBy !== "name" ? sortBy : null,
  ].filter(Boolean).length;

  // Calculate filtered statistics
  const filteredStats = {
    total: filteredFamilyMembers.length,
    male: filteredFamilyMembers.filter((m) => m.gender === "Male").length,
    female: filteredFamilyMembers.filter((m) => m.gender === "Female").length,
    withSpouse: filteredFamilyMembers.filter(
      (m) => m.spouseName && m.spouseName.trim() !== ""
    ).length,
    averageAge:
      filteredFamilyMembers.length > 0
        ? Math.round(
            filteredFamilyMembers
              .filter((m) => m.birthDate)
              .reduce((sum, m) => {
                const age =
                  new Date().getFullYear() -
                  new Date(m.birthDate).getFullYear();
                return sum + age;
              }, 0) / filteredFamilyMembers.filter((m) => m.birthDate).length
          )
        : 0,
  };

  const handleAddFamilyMember = async (
    memberData: Omit<FamilyMember, "id">
  ) => {
    try {
      await addFamilyMember(memberData);
      toast.success("Family member added successfully!");
      setIsAddModalOpen(false);
    } catch (error) {
      toast.error("Failed to add family member");
    }
  };

  const handleEditFamilyMember = async (
    memberData: Omit<FamilyMember, "id">
  ) => {
    if (!editingMember) return;

    try {
      await updateFamilyMember(editingMember.id, memberData);
      toast.success("Family member updated successfully!");
      setIsEditModalOpen(false);
      setEditingMember(null);
    } catch (error) {
      toast.error("Failed to update family member");
    }
  };

  const handleDeleteFamilyMember = async () => {
    if (!deletingMember) return;

    try {
      await removeFamilyMember(deletingMember.id);
      toast.success("Family member removed successfully!");
      setDeletingMember(null);
    } catch (error) {
      toast.error("Failed to remove family member");
    }
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
            disabled={isLoading}
          >
            <Plus className="size-4 mr-2" />
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
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

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Active filters:
            </span>
            {searchQuery && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Search: &quot;{searchQuery}&quot;
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setSearchQuery("")}
                />
              </Badge>
            )}
            {genderFilter !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Gender: {genderFilter}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setGenderFilter("all")}
                />
              </Badge>
            )}
            {birthYearFilter !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Age: {birthYearFilter}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setBirthYearFilter("all")}
                />
              </Badge>
            )}
            {relationshipFilter !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Relationship: {relationshipFilter.replace("-", " ")}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setRelationshipFilter("all")}
                />
              </Badge>
            )}
            {sortBy !== "name" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Sort: {sortBy.replace("-", " ")}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setSortBy("name")}
                />
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
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredStats.male}</div>
            <p className="text-xs text-muted-foreground">
              {filteredStats.total > 0
                ? Math.round((filteredStats.male / filteredStats.total) * 100)
                : 0}
              % of filtered members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Female Members
            </CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredStats.female}</div>
            <p className="text-xs text-muted-foreground">
              {filteredStats.total > 0
                ? Math.round((filteredStats.female / filteredStats.total) * 100)
                : 0}
              % of filtered members
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
        isLoading={isLoading}
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
        isLoading={isLoading}
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
              <strong>{deletingMember?.name}</strong> from your family tree.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFamilyMember}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isLoading}
            >
              {isLoading && <LoadingIcon className="mr-2 h-4 w-4" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FamilyMembersPage;
