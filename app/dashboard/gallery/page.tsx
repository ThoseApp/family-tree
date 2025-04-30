import { Button } from "@/components/ui/button";
import { AlignJustify, Download, LayoutGrid, Plus } from "lucide-react";
import React from "react";
import GalleryTable from "@/components/tables/gallery";
import { dummyGallery } from "@/lib/constants/dashbaord";

const Page = () => {
  return (
    <div className="flex flex-col gap-y-8 lg:gap-y-12">
      {/* HEADER SECTION */}
      <div className="flex md:items-center md:flex-row flex-col md: justify-between gap-y-4">
        <h1 className="text-2xl font-semibold">Manage Family Gallery</h1>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="rounded-full">
              <AlignJustify className="size-5 " />
            </Button>

            <Button variant="outline" size="icon" className="rounded-full">
              <LayoutGrid className="size-5 " />
            </Button>
          </div>
          <Button variant="outline" className="rounded-full">
            <Download className="size-5 " />
            Import from Web
          </Button>

          <Button className="bg-foreground text-background rounded-full hover:bg-foreground/80">
            <Plus className="size-5" />
            Upload File
          </Button>
        </div>
      </div>

      <GalleryTable data={dummyGallery} />
    </div>
  );
};

export default Page;
