import { cn } from "@/lib/utils";
import Image from "next/image";
import React from "react";

interface ImageCardProps {
  imageSrc: string;
  alt: string;

  className: string;
  imageClassName?: string;
  priority?: boolean;
}

const ImageCard = ({
  imageSrc,
  alt,
  className,
  imageClassName,
  priority = false,
}: ImageCardProps) => {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <Image src={imageSrc} alt={alt} fill className="object-cover" />
    </div>
  );
};

export default ImageCard;
