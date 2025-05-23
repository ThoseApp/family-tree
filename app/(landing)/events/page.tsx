"use client";

import EventCard from "@/components/cards/event-card";
import PageHeader from "@/components/page-header";
import { dummyProfileImage } from "@/lib/constants";
import { ensureDateAsObject } from "@/lib/utils";
import { dummyEvents } from "@/lib/constants/landing";
import { useEventsStore } from "@/stores/events-store";
import React, { useEffect, useMemo } from "react";

const EventsPage = () => {
  const { fetchEvents, events } = useEventsStore();

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const birthdays = useMemo(() => {
    return events.filter(
      (event) => event.category.toLowerCase() === "birthday"
    );
  }, [events]);

  const anniversaries = useMemo(() => {
    return events.filter(
      (event) => event.category.toLowerCase() === "anniversary"
    );
  }, [events]);

  const reunions = useMemo(() => {
    return events.filter((event) => event.category.toLowerCase() === "reunion");
  }, [events]);

  const weddings = useMemo(() => {
    return events.filter((event) => event.category.toLowerCase() === "wedding");
  }, [events]);

  return (
    <div className="pb-20">
      <PageHeader
        title="Upcoming Events"
        description="Join us for upcoming family events, gatherings, celebrations, and milestones that bring us closer together!"
        searchBar
      />

      <div className="flex flex-col gap-y-8 lg:gap-y-12">
        {/* BIRTHDAYS */}
        {birthdays.length > 0 && (
          <div className="flex flex-col gap-y-4">
            <h2 className="text-2xl font-semibold">Birthdays</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-8">
              {birthdays.map((event, index) => (
                <EventCard
                  key={index}
                  image={event.image || dummyProfileImage}
                  name={event.name}
                  description={event.description || "No description available."}
                  date={ensureDateAsObject(event.date)}
                />
              ))}
            </div>
          </div>
        )}

        {/* ANNIVERSARIES */}
        {anniversaries.length > 0 && (
          <div className="flex flex-col gap-y-4">
            <h2 className="text-2xl font-semibold">Anniversaries</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-8">
              {anniversaries.map((event, index) => (
                <EventCard
                  key={index}
                  image={event.image || dummyProfileImage}
                  name={event.name}
                  description={event.description || "No description available."}
                  date={ensureDateAsObject(event.date)}
                />
              ))}
            </div>
          </div>
        )}

        {/* REUNIONS */}
        {reunions.length > 0 && (
          <div className="flex flex-col gap-y-4">
            <h2 className="text-2xl font-semibold">Reunions</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-8">
              {reunions.map((event, index) => (
                <EventCard
                  key={index}
                  image={event.image || dummyProfileImage}
                  name={event.name}
                  description={event.description || "No description available."}
                  date={ensureDateAsObject(event.date)}
                />
              ))}
            </div>
          </div>
        )}

        {/* WEDDINGS */}
        {weddings.length > 0 && (
          <div className="flex flex-col gap-y-4">
            <h2 className="text-2xl font-semibold">Weddings</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-8">
              {weddings.map((event, index) => (
                <EventCard
                  key={index}
                  image={event.image || dummyProfileImage}
                  name={event.name}
                  description={event.description || "No description available."}
                  date={ensureDateAsObject(event.date)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
