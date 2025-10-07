"use client";

import { useEffect } from "react";
import { DEFAULT_METADATA } from "@/lib/constants/metadata";

interface ClientMetadataProps {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  noIndex?: boolean;
}

/**
 * Client-side metadata component for pages that must use "use client"
 * This component should be used in client components that need custom metadata
 */
export default function ClientMetadata({
  title,
  description,
  keywords = [],
  ogImage,
  noIndex = false,
}: ClientMetadataProps) {
  const fullTitle = title || DEFAULT_METADATA.title;
  const fullDescription = description || DEFAULT_METADATA.description;
  const fullKeywords = [...DEFAULT_METADATA.keywords, ...keywords].join(", ");
  const fullOgImage = ogImage || DEFAULT_METADATA.ogImage;
  const siteUrl = DEFAULT_METADATA.siteUrl;

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Update meta tags
    const updateMetaTag = (
      name: string,
      content: string,
      property?: boolean
    ) => {
      const selector = property
        ? `meta[property="${name}"]`
        : `meta[name="${name}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;

      if (!meta) {
        meta = document.createElement("meta");
        if (property) {
          meta.setAttribute("property", name);
        } else {
          meta.setAttribute("name", name);
        }
        document.head.appendChild(meta);
      }

      meta.setAttribute("content", content);
    };

    // Update basic meta tags
    updateMetaTag("description", fullDescription);
    updateMetaTag("keywords", fullKeywords);
    updateMetaTag("author", DEFAULT_METADATA.author);

    if (noIndex) {
      updateMetaTag("robots", "noindex, nofollow");
    }

    // Update Open Graph tags
    updateMetaTag("og:title", fullTitle, true);
    updateMetaTag("og:description", fullDescription, true);
    updateMetaTag("og:image", fullOgImage, true);
    updateMetaTag("og:url", siteUrl, true);
    updateMetaTag("og:site_name", DEFAULT_METADATA.siteName, true);
    updateMetaTag("og:type", "website", true);
    updateMetaTag("og:locale", "en_US", true);

    // Update Twitter tags
    updateMetaTag("twitter:card", DEFAULT_METADATA.twitterCard);
    updateMetaTag("twitter:title", fullTitle);
    updateMetaTag("twitter:description", fullDescription);
    updateMetaTag("twitter:image", fullOgImage);
    updateMetaTag("twitter:creator", "@mosuro_family");

    // Update canonical link
    let canonical = document.querySelector(
      'link[rel="canonical"]'
    ) as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", siteUrl);
  }, [fullTitle, fullDescription, fullKeywords, fullOgImage, siteUrl, noIndex]);

  return null;
}
