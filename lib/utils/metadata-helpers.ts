/**
 * Utility functions for handling metadata across the application
 */

import { Metadata } from "next";
import {
  DEFAULT_METADATA,
  generatePageMetadata,
} from "@/lib/constants/metadata";

/**
 * Generate metadata for dynamic routes like profile pages
 */
export function generateDynamicMetadata(
  baseKey: keyof typeof import("@/lib/constants/metadata").PAGE_METADATA,
  dynamicTitle: string,
  dynamicDescription?: string,
  customKeywords?: string[]
): Metadata {
  return generatePageMetadata(baseKey, {
    title: dynamicTitle,
    description: dynamicDescription,
    keywords: customKeywords,
  });
}

/**
 * Generate structured data for family member profiles
 */
export function generatePersonStructuredData(member: {
  name: string;
  image?: string;
  description?: string;
  birthDate?: string;
  familyName?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: member.name,
    familyName: member.familyName || "Mosuro",
    image: member.image,
    description: member.description,
    birthDate: member.birthDate,
    memberOf: {
      "@type": "Organization",
      name: "Mosuro Family",
      url: DEFAULT_METADATA.siteUrl,
    },
  };
}

/**
 * Generate structured data for family events
 */
export function generateEventStructuredData(event: {
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.name,
    description: event.description,
    startDate: event.startDate,
    endDate: event.endDate,
    location: event.location
      ? {
          "@type": "Place",
          name: event.location,
        }
      : undefined,
    image: event.image,
    organizer: {
      "@type": "Organization",
      name: "Mosuro Family",
      url: DEFAULT_METADATA.siteUrl,
    },
  };
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbStructuredData(
  breadcrumbs: Array<{
    name: string;
    url: string;
  }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((breadcrumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: breadcrumb.name,
      item: breadcrumb.url,
    })),
  };
}

/**
 * Generate organization structured data for the family
 */
export function generateFamilyOrganizationStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Mosuro Family",
    url: DEFAULT_METADATA.siteUrl,
    description: DEFAULT_METADATA.description,
    logo: `${DEFAULT_METADATA.siteUrl}/images/logo.png`,
    sameAs: [
      // Add social media links if available
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Family Relations",
      email: "contact@mosuro-family.com", // Update with actual email
    },
  };
}
