import React from "react";
import { Button } from "./ui/button";
import { ArrowLeft, ChevronLeft, MoveLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description: string;
}

const PageHeader = ({ title, description }: PageHeaderProps) => {
  return (
    <div className="text-center  space-y-6 py-8 lg:py-12 flex items-center">
      {/* BACK BUTTON */}
      <Button
        variant="ghost"
        size="icon"
        className="flex-shrink-0 rounded-full"
        asChild
      >
        <ChevronLeft className="size-24 cursor-pointer" />
      </Button>

      <div className="flex-1 w-full flex flex-col items-center gap-y-4 text-center">
        <h2 className="text-xl md:text-2xl font-semibold ">{title}</h2>
        <p className=" tracking-wider lg:max-w-[40vw]">{description}</p>
      </div>
    </div>
  );
};

export default PageHeader;
