import { cn } from "@/lib/utils";
import { LoaderCircle } from "lucide-react";
import React from "react";

interface LoadingIconProps {
  className?: string;
}

export const LoadingIcon = ({ className }: LoadingIconProps) => {
  return (
    <svg
      className={cn(" size-6 animate-spin text-primary", className)}
      viewBox="0 0 24 24"
    >
      <LoaderCircle />
    </svg>
  );
};
