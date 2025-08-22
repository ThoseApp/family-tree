"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import PageHeader from "@/components/page-header";
import FamilyMemberCard from "@/components/cards/family-member-card";
import { useFamilyMembersStore } from "@/stores/family-members-store";
import { FamilyMember } from "@/lib/types";
import { LoadingIcon } from "@/components/loading-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X, Users, UserCheck } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { dummyProfileImage } from "@/lib/constants";

// Utility functions
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

import { FamilyMemberRequestModal } from "@/components/modals/family-member-request-modal";

import { useUserStore } from "@/stores/user-store";

const FamilyMembersPage = () => {
  const { familyMembers, isLoading, error, fetchFamilyMembers, clearError } =
    useFamilyMembersStore();
  const { user } = useUserStore();

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  // Search and filter states
  const [searchInput, setSearchInput] = useState("");
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [ageFilter, setAgeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleRequestSuccess = () => {
    // Optionally, you might want to show a persistent success message
    // or update a list of user's pending requests.
    // For now, we just close the modal.
  };

  // Fetch family members on component mount
  useEffect(() => {
    fetchFamilyMembers();
  }, [fetchFamilyMembers]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error("Failed to load family members. Please try again.");
      clearError();
    }
  }, [error, clearError]);

  // Filter and sort family members
  const filteredFamilyMembers = useMemo(() => {
    // Ensure we have valid family members data
    if (!Array.isArray(familyMembers) || familyMembers.length === 0) {
      return [];
    }

    // Start with a fresh copy of the array
    let filtered = [...familyMembers];

    if (searchInput.trim()) {
      const searchLower = searchInput.toLowerCase().trim();

      filtered = filtered.filter((member) => {
        // Ensure member exists and has required properties
        if (!member || !member.id) return false;

        // Search across multiple fields for a more comprehensive search
        const name = String(member.name || "").toLowerCase();

        return name.includes(searchLower);
      });
    }

    // Gender filter
    if (genderFilter !== "all") {
      filtered = filtered.filter((member) => member.gender === genderFilter);
    }

    // Age filter
    if (ageFilter !== "all") {
      filtered = filtered.filter((member) => {
        const age = calculateAge(member.birthDate);
        if (age === null) return false;

        switch (ageFilter) {
          case "0-18":
            return age >= 0 && age <= 18;
          case "19-35":
            return age >= 19 && age <= 35;
          case "36-55":
            return age >= 36 && age <= 55;
          case "56+":
            return age > 55;
          default:
            return true;
        }
      });
    }

    // Sort the results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return String(a.name || "").localeCompare(String(b.name || ""));
        case "age":
          const ageA = calculateAge(a.birthDate) ?? 0;
          const ageB = calculateAge(b.birthDate) ?? 0;
          return ageA - ageB;
        case "gender":
          return String(a.gender || "").localeCompare(String(b.gender || ""));
        default:
          return String(a.name || "").localeCompare(String(b.name || ""));
      }
    });

    return filtered;
  }, [familyMembers, searchInput, genderFilter, ageFilter, sortBy]);

  // Clear all filters
  const clearAllFilters = () => {
    setSearchInput("");
    setGenderFilter("all");
    setAgeFilter("all");
    setSortBy("name");
  };

  // Check if any filters are active
  const hasActiveFilters =
    searchInput.trim() ||
    genderFilter !== "all" ||
    ageFilter !== "all" ||
    sortBy !== "name";

  // Count active filters
  const activeFiltersCount = [
    searchInput.trim(),
    genderFilter !== "all" ? genderFilter : null,
    ageFilter !== "all" ? ageFilter : null,
    sortBy !== "name" ? sortBy : null,
  ].filter(Boolean).length;

  // Calculate statistics
  const stats = useMemo(() => {
    const total = filteredFamilyMembers.length;
    const male = filteredFamilyMembers.filter(
      (m) => m.gender === "Male"
    ).length;
    const female = filteredFamilyMembers.filter(
      (m) => m.gender === "Female"
    ).length;

    return {
      total,
      male,
      female,
      totalAll: familyMembers.length,
    };
  }, [filteredFamilyMembers, familyMembers]);

  const finalMembers = useMemo(() => {
    return [...familyMembers].filter((member) => {
      return member.name.toLowerCase().includes(searchInput.toLowerCase());
    });
  }, [familyMembers, searchInput]);

  return (
    <div className="pb-20">
      <PageHeader
        title="The Mosuro Family"
        description="Get to know the amazing individuals that make up our family tree"
      />

      {/* Search and Filter Section */}
      <div className="mb-8 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search family members..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10 pr-4 rounded-full"
          />
        </div>

        {/* Filters and Stats Row */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Filter Controls */}
          <div className="flex flex-wrap gap-2 items-center">
            {user && !user.user_metadata?.is_admin && (
              <Button
                variant="default"
                size="sm"
                className="gap-2"
                onClick={() => setIsRequestModalOpen(true)}
              >
                Add New Member
              </Button>
            )}
            <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="h-5 w-5 p-0 flex items-center justify-center"
                    >
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="start">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Filter Family Members</h4>
                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAllFilters}
                        className="text-xs"
                      >
                        Clear All
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {/* Gender Filter */}
                    <div>
                      <label className="text-sm font-medium">Gender</label>
                      <Select
                        value={genderFilter}
                        onValueChange={setGenderFilter}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="All Genders" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Genders</SelectItem>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Age Filter */}
                    <div>
                      <label className="text-sm font-medium">Age Group</label>
                      <Select value={ageFilter} onValueChange={setAgeFilter}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="All Ages" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Ages</SelectItem>
                          <SelectItem value="0-18">0-18 years</SelectItem>
                          <SelectItem value="19-35">19-35 years</SelectItem>
                          <SelectItem value="36-55">36-55 years</SelectItem>
                          <SelectItem value="56+">56+ years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Sort By */}
                    <div>
                      <label className="text-sm font-medium">Sort By</label>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sort by Name" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="name">Name (A-Z)</SelectItem>
                          <SelectItem value="age">
                            Age (Youngest First)
                          </SelectItem>
                          <SelectItem value="gender">Gender</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-1">
                {searchInput && (
                  <Badge variant="secondary" className="gap-1">
                    Search: &quot;{searchInput}&quot;
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => {
                        setSearchInput("");
                      }}
                    />
                  </Badge>
                )}
                {genderFilter !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    {genderFilter}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setGenderFilter("all")}
                    />
                  </Badge>
                )}
                {ageFilter !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    Age: {ageFilter}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setAgeFilter("all")}
                    />
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>
                {stats.total} {hasActiveFilters && `of ${stats.totalAll}`}{" "}
                members
              </span>
            </div>
            <span>♂ {stats.male}</span>
            <span>♀ {stats.female}</span>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <LoadingIcon />
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-destructive">Failed to load family members</p>
              <Button
                variant="outline"
                onClick={fetchFamilyMembers}
                className="mt-4"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading &&
        !error &&
        finalMembers.length === 0 &&
        familyMembers.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No Family Members
                </h3>
                <p className="text-muted-foreground">
                  Family member data will appear here once it&apos;s been added.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

      {/* No Results State */}
      {!isLoading &&
        !error &&
        finalMembers.length === 0 &&
        finalMembers.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search or filters to find family members.
                </p>
                <Button variant="outline" onClick={clearAllFilters}>
                  Clear All Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

      {/* Family Members Grid */}
      {!isLoading && !error && finalMembers.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-8">
          {finalMembers.map((member) => (
            <FamilyMemberCard
              key={member.id}
              imageSrc={member.imageSrc}
              name={member.name}
              unique_id={member.unique_id}
              description={member.description || ""}
            />
          ))}
        </div>
      )}

      <FamilyMemberRequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onSuccess={handleRequestSuccess}
      />
    </div>
  );
};

export default FamilyMembersPage;
