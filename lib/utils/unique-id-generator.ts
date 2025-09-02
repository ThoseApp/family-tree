/**
 * Utility functions for generating unique IDs for family tree members
 * Based on the existing family tree structure and patterns
 */

import { ProcessedMember } from "@/lib/types";

/**
 * Extract numeric part from unique ID
 * Examples: "D01Z00002" -> 1, "S03Z00005" -> 3
 */
function extractNumericPart(uniqueId: string): number {
  const match = uniqueId.match(/^[DS](\d+)Z\d+$/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Generate next unique ID for a family member
 * @param gender - "Male" or "Female"
 * @param existingMembers - Array of existing family members
 * @returns Generated unique ID following the pattern D/S + numeric + Z + sequence
 */
export function generateUniqueId(
  gender: string,
  existingMembers: ProcessedMember[]
): string {
  // Determine prefix based on gender
  const prefix = gender?.toLowerCase() === "female" ? "S" : "D";

  // Filter existing members by prefix
  const membersWithSamePrefix = existingMembers.filter((member) =>
    member.unique_id.startsWith(prefix)
  );

  // Find the highest numeric part
  let highestNumeric = 0;
  membersWithSamePrefix.forEach((member) => {
    const numeric = extractNumericPart(member.unique_id);
    if (numeric > highestNumeric) {
      highestNumeric = numeric;
    }
  });

  // Generate next numeric part
  const nextNumeric = highestNumeric + 1;

  // Format with leading zeros (2 digits for the first part)
  const numericPart = nextNumeric.toString().padStart(2, "0");

  // Generate sequence part (5 digits, incremental)
  const sequencePart = (nextNumeric + 1000).toString().padStart(5, "0");

  // Return formatted unique ID
  return `${prefix}${numericPart}Z${sequencePart}`;
}

/**
 * Validate if a unique ID follows the correct pattern
 * @param uniqueId - ID to validate
 * @returns boolean indicating if the ID is valid
 */
export function validateUniqueId(uniqueId: string): boolean {
  const pattern = /^[DS]\d{2}Z\d{5}$/;
  return pattern.test(uniqueId);
}

/**
 * Get available male family members for Father dropdown
 * Excludes the origin male (D00Z00001)
 * @param allMembers - Array of all family members
 * @returns Array of male family members available as fathers
 */
export function getAvailableFathers(
  allMembers: ProcessedMember[]
): ProcessedMember[] {
  return allMembers.filter(
    (member) =>
      member.gender?.toLowerCase() === "male" &&
      member.unique_id !== "D00Z00001" // Exclude origin male
  );
}

/**
 * Get available spouses for a selected father
 * @param fatherId - Unique ID of the selected father
 * @param allMembers - Array of all family members
 * @returns Array of female family members who are spouses of the selected father
 */
export function getSpousesForFather(
  fatherId: string,
  allMembers: ProcessedMember[]
): ProcessedMember[] {
  // Find the father
  const father = allMembers.find((member) => member.unique_id === fatherId);
  if (!father) return [];

  // Get all females who have this father as spouse
  return allMembers.filter(
    (member) =>
      member.gender?.toLowerCase() === "female" &&
      member.spouse_uid === fatherId
  );
}

/**
 * Get available females for spouse dropdown
 * Excludes females who are already married to other men
 * @param allMembers - Array of all family members
 * @param excludeAlreadyMarried - Whether to exclude already married females
 * @returns Array of available female family members
 */
export function getAvailableSpouses(
  allMembers: ProcessedMember[],
  excludeAlreadyMarried: boolean = true
): ProcessedMember[] {
  return allMembers.filter((member) => {
    // Must be female
    if (member.gender?.toLowerCase() !== "female") return false;

    // If we should exclude already married females
    if (excludeAlreadyMarried) {
      // Check if this female is already someone's spouse
      const isAlreadyMarried = allMembers.some(
        (other) => other.spouse_uid === member.unique_id
      );
      if (isAlreadyMarried) return false;
    }

    return true;
  });
}

/**
 * Get husbands for a selected mother (for auto-selection)
 * @param motherId - Unique ID of the selected mother
 * @param allMembers - Array of all family members
 * @returns Array of male family members who are husbands of the selected mother
 */
export function getHusbandsForMother(
  motherId: string,
  allMembers: ProcessedMember[]
): ProcessedMember[] {
  // Find males who have this mother as spouse
  return allMembers.filter(
    (member) =>
      member.gender?.toLowerCase() === "male" && member.spouse_uid === motherId
  );
}

/**
 * Get all available mothers (female family members)
 * @param allMembers - Array of all family members
 * @returns Array of female family members available as mothers
 */
export function getAvailableMothers(
  allMembers: ProcessedMember[]
): ProcessedMember[] {
  return allMembers.filter(
    (member) => member.gender?.toLowerCase() === "female"
  );
}

/**
 * Convert ProcessedMember to dropdown option format
 * @param member - ProcessedMember to convert
 * @returns Object with value (unique_id) and label (display name)
 */
export function memberToDropdownOption(member: ProcessedMember): {
  value: string;
  label: string;
} {
  const fullName = `${member.first_name} ${member.last_name}`.trim();
  const lifeStatus = member.life_status === "Deceased" ? " (Deceased)" : "";

  return {
    value: member.unique_id,
    label: `${fullName}${lifeStatus}`,
  };
}
