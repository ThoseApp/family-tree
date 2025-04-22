import { cn, formatDate } from "@/lib/utils";
import React from "react";

export interface GalleryProps {
  images: {
    url: string;
    date: string;
    title: string;
  }[];
}

interface GalleryImageProps {
  url: string;
  date: string;
  title: string;
  index: number;
}

const GalleryImage = ({ url, date, title, index }: GalleryImageProps) => {
  return (
    <div
      className={cn(
        "relative w-full h-full",
        index === 1 && "row-span-2",
        index === 2 && "col-span-2",
        index === 8 && "col-span-2"
      )}
    >
      <img src={url} alt={title} className="object-cover w-full h-full" />
      <div className="absolute bottom-0 bg-foreground/90 flex py-2 w-full">
        <div className="text-background text-xs font-normal  ">
          <div className="text-sm inline-block border-b border-background py-2 pl-6 pr-2 ">
            {formatDate(date)}
          </div>
          <h3 className=" pl-6 py-2 ">{title}</h3>
        </div>
      </div>
    </div>
  );
};

const GalleryGrid = ({ images }: { images: GalleryProps["images"] }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-8">
      {images.slice(0, 9).map((image, index) => (
        <GalleryImage
          key={index}
          index={index}
          url={image.url}
          date={image.date}
          title={image.title}
        />
      ))}
    </div>
  );
};

export default GalleryGrid;
