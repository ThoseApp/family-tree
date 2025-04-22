import GalleryGrid from "@/components/gallery";
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import FrameWrapper from "@/components/wrappers/frame-wrapper";
import { galleryImages } from "@/lib/constants/landing";
import { MoveRight } from "lucide-react";
import React from "react";

const GalleryPage = () => {
  return (
    <div className="pb-20">
      {/* HEADER SECTION */}
      <PageHeader
        title="Cherished Family Moments"
        description="A collection of treasured memories, from celebrations to everyday joys. Relive the moments that bring us closer."
        searchBar
      />

      {/* GALLERY GRID */}
      <GalleryGrid images={galleryImages} />
    </div>
  );
};

export default GalleryPage;
