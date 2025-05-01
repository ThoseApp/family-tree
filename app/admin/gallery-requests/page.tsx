import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { dummyGallery, dummyNewAlbumCreation } from "@/lib/constants/dashbaord";
import GalleryRequestsTable from "@/components/tables/gallery-requests";

const GalleryRequestsPage = () => {
  return (
    <div className="flex flex-col gap-y-8 lg:gap-y-12 ">
      {/* HEADER SECTION */}
      <div className="flex md:items-center md:flex-row flex-col md:justify-between gap-y-4">
        <h1 className="text-2xl font-semibold">Gallery Requests</h1>
      </div>

      {/* PENDING PHOTOS */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Photos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {dummyNewAlbumCreation.slice(0, 7).map((album, index) => (
                <div
                  key={index}
                  className={cn(
                    "relative h-[30vh] bg-border w-full  rounded-xl",

                    index === 5 && "col-span-3"
                  )}
                >
                  <Image
                    src={album.imageUrl}
                    alt={album.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>

            <GalleryRequestsTable data={dummyGallery} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GalleryRequestsPage;
