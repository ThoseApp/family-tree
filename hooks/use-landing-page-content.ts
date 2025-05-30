import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { LandingPageSection } from "@/lib/types";

interface UseLandingPageContentReturn {
  sections: Record<string, LandingPageSection>;
  loading: boolean;
  error: string | null;
}

export const useLandingPageContent = (): UseLandingPageContentReturn => {
  const [sections, setSections] = useState<Record<string, LandingPageSection>>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from("landing_page_sections")
          .select("*")
          .eq("is_published", true);

        if (fetchError) {
          throw fetchError;
        }

        // Convert array to object keyed by section_type
        const sectionsMap: Record<string, LandingPageSection> = {};
        data?.forEach((section) => {
          sectionsMap[section.section_type] = section;
        });

        setSections(sectionsMap);
      } catch (err: any) {
        console.error("Error fetching landing page content:", err);
        setError(err.message || "Failed to fetch content");

        // Fallback to default content if database fails
        setSections({
          hero: {
            section_type: "hero",
            title: "THE MOSURO FAMILY",
            subtitle: "The Story Behind the Mosuro Name",
            description:
              "Discover our rich family heritage, share precious moments, and stay connected with family members across the world.",
            image_url: "/images/landing/hero_section.webp",
            is_published: true,
          },
          gallery_preview: {
            section_type: "gallery_preview",
            title: "GALLERY",
            subtitle: "Remembering Our Golden Days",
            description: "A glimpse into our treasured family moments",
            is_published: true,
          },
          upcoming_events: {
            section_type: "upcoming_events",
            title: "UPCOMING EVENTS",
            description: "Stay updated with family celebrations and gatherings",
            image_url: "/images/landing/upcoming_events_section.webp",
            is_published: true,
          },
          history: {
            section_type: "history",
            title: "Every Person Makes His Own History",
            subtitle: "The Legacy of the Mosuro Family",
            description:
              "Explore the rich heritage and stories that shaped our family through generations.",
            image_url: "/images/landing/makes_history.webp",
            is_published: true,
          },
          family_members: {
            section_type: "family_members",
            title: "THE MOSURO FAMILY MEMBERS",
            description: "Meet the Family: The People Who Make Us Whole",
            is_published: true,
          },
          family_tree: {
            section_type: "family_tree",
            title: "Mosuro's Family Tree",
            subtitle: "Discover Your Roots",
            description:
              "The informality of family life is a blessed condition that allows us all to become our best while looking our worst.",
            image_url: "/images/landing/makes_history.webp",
            is_published: true,
          },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSections();
  }, []);

  return { sections, loading, error };
};
