"use client";

import React from "react";
import { Button } from "./ui/button";
import { ArrowLeft, ChevronLeft, Filter, MoveLeft, Search } from "lucide-react";
import { Input } from "./ui/input";
import { useRouter } from "next/navigation";
interface PageHeaderProps {
  title: string;
  description?: string;
  searchBar?: boolean;
}

const PageHeader = ({ title, description, searchBar }: PageHeaderProps) => {
  const router = useRouter();
  return (
    <div className="flex-col flex gap-y-5 py-8 lg:py-12 w-full">
      <div className="text-center flex items-center">
        {/* BACK BUTTON */}
        <Button
          variant="ghost"
          size="icon"
          className="flex-shrink-0 rounded-full"
          onClick={() => router.back()}
          asChild
        >
          <ChevronLeft className="size-24 cursor-pointer" />
        </Button>

        <div className="flex-1 w-full flex flex-col items-center gap-y-4 text-center">
          <h2 className="text-xl md:text-2xl font-semibold ">{title}</h2>
          {description && (
            <p className=" tracking-wider lg:max-w-[40vw]">{description}</p>
          )}
        </div>
      </div>
      {/* SEARCH BAR */}
      {searchBar && (
        <div className="flex items-center gap-4">
          <div className="flex-1 w-full  flex items-center justify-center">
            <div className="relative max-w-full w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Search"
                className="w-full pl-10 focus-visible:ring-offset-0 rounded-full h-12"
              />
            </div>
          </div>

          <Filter className="size-6" />
        </div>
      )}
    </div>
  );
};

export default PageHeader;
