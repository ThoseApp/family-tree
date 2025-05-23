"use client";

import DashboardOverviewCard from "@/components/cards/dashboard-overview-card";
import UpcomingEventCard from "@/components/cards/upcoming-event-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { dummyProfileImage } from "@/lib/constants";
import {
  dummyNewAlbumCreation,
  dummyUpcomingEvents,
} from "@/lib/constants/dashbaord";
import { cn, ensureDateAsObject } from "@/lib/utils";
import { useEventsStore } from "@/stores/events-store";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Event } from "@/lib/types";

// Helper function to convert event date to a Date object for sorting
const getSortableDate = (dateInput: any): Date => {
  if (typeof dateInput === "string") {
    // Handles "Month Day, Year" or "Month Day" (defaults to current year if year is omitted)
    return new Date(dateInput);
  } else if (
    dateInput &&
    typeof dateInput.month === "string" &&
    typeof dateInput.day === "string"
  ) {
    // Handles { month: "May", day: "12" }
    // new Date("May 12") defaults to the current year.
    return new Date(`${dateInput.month} ${dateInput.day}`);
  }
  // Fallback for unparseable dates; sorts them to the past.
  return new Date(0); // Corresponds to "Thu Jan 01 1970 ..."
};

// Helper function to format event date as a string (e.g., for DashboardOverviewCard)
const formatDateAsString = (dateInput: any): string => {
  if (typeof dateInput === "string") {
    return dateInput; // Assumes it's already in a displayable string format
  } else if (
    dateInput &&
    typeof dateInput.month === "string" &&
    typeof dateInput.day === "string"
  ) {
    return `${dateInput.month} ${dateInput.day}`; // e.g., "May 12"
  }
  return "Date not set"; // Fallback display string
};

// Helper function to ensure date is in { month: string; day: string } format (for UpcomingEventCard)

const DashboardPage = () => {
  const { fetchUpcomingEvents } = useEventsStore();
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const sortedUpcomingEvents = [...upcomingEvents].sort((a, b) => {
    return (
      getSortableDate(a.date).getTime() - getSortableDate(b.date).getTime()
    );
  });

  const latestUpcomingEvent =
    sortedUpcomingEvents.length > 0 ? sortedUpcomingEvents[0] : null;

  useEffect(() => {
    (async () => {
      const events = await fetchUpcomingEvents();
      setUpcomingEvents(events);
    })();
  }, [fetchUpcomingEvents]);

  return (
    <div className="flex flex-col  gap-y-8 lg:gap-y-12">
      <DashboardOverviewCard
        imageSrc={latestUpcomingEvent?.image || dummyProfileImage}
        title={latestUpcomingEvent?.name || "No Major Upcoming Event"}
        date={formatDateAsString(latestUpcomingEvent?.date)}
        description={
          latestUpcomingEvent?.description || "No description available."
        }
        routePath="/family-tree"
      />

      {/* UPCOMING EVENTS */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedUpcomingEvents.length > 0 ? (
              sortedUpcomingEvents.map((event, index) => (
                <UpcomingEventCard
                  key={index}
                  imageSrc={event.image || dummyProfileImage}
                  name={event.name}
                  description={event.description || "No description available."}
                  date={ensureDateAsObject(event.date)}
                />
              ))
            ) : (
              <p className="col-span-full text-center text-muted-foreground">
                No upcoming events scheduled at the moment.
              </p>
            )}
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
