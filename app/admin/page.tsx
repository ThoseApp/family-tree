import DashboardOverviewCard from "@/components/cards/dashboard-overview-card";
import UpcomingEventCard from "@/components/cards/upcoming-event-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { dummyProfileImage } from "@/lib/constants";
import {
  dummyNewAlbumCreation,
  dummyUpcomingEvents,
} from "@/lib/constants/dashbaord";
import { cn } from "@/lib/utils";
import Image from "next/image";
import React from "react";

const DashboardPage = () => {
  return (
    <div className="flex flex-col  gap-y-8 lg:gap-y-12">
      <DashboardOverviewCard
        imageSrc={dummyProfileImage}
        title="Grandma Beth’s 80th Birthday Celebration "
        date="May 12, 2025, 4:00 PM -6:00 PM"
        description="Grandma’s House, 123 Family Lane, Lagos."
        routePath="/family-tree"
      />

      {/* UPCOMING EVENTS */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dummyUpcomingEvents.map((event, index) => (
              <UpcomingEventCard
                key={index}
                imageSrc={event.imageUrl}
                name={event.name}
                description={event.description}
                date={event.date}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* NEW ALBUM CREATION */}
      <Card>
        <CardHeader>
          <CardTitle>New Album Creation</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* NEW FAMILY MEMBER ADDED */}
      <Card>
        <CardHeader>
          <CardTitle>New Family Member Added</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6 bg-border/30 rounded-xl">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="relative h-[30vh] bg-border w-full  rounded-xl"
              >
                <Image
                  src={dummyProfileImage}
                  alt="Family Member"
                  fill
                  className="object-cover rounded-xl"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
