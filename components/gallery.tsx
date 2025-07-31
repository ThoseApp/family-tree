"use client";

import { GalleryType as GalleryGlobalType } from "@/lib/types";
import { cn } from "@/lib/utils";
import Image from "next/image";
import React, { useMemo, useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ImagePreviewModal } from "@/components/modals/image-preview-modal";
import { StatusBadge } from "@/components/ui/status-badge";

export interface GalleryProps {
  gallery: GalleryGlobalType[];
  onImageClick?: (image: any) => void;
}

interface GalleryImageProps {
  url: string;
  date: string;
  title: string;
  index?: number;
  id?: string;
  status?: "pending" | "approved" | "rejected";
  onClick?: (image: any) => void;
}

export const GalleryType = ({
  url,
  date,
  title,
  index,
  id,
  status,
  onClick,
}: GalleryImageProps) => {
  const handleClick = () => {
    if (onClick) {
      onClick({ url, date, title, id });
    }
  };

  const isImg = useMemo(() => {
    return (
      url.endsWith(".jpg") || url.endsWith(".png") || url.endsWith(".jpeg")
    );
  }, [url]);

  return (
    <Card
      className={cn(
        "overflow-hidden cursor-pointer hover:opacity-90 transition-opacity flex flex-col",
        index === 2 && "col-span-2",
        index === 8 && "col-span-2"
      )}
      onClick={handleClick}
    >
      <CardContent className=" p-0">
        <div className="relative h-[40dvh] w-full">
          <Image
            src={url}
            alt={title}
            fill
            className="object-cover w-full h-full rounded-t-md"
          />
          {status && status !== "approved" && (
            <div className="absolute top-2 right-2">
              <StatusBadge status={status} />
            </div>
          )}
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

const GalleryGrid = ({ gallery, onImageClick }: GalleryProps) => {
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
        {gallery.slice(0, 9).map((gallery, index) => (
          <GalleryType
            key={gallery.id || index}
            index={index}
            url={gallery.url}
            date={gallery.uploaded_at || gallery.created_at || ""}
            title={gallery.caption || gallery.file_name || "Untitled"}
            id={gallery.id}
            status={gallery.status as "pending" | "approved" | "rejected"}
            onClick={handleImagePreviewOpen}
          />
        ))}
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <ImagePreviewModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          imageUrl={selectedImage.url}
          imageName={selectedImage.title}
          onConfirm={handleModalConfirm}
          confirmButtonText="Close"
        />
      )}
    </>
  );
};

export default GalleryGrid;
