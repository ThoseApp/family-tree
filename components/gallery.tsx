"use client";

import { GalleryImage as GalleryImageType } from "@/lib/types";
import { cn } from "@/lib/utils";
import Image from "next/image";
import React, { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ImagePreviewModal } from "@/components/modals/image-preview-modal";

export interface GalleryProps {
  images: GalleryImageType[];
  onImageClick?: (image: any) => void;
}

interface GalleryImageProps {
  url: string;
  date: string;
  title: string;
  index?: number;
  id?: string;
  onClick?: (image: any) => void;
}

export const GalleryImage = ({
  url,
  date,
  title,
  index,
  id,
  onClick,
}: GalleryImageProps) => {
  const handleClick = () => {
    if (onClick) {
      onClick({ url, date, title, id });
    }
  };

  return (
    <Card
      className={cn(
        "overflow-hidden cursor-pointer hover:opacity-90 transition-opacity flex flex-col",
        index === 2 && "col-span-2",
        index === 8 && "col-span-2"
      )}
      onClick={handleClick}
    >
      <CardContent className="aspect-[3/4] p-0">
        <div className="relative h-full w-full">
          <Image
            src={url}
            alt={title}
            fill
            className="object-cover w-full h-full rounded-t-md"
          />
        </div>
      </CardContent>
      <div className="p-2 text-center">
        <h3 className="text-sm font-medium truncate">{title}</h3>
      </div>
    </Card>
  );
};

const formatDate = (date: string) => {
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });
};

interface SelectedImageData {
  url: string;
  date: string;
  title: string;
  id?: string;
}

const GalleryGrid = ({ images, onImageClick }: GalleryProps) => {
  console.log(images);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<SelectedImageData | null>(
    null
  );

  const handleImagePreviewOpen = (image: SelectedImageData) => {
    setSelectedImage(image);
    setIsModalOpen(true);
    if (onImageClick) {
      onImageClick(image);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  const handleModalConfirm = () => {
    handleModalClose();
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-6">
        {images.slice(0, 9).map((image, index) => (
          <GalleryImage
            key={image.id || index}
            index={index}
            url={image.url}
            date={image.uploaded_at || image.created_at || ""}
            title={image.caption || image.file_name || "Untitled"}
            id={image.id}
            onClick={onImageClick}
          />
        ))}
      </div>
    </>
  );
};

export default GalleryGrid;
