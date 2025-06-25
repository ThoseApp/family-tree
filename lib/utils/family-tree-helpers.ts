import { ProcessedMember, FamilyMember } from "@/lib/types";
import { supabase } from "@/lib/supabase/client";

/**
 * Convert ProcessedMember (database format) to FamilyMember (UI format)
 */
export function processedMemberToFamilyMember(
  processed: ProcessedMember
): FamilyMember {
  return {
    id: processed.unique_id,
    name: `${processed.first_name} ${processed.last_name}`.trim(),
    gender: processed.gender,
    description: processed.marital_status || "Family member",
    imageSrc: processed.picture_link || "/images/default-profile.png", // fallback image
    birthDate: processed.date_of_birth || "",
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
  // Parse names
  const nameParts = familyMember.name.split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  const fatherParts = familyMember.fatherName?.split(" ") || [];
  const fatherFirstName = fatherParts[0] || "";
  const fatherLastName = fatherParts.slice(1).join(" ") || "";

  const motherParts = familyMember.motherName?.split(" ") || [];
  const motherFirstName = motherParts[0] || "";
  const motherLastName = motherParts.slice(1).join(" ") || "";

  const spouseParts = familyMember.spouseName?.split(" ") || [];
  const spouseFirstName = spouseParts[0] || "";
  const spouseLastName = spouseParts.slice(1).join(" ") || "";

  return {
    unique_id: `FM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Generate unique ID
    picture_link: familyMember.imageSrc,
    gender: familyMember.gender || "",
    first_name: firstName,
    last_name: lastName,
    fathers_first_name: fatherFirstName,
    fathers_last_name: fatherLastName,
    mothers_first_name: motherFirstName,
    mothers_last_name: motherLastName,
    order_of_birth: familyMember.orderOfBirth || null,
    order_of_marriage: familyMember.orderOfMarriage || null,
    marital_status: familyMember.description || "",
    spouses_first_name: spouseFirstName,
    spouses_last_name: spouseLastName,
    date_of_birth: familyMember.birthDate || null,
  };
}

/**
 * Fetch all family members from the family-tree table
 */
export async function fetchFamilyMembers(): Promise<ProcessedMember[]> {
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
    processedUpdates.first_name = nameParts[0] || "";
    processedUpdates.last_name = nameParts.slice(1).join(" ") || "";
  }

  if (updates.gender !== undefined) {
    processedUpdates.gender = updates.gender;
  }

  if (updates.description !== undefined) {
    processedUpdates.marital_status = updates.description;
  }

  if (updates.imageSrc !== undefined) {
    processedUpdates.picture_link = updates.imageSrc;
  }

  if (updates.birthDate !== undefined) {
    processedUpdates.date_of_birth = updates.birthDate;
  }

  if (updates.fatherName !== undefined) {
    const fatherParts = updates.fatherName?.split(" ") || [];
    processedUpdates.fathers_first_name = fatherParts[0] || "";
    processedUpdates.fathers_last_name = fatherParts.slice(1).join(" ") || "";
  }

  if (updates.motherName !== undefined) {
    const motherParts = updates.motherName?.split(" ") || [];
    processedUpdates.mothers_first_name = motherParts[0] || "";
    processedUpdates.mothers_last_name = motherParts.slice(1).join(" ") || "";
  }

  if (updates.spouseName !== undefined) {
    const spouseParts = updates.spouseName?.split(" ") || [];
    processedUpdates.spouses_first_name = spouseParts[0] || "";
    processedUpdates.spouses_last_name = spouseParts.slice(1).join(" ") || "";
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
