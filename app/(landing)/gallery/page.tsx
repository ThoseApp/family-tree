import GalleryGrid from "@/components/gallery";
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import FrameWrapper from "@/components/wrappers/frame-wrapper";
import { galleryImages } from "@/lib/constants/landing";
import { MoveRight } from "lucide-react";
import React from "react";

const GalleryPage = () => {
  return (
    <div className="">
      {/* HEADER SECTION */}
      <PageHeader
        title="Cherished Family Moments"
        description="A collection of treasured memories, from celebrations to everyday joys. Relive the moments that bring us closer."
      />

      {/* GALLERY GRID */}
      <GalleryGrid images={galleryImages} />

      <div className="flex justify-center">
        <Button
          variant="alternative"
          size="lg"
          className="rounded-full items-center"
        >
          View Details
          <MoveRight className="size-5 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default GalleryPage;
