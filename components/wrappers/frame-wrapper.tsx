import { cn } from "@/lib/utils";
import React from "react";

interface FrameWrapperProps {
  children: React.ReactNode;
  className?: string;
}

const FrameWrapper = ({ children, className }: FrameWrapperProps) => {
  return (
    <div
      className={cn(
        "px-4 md:px-10 xl:px-16 flex flex-col gap-8 lg:gap-12 relative w-full h-full",
        className
      )}
    >
      {children}
    </div>
  );
};

export default FrameWrapper;
