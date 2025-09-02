/**
 * Custom hook for managing family member dropdown data
 * Used in both admin and user family member forms
 */

import { useState, useEffect, useMemo } from "react";
import { ProcessedMember } from "@/lib/types";
import { fetchFamilyMembers } from "@/lib/utils/family-tree-helpers";
import {
  getAvailableFathers,
  getAvailableMothers,
  getAvailableSpouses,
  getSpousesForFather,
  getHusbandsForMother,
  memberToDropdownOption,
} from "@/lib/utils/unique-id-generator";

interface DropdownOption {
  value: string;
  label: string;
}

export interface FamilyMemberDropdowns {
  // Loading states
  isLoading: boolean;
  error: string | null;

  // Raw data
  allMembers: ProcessedMember[];

  // Dropdown options
  fatherOptions: DropdownOption[];
  motherOptions: DropdownOption[];
  spouseOptions: DropdownOption[];

  // Helper functions
  getMotherOptionsForFather: (fatherId: string) => DropdownOption[];
  getFirstHusbandForMother: (motherId: string) => string | null;
  refreshData: () => Promise<void>;
}

export function useFamilyMemberDropdowns(): FamilyMemberDropdowns {
  const [allMembers, setAllMembers] = useState<ProcessedMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const members = await fetchFamilyMembers();
      setAllMembers(members);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load family members";
      setError(errorMessage);
      console.error("Error fetching family members:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchData();
  }, []);

  // Memoized dropdown options
  const dropdownOptions = useMemo(() => {
    if (!allMembers.length) {
      return {
        fatherOptions: [],
        motherOptions: [],
        spouseOptions: [],
      };
    }

    // Get available fathers (all males except origin) - sorted alphabetically
    const availableFathers = getAvailableFathers(allMembers);
    const fatherOptions = availableFathers
      .map(memberToDropdownOption)
      .sort((a, b) => a.label.localeCompare(b.label));

    // Get available mothers (all females) - sorted alphabetically
    const availableMothers = getAvailableMothers(allMembers);
    const motherOptions = availableMothers
      .map(memberToDropdownOption)
      .sort((a, b) => a.label.localeCompare(b.label));

    // Get available spouses (unmarried females) - sorted alphabetically
    const availableSpouses = getAvailableSpouses(allMembers, true);
    const spouseOptions = availableSpouses
      .map(memberToDropdownOption)
      .sort((a, b) => a.label.localeCompare(b.label));

    return {
      fatherOptions,
      motherOptions,
      spouseOptions,
    };
  }, [allMembers]);

  // Helper function to get mother options for a specific father
  const getMotherOptionsForFather = (fatherId: string): DropdownOption[] => {
    if (!fatherId || !allMembers.length) return [];

    const spouses = getSpousesForFather(fatherId, allMembers);
    return spouses
      .map(memberToDropdownOption)
      .sort((a, b) => a.label.localeCompare(b.label));
  };

  // Helper function to get the first husband for a mother (for auto-selection)
  const getFirstHusbandForMother = (motherId: string): string | null => {
    if (!motherId || !allMembers.length) return null;

    const husbands = getHusbandsForMother(motherId, allMembers);
    return husbands.length > 0 ? husbands[0].unique_id : null;
  };

  return {
    isLoading,
    error,
    allMembers,
    ...dropdownOptions,
    getMotherOptionsForFather,
    getFirstHusbandForMother,
    refreshData: fetchData,
  };
}
