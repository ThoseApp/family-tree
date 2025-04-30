import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import React from "react";

const Page = () => {
  return (
    <div className="flex flex-col gap-y-8 lg:gap-y-12">
      {/* HEADER SECTION */}
      <div className="flex md:items-center md:flex-row flex-col md: justify-between gap-y-4">
        <h1 className="text-2xl font-semibold">Family History Records</h1>

        <div className="flex items-center gap-4">
          <Button className="bg-foreground text-background rounded-full hover:bg-foreground/80">
            <Plus className="size-5" />
            Add New Story
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Page;
