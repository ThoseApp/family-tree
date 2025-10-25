import { supabase } from "@/lib/supabase/client";

interface SyncVerificationResult {
  isTableExists: boolean;
  sectionsCount: number;
  publishedSectionsCount: number;
  missingDefaultSections: string[];
  errors: string[];
}

const expectedSections = [
  "hero",
  "gallery_preview",
  "upcoming_events",
  "history",
  "family_members",
  "family_tree",
];

export async function verifyLandingPageSync(): Promise<SyncVerificationResult> {
  const result: SyncVerificationResult = {
    isTableExists: false,
    sectionsCount: 0,
    publishedSectionsCount: 0,
    missingDefaultSections: [],
    errors: [],
  };

  try {
    // Check if table exists and get sections
    const { data: sections, error } = await supabase
      .from("landing_page_sections")
      .select("*");

    if (error) {
      result.errors.push(`Database error: ${error.message}`);
      return result;
    }

    result.isTableExists = true;
    result.sectionsCount = sections?.length || 0;

    // Count published sections
    const publishedSections =
      sections?.filter((s: any) => s.is_published) || [];
    result.publishedSectionsCount = publishedSections.length;

    // Check for missing sections
    const existingSectionTypes =
      sections?.map((s: any) => s.section_type) || [];
    result.missingDefaultSections = expectedSections.filter(
      (sectionType) => !existingSectionTypes.includes(sectionType)
    );

    // Validate each section has required fields
    sections?.forEach((section: any) => {
      if (!section.title && section.section_type !== "gallery_preview") {
        result.errors.push(`Section ${section.section_type} is missing title`);
      }
    });
  } catch (err: any) {
    result.errors.push(`Verification failed: ${err.message}`);
  }

  return result;
}

// Console logging function for manual testing
export function logSyncStatus(result: SyncVerificationResult) {
  console.log("\n=== Landing Page Sync Verification ===");
  console.log(`✅ Table exists: ${result.isTableExists}`);
  console.log(`📊 Total sections: ${result.sectionsCount}`);
  console.log(`🌐 Published sections: ${result.publishedSectionsCount}`);

  if (result.missingDefaultSections.length > 0) {
    console.log(
      `❌ Missing sections: ${result.missingDefaultSections.join(", ")}`
    );
  } else {
    console.log("✅ All expected sections present");
  }

  if (result.errors.length > 0) {
    console.log("\n❌ Errors:");
    result.errors.forEach((error) => console.log(`  - ${error}`));
  } else {
    console.log("✅ No errors detected");
  }

  const isHealthy =
    result.isTableExists &&
    result.sectionsCount >= expectedSections.length &&
    result.missingDefaultSections.length === 0 &&
    result.errors.length === 0;

  console.log(
    `\n🏥 Overall Health: ${isHealthy ? "✅ HEALTHY" : "❌ NEEDS ATTENTION"}`
  );
  console.log("=====================================\n");
}
