import EventCard from "@/components/cards/event-card";
import PageHeader from "@/components/page-header";
import { dummyEvents } from "@/lib/constants/landing";
import React from "react";

const EventsPage = () => {
  return (
    <div className="pb-20">
      <PageHeader
        title="Upcoming Events"
        description="Join us for upcoming family events, gatherings, celebrations, and milestones that bring us closer together!"
        searchBar
      />

      <div className="flex flex-col gap-y-8 lg:gap-y-12">
        <div className="flex flex-col gap-y-4">
          <h2 className="text-2xl font-semibold">Birthdays</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-8">
            {dummyEvents.birthdays.map((event, index) => (
              <EventCard key={index} {...event} />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-y-4">
          <h2 className="text-2xl font-semibold">Anniversaries</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-8">
            {dummyEvents.anniversary.map((event, index) => (
              <EventCard key={index} {...event} />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-y-4">
          <h2 className="text-2xl font-semibold">Reunions</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-8">
            {dummyEvents.reunions.map((event, index) => (
              <EventCard key={index} {...event} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsPage;
