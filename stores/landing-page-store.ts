import { create } from "zustand";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { LandingPageSection, LandingPageContent } from "@/lib/types";

interface LandingPageState {
  sections: LandingPageSection[];
  loading: boolean;
  error: string | null;
  hasChanges: boolean;
}

interface LandingPageActions {
  fetchSections: () => Promise<void>;
  updateSection: (
    sectionType: string,
    updates: Partial<LandingPageSection>
  ) => Promise<void>;
  saveDraft: () => Promise<void>;
  publishChanges: () => Promise<void>;
  resetChanges: () => void;
  setHasChanges: (hasChanges: boolean) => void;
}

const defaultSections: LandingPageSection[] = [
  {
    section_type: "hero",
    title: "Welcome to the Mosuro Family",
    subtitle: "Connecting generations, preserving memories",
    description:
      "Discover our rich family heritage, share precious moments, and stay connected with family members across the world.",
    image_url: "/images/landing/hero_section.webp",
    is_published: true,
  },
  {
    section_type: "gallery_preview",
    title: "GALLERY",
    subtitle: "Remembering Our Golden Days",
    description: "A glimpse into our treasured family moments",
    is_published: true,
  },
  {
    section_type: "upcoming_events",
    title: "UPCOMING EVENTS",
    description: "Stay updated with family celebrations and gatherings",
    image_url: "/images/landing/upcoming_events_section.webp",
    is_published: true,
  },
  {
    section_type: "history",
    title: "Our Family History",
    subtitle: "The Legacy of the Mosuro Family",
    description:
      "Explore the rich heritage and stories that shaped our family through generations.",
    image_url: "/images/landing/makes_history.webp",
    is_published: true,
  },
  {
    section_type: "family_members",
    title: "The Mosuro Family",
    description: "Get to know the amazing individuals that make up our family",
    is_published: true,
  },
  {
    section_type: "family_tree",
    title: "Family Tree",
    subtitle: "Discover Your Roots",
    description:
      "Explore the connections and relationships that bind our family together across generations.",
    image_url: "/images/landing/family-tree-placeholder.jpg",
    is_published: true,
  },
];

const initialState: LandingPageState = {
  sections: [],
  loading: false,
  error: null,
  hasChanges: false,
};

export const useLandingPageStore = create<
  LandingPageState & LandingPageActions
>((set, get) => ({
  ...initialState,

  fetchSections: async () => {
    set({ loading: true, error: null });

    try {
      // First check if we have any sections in the database
      const { data: existingSections, error: fetchError } = await supabase
        .from("landing_page_sections")
        .select("*")
        .order("section_type");

      if (fetchError) throw fetchError;

      // If no sections exist, create default sections
      if (!existingSections || existingSections.length === 0) {
        const { error: insertError } = await supabase
          .from("landing_page_sections")
          .insert(defaultSections);

        if (insertError) throw insertError;

        set({ sections: defaultSections, loading: false });
      } else {
        set({ sections: existingSections, loading: false });
      }
    } catch (err: any) {
      console.error("Error fetching landing page sections:", err);

      // If database error, use default sections
      set({
        sections: defaultSections,
        error: err.message || "Failed to fetch sections",
        loading: false,
      });
    }
  },

  updateSection: async (sectionType, updates) => {
    set({ loading: true, error: null });

    try {
      const currentSections = get().sections;
      const sectionIndex = currentSections.findIndex(
        (s) => s.section_type === sectionType
      );

      if (sectionIndex === -1) {
        throw new Error(`Section ${sectionType} not found`);
      }

      const updatedSection = {
        ...currentSections[sectionIndex],
        ...updates,
        updated_at: new Date().toISOString(),
      };

      // Update in database
      const { error } = await supabase
        .from("landing_page_sections")
        .update(updatedSection)
        .eq("section_type", sectionType);

      if (error) throw error;

      // Update local state
      const updatedSections = [...currentSections];
      updatedSections[sectionIndex] = updatedSection;

      set({
        sections: updatedSections,
        loading: false,
        hasChanges: true,
      });

      toast.success("Section updated successfully!");
    } catch (err: any) {
      console.error("Error updating section:", err);
      set({
        error: err.message || "Failed to update section",
        loading: false,
      });
      toast.error("Failed to update section");
    }
  },

  saveDraft: async () => {
    set({ loading: true, error: null });

    try {
      const sections = get().sections;

      // Update all sections as drafts (not published)
      const draftSections = sections.map((section) => ({
        ...section,
        is_published: false,
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from("landing_page_sections")
        .upsert(draftSections);

      if (error) throw error;

      set({
        sections: draftSections,
        loading: false,
        hasChanges: false,
      });

      toast.success("Draft saved successfully!");
    } catch (err: any) {
      console.error("Error saving draft:", err);
      set({
        error: err.message || "Failed to save draft",
        loading: false,
      });
      toast.error("Failed to save draft");
    }
  },

  publishChanges: async () => {
    set({ loading: true, error: null });

    try {
      const sections = get().sections;

      // Update all sections as published
      const publishedSections = sections.map((section) => ({
        ...section,
        is_published: true,
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from("landing_page_sections")
        .upsert(publishedSections);

      if (error) throw error;

      set({
        sections: publishedSections,
        loading: false,
        hasChanges: false,
      });

      toast.success("Changes published successfully!");
    } catch (err: any) {
      console.error("Error publishing changes:", err);
      set({
        error: err.message || "Failed to publish changes",
        loading: false,
      });
      toast.error("Failed to publish changes");
    }
  },

  resetChanges: () => {
    set({ hasChanges: false });
  },

  setHasChanges: (hasChanges) => {
    set({ hasChanges });
  },
}));
