"use client";

import React, { useEffect, useMemo, useState } from "react";
import EventCard from "@/components/cards/event-card";
import FrameWrapper from "@/components/wrappers/frame-wrapper";
import { Button } from "@/components/ui/button";
import { eventCategories } from "@/lib/constants/landing";
import { MoveRight } from "lucide-react";
import { useLandingPageContent } from "@/hooks/use-landing-page-content";
import { useEventsStore } from "@/stores/events-store";
import { dummyProfileImage } from "@/lib/constants";
import { Event } from "@/lib/types";

const UpcomingEventsSection = () => {
  const { sections, loading: contentLoading, error } = useLandingPageContent();
  const eventsSection = sections.upcoming_events;
  const {
    loading: eventsLoading,
    fetchUpcomingEvents,
    events,
  } = useEventsStore();

  // Fallback content
  const defaultContent = {
    title: "UPCOMING EVENTS",
    description: "Stay updated with family celebrations and gatherings",
    image_url:
      "https://fhntxnttrlttuknrpgad.supabase.co/storage/v1/object/public/family-tree-bucket/landing_page/1751890680881-r1d473ud39.png",
  };

  const content = eventsSection || defaultContent;

  // Fetch upcoming events on component mount
  useEffect(() => {
    fetchUpcomingEvents();
  }, [fetchUpcomingEvents]);

  // Group events by category
  const groupedEvents = useMemo(() => {
    const categories = {
      Birthdays: events.filter(
        (event) => event.category?.toLowerCase() === "birthday"
      ),
      Weddings: events.filter(
        (event) => event.category?.toLowerCase() === "wedding"
      ),
      Anniversaries: events.filter(
        (event) => event.category?.toLowerCase() === "anniversary"
      ),
      Reunions: events.filter(
        (event) => event.category?.toLowerCase() === "reunion"
      ),
      Memorials: events.filter(
        (event) => event.category?.toLowerCase() === "memorial"
      ),
      Holidays: events.filter(
        (event) => event.category?.toLowerCase() === "holiday"
      ),
      "Other Events": events.filter((event) => {
        const category = event.category?.toLowerCase() || "";
        return (
          ![
            "birthday",
            "wedding",
            "anniversary",
            "reunion",
            "memorial",
            "holiday",
          ].includes(category) || category === "other"
        );
      }),
    };

    // Convert to the format expected by the component and filter out empty categories
    return Object.entries(categories)
      .filter(([_, categoryEvents]) => categoryEvents.length > 0)
      .map(([title, categoryEvents]) => ({
        title,
        items: categoryEvents.map((event) => ({
          imageUrl: event.image || dummyProfileImage,
          name: event.name,
          description: event.description,
          date:
            typeof event.date === "string"
              ? {
                  month: new Date(event.date).toLocaleDateString("en-US", {
                    month: "long",
                  }),
                  day: new Date(event.date).getDate().toString(),
                }
              : event.date,
        })),
      }));
  }, [events]);

  // Fallback to dummy data if no real events are available
  const displayCategories = groupedEvents.filter((cat) => cat.items.length > 0);

  return (
    <FrameWrapper className="home-events-section py-8 lg:py-12 text-background relative">
      <div
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage: `url(${content.image_url})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
        aria-hidden="true"
      />
      {/* OVERLAY */}
      <div className="absolute inset-0 bg-[#191410BD]/70 z-0" />

      {/* HEADER SECTION */}
      <div className="text-center items-center relative z-10">
        <h2 className="text-xl md:text-2xl font-semibold text-background ">
          {contentLoading ? "UPCOMING EVENTS" : content.title}
        </h2>
        {content.description && (
          <p className="text-background/90 mt-2 text-lg">
            {content.description}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 relative z-20 mt-8">
        {eventsLoading ? (
          <div className="col-span-full text-center text-background">
            Loading events...
          </div>
        ) : displayCategories.length === 0 ? (
          <div className="col-span-full text-center text-background">
            <p className="text-lg">No upcoming events found.</p>
            <p className="text-sm opacity-75 mt-2">
              Events will appear here when they are added to the system.
            </p>
          </div>
        ) : (
          displayCategories.map((category, index) => (
            <div key={`${category.title}-${index}`} className="space-y-6">
              <div className="flex items-center gap-2 mb-6">
                <h3 className="text-2xl font-semibold text-background">
                  {category.title}
                </h3>
              </div>
              <div className="space-y-8">
                {category.items.map((item, itemIndex) => (
                  <EventCard
                    key={`${category.title}-${item.name}-${itemIndex}`}
                    image={item.imageUrl}
                    name={item.name}
                    date={item.date}
                    description={`${category.title} event ${itemIndex + 1}`}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex justify-center relative z-10 mt-8">
        <Button
          variant="alternative"
          size="lg"
          className="rounded-full items-center"
        >
          View Details
          <MoveRight className="size-5 ml-2" />
        </Button>
      </div>
    </FrameWrapper>
  );
};

export default UpcomingEventsSection;
