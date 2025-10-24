import { ProcessedMember, FamilyMember } from "@/lib/types";
import { supabase } from "@/lib/supabase/client";
import { dummyProfileImage, dummyFemaleProfileImage } from "../constants";
import { LifeStatusEnum } from "../constants/enums";
import { isMockMode } from "@/lib/mock-data/initialize";
import { mockDataService } from "@/lib/mock-data/mock-service";

/**
 * Utility function to safely truncate strings to database field limits
 */
function truncateField(value: string, maxLength: number = 50): string {
  return value ? value.trim().slice(0, maxLength) : "";
}

/**
 * Convert ProcessedMember (database format) to FamilyMember (UI format)
 */
export function processedMemberToFamilyMember(
  processed: ProcessedMember
): FamilyMember {
  const placeholderImage =
    processed.gender?.toLowerCase() === "female"
      ? dummyFemaleProfileImage
      : dummyProfileImage;

  return {
    id: processed.unique_id,
    name: `${processed.first_name} ${processed.last_name}`.trim(),
    gender: processed.gender,
    unique_id: processed.unique_id,
    description: processed.marital_status || "Family member",
    imageSrc: processed.picture_link || placeholderImage, // fallback image
    birthDate: processed.date_of_birth || "",
    lifeStatus: processed.life_status,
    emailAddress: processed.email_address,
    fatherName:
      processed.fathers_first_name && processed.fathers_last_name
        ? `${processed.fathers_first_name} ${processed.fathers_last_name}`.trim()
        : undefined,
    motherName:
      processed.mothers_first_name && processed.mothers_last_name
        ? `${processed.mothers_first_name} ${processed.mothers_last_name}`.trim()
        : undefined,
    orderOfBirth: processed.order_of_birth || undefined,
    spouseName:
      processed.spouses_first_name && processed.spouses_last_name
        ? `${processed.spouses_first_name} ${processed.spouses_last_name}`.trim()
        : undefined,
    orderOfMarriage: processed.order_of_marriage || undefined,
  };
}

/**
 * Convert FamilyMember (UI format) to ProcessedMember (database format)
 */
export function familyMemberToProcessedMember(
  familyMember: Omit<FamilyMember, "id">
): Omit<ProcessedMember, "id"> {
  // Parse names with length validation
  const nameParts = familyMember.name.split(" ");
  const firstName = truncateField(nameParts[0] || "");
  const lastName = truncateField(nameParts.slice(1).join(" ") || "");

  const fatherParts = familyMember.fatherName?.split(" ") || [];
  const fatherFirstName = truncateField(fatherParts[0] || "");
  const fatherLastName = truncateField(fatherParts.slice(1).join(" ") || "");

  const motherParts = familyMember.motherName?.split(" ") || [];
  const motherFirstName = truncateField(motherParts[0] || "");
  const motherLastName = truncateField(motherParts.slice(1).join(" ") || "");

  const spouseParts = familyMember.spouseName?.split(" ") || [];
  const spouseFirstName = truncateField(spouseParts[0] || "");
  const spouseLastName = truncateField(spouseParts.slice(1).join(" ") || "");

  return {
    unique_id: `FM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Generate unique ID
    picture_link: familyMember.imageSrc,
    gender: truncateField(familyMember.gender || ""),
    first_name: firstName,
    last_name: lastName,
    fathers_first_name: fatherFirstName,
    fathers_last_name: fatherLastName,
    fathers_uid: undefined, // Will be populated separately when relationships are established
    mothers_first_name: motherFirstName,
    mothers_last_name: motherLastName,
    mothers_uid: undefined, // Will be populated separately when relationships are established
    order_of_birth: familyMember.orderOfBirth || null,
    order_of_marriage: familyMember.orderOfMarriage || null,
    marital_status: truncateField(familyMember.description || "", 100), // Assuming longer field for description
    spouses_first_name: spouseFirstName,
    spouses_last_name: spouseLastName,
    spouse_uid: undefined, // Will be populated separately when relationships are established
    date_of_birth:
      familyMember.birthDate && familyMember.birthDate.trim() !== ""
        ? familyMember.birthDate
        : null,
    life_status: familyMember.lifeStatus || LifeStatusEnum.accountEligible,
    email_address: familyMember.emailAddress || undefined,
  };
}

/**
 * Fetch all family members from the family-tree table
 */
export async function fetchFamilyMembers(): Promise<ProcessedMember[]> {
  // Handle mock mode
  if (isMockMode()) {
    console.log("[Mock API] Fetching family members from mock data");

    try {
      await mockDataService.initialize();
      const members = mockDataService.query(
        "family-tree",
        [],
        [{ column: "created_at", ascending: false }]
      );

      console.log(`[Mock API] Found ${members.length} family members`);
      return members as ProcessedMember[];
    } catch (error: any) {
      console.error("[Mock API] Error fetching family members:", error);
      throw new Error(`Failed to fetch family members: ${error.message}`);
    }
  }

  // Real Supabase mode
  const { data, error } = await supabase
    .from("family-tree")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch family members: ${error.message}`);
  }

  return data as ProcessedMember[];
}

/**
 * Search family members by first or last name using Supabase (server-side filtering)
 */
export async function searchFamilyMembersByName(
  query: string
): Promise<ProcessedMember[]> {
  const normalized = (query || "").trim();
  if (normalized.length === 0) {
    return [];
  }

  // Escape % and _ for ilike pattern
  const escaped = normalized.replace(/[\%_]/g, (ch) => `\\${ch}`);
  const pattern = `%${escaped}%`;

  const { data, error } = await supabase
    .from("family-tree")
    .select("*")
    .or(`first_name.ilike.${pattern},last_name.ilike.${pattern}`)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to search family members: ${error.message}`);
  }

  return (data || []) as ProcessedMember[];
}

/**
 * Add a new family member to the family-tree table
 */
export async function addFamilyMember(
  familyMember: Omit<FamilyMember, "id">
): Promise<ProcessedMember> {
  const processedMember = familyMemberToProcessedMember(familyMember);

  const { data, error } = await supabase
    .from("family-tree")
    .insert([processedMember])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to add family member: ${error.message}`);
  }

  return data as ProcessedMember;
}

/**
 * Update a family member in the family-tree table
 */
export async function updateFamilyMember(
  uniqueId: string,
  updates: Partial<FamilyMember>
): Promise<ProcessedMember> {
  // Convert UI updates to database format
  const processedUpdates: Partial<ProcessedMember> = {};

  if (updates.name) {
    const nameParts = updates.name.split(" ");
    processedUpdates.first_name = truncateField(nameParts[0] || "");
    processedUpdates.last_name = truncateField(
      nameParts.slice(1).join(" ") || ""
    );
  }

  if (updates.gender !== undefined) {
    processedUpdates.gender = truncateField(updates.gender);
  }

  if (updates.description !== undefined) {
    processedUpdates.marital_status = truncateField(updates.description, 100); // Assuming longer field for description
  }

  if (updates.imageSrc !== undefined) {
    processedUpdates.picture_link = updates.imageSrc;
  }

  if (updates.birthDate !== undefined) {
    // Convert empty string to null for database compatibility
    processedUpdates.date_of_birth =
      updates.birthDate.trim() === "" ? null : updates.birthDate;
  }

  if (updates.fatherName !== undefined) {
    const fatherParts = updates.fatherName?.split(" ") || [];
    processedUpdates.fathers_first_name = truncateField(fatherParts[0] || "");
    processedUpdates.fathers_last_name = truncateField(
      fatherParts.slice(1).join(" ") || ""
    );
  }

  if (updates.motherName !== undefined) {
    const motherParts = updates.motherName?.split(" ") || [];
    processedUpdates.mothers_first_name = truncateField(motherParts[0] || "");
    processedUpdates.mothers_last_name = truncateField(
      motherParts.slice(1).join(" ") || ""
    );
  }

  if (updates.spouseName !== undefined) {
    const spouseParts = updates.spouseName?.split(" ") || [];
    processedUpdates.spouses_first_name = truncateField(spouseParts[0] || "");
    processedUpdates.spouses_last_name = truncateField(
      spouseParts.slice(1).join(" ") || ""
    );
  }

  if (updates.orderOfBirth !== undefined) {
    processedUpdates.order_of_birth = updates.orderOfBirth;
  }

  if (updates.orderOfMarriage !== undefined) {
    processedUpdates.order_of_marriage = updates.orderOfMarriage;
  }

  const { data, error } = await supabase
    .from("family-tree")
    .update(processedUpdates)
    .eq("unique_id", uniqueId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update family member: ${error.message}`);
  }

  return data as ProcessedMember;
}

/**
 * Delete a family member from the family-tree table
 */
export async function deleteFamilyMember(uniqueId: string): Promise<void> {
  const { error } = await supabase
    .from("family-tree")
    .delete()
    .eq("unique_id", uniqueId);

  if (error) {
    throw new Error(`Failed to delete family member: ${error.message}`);
  }
}

/**
 * Fetch a family member's profile by their unique ID (slug).
 *
 * This function first checks for a detailed profile in the 'profiles' table.
 * If not found, it falls back to the basic information in the 'family-tree' table.
 *
 * @param {string} uniqueId - The unique ID of the family member, from the URL slug.
 * @returns {Promise<ProcessedMember | null>} - A promise that resolves to the member's data or null if not found.
 */
export async function fetchMemberProfile(
  uniqueId: string
): Promise<ProcessedMember | null> {
  // First, try to find a matching profile in the 'profiles' table
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("family_tree_uid", uniqueId)
    .single();

  if (profileError && profileError.code !== "PGRST116") {
    // 'PGRST116' means no rows found, which is not an actual error in this case.
    console.error("Error fetching from profiles:", profileError);
    // We can choose to throw or just fallback, for now, we fallback.
  }

  if (profileData) {
    // If a profile exists, we can augment it with any other necessary fields
    // For now, let's assume 'profiles' has a superset of the data we need.
    // We might need to map it to a 'ProcessedMember' like structure if they differ.
    // For this implementation, we assume the structure is compatible or preferred.
    // This part may need adjustment based on the actual 'profiles' table schema.
    return {
      unique_id: profileData.family_tree_uid,
      first_name: profileData.first_name,
      last_name: profileData.last_name,
      picture_link: profileData.image,
      gender: profileData.gender || "Not specified",
      date_of_birth: profileData.date_of_birth,
      marital_status: profileData.marital_status || "Not specified",
      // These fields might not be in 'profiles' and would be from the 'family-tree' if needed.
      fathers_first_name: "", // Placeholder
      fathers_last_name: "", // Placeholder
      mothers_first_name: "", // Placeholder
      mothers_last_name: "", // Placeholder
      spouses_first_name: "", // Placeholder
      spouses_last_name: "", // Placeholder
      order_of_birth: null,
      order_of_marriage: null,
      ...profileData, // include all other profile fields
    };
  }

  // If no profile was found, fall back to the 'family-tree' table
  const { data: familyTreeData, error: familyTreeError } = await supabase
    .from("family-tree")
    .select("*")
    .eq("unique_id", uniqueId)
    .single();

  if (familyTreeError) {
    if (familyTreeError.code !== "PGRST116") {
      console.error("Error fetching from family-tree:", familyTreeError);
    }
    // If no record is found in either table, return null.
    return null;
  }

  return familyTreeData as ProcessedMember;
}
