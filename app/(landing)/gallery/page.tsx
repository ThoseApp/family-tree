"use client";

import ClientMetadata from "@/components/seo/client-metadata";
import GalleryGrid from "@/components/gallery";
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import FrameWrapper from "@/components/wrappers/frame-wrapper";
import { galleryImages } from "@/lib/constants/landing";
import { useGalleryStore } from "@/stores/gallery-store";
import { MoveRight } from "lucide-react";
import React, { useEffect } from "react";

const GalleryPage = () => {
  const { gallery, fetchGallery } = useGalleryStore();

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  return (
    <>
      <ClientMetadata
        title="Photo Gallery - Mosuro Family Memories"
        description="Browse through cherished Mosuro family photos and memories. Relive special moments and discover family history through pictures."
        keywords={[
          "family photos",
          "memories",
          "photo gallery",
          "family pictures",
        ]}
      />
      <div className="pb-20">
        {/* HEADER SECTION */}
        <PageHeader
          title="Cherished Family Moments"
          description="A collection of treasured memories, from celebrations to everyday joys. Relive the moments that bring us closer."
          searchBar
        />

        {/* GALLERY GRID */}
        <GalleryGrid gallery={gallery} />
      </div>
    </>
  );
};

export default GalleryPage;
