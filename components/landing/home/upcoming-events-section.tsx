"use client";

import React from "react";
import EventCard from "@/components/cards/event-card";
import FrameWrapper from "@/components/wrappers/frame-wrapper";
import { Button } from "@/components/ui/button";
import { eventCategories } from "@/lib/constants/landing";
import { MoveRight } from "lucide-react";
import { useLandingPageContent } from "@/hooks/use-landing-page-content";

const UpcomingEventsSection = () => {
  const { sections, loading, error } = useLandingPageContent();
  const eventsSection = sections.upcoming_events;

  // Fallback content
  const defaultContent = {
    title: "UPCOMING EVENTS",
    description: "Stay updated with family celebrations and gatherings",
    image_url: "/images/landing/upcoming_events_section.webp",
  };

  const content = eventsSection || defaultContent;

  return (
    <div
      className="relative"
      style={{
        backgroundImage: `url(${
          content.image_url || defaultContent.image_url
        })`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <FrameWrapper className="home-events-section py-8 lg:py-12 text-background">
        {/* OVERLAY */}
        <div className=" before:content-[''] before:absolute before:inset-0 before:bg-[#191410BD]/70" />

        {/* HEADER SECTION */}
        <div className="text-center items-center z-10">
          <h2 className="text-xl md:text-2xl font-semibold text-background ">
            {loading ? "UPCOMING EVENTS" : content.title}
          </h2>
          {content.description && (
            <p className="text-background/90 mt-2 text-lg">
              {content.description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 z-10 ">
          {eventCategories.map((category, index) => (
            <div key={index} className="space-y-6">
              <h3 className="text-2xl font-semibold mb-6 text-background">
                {category.title}
              </h3>
              <div className="space-y-8">
                {category.items.map((item, itemIndex) => (
                  <EventCard
                    key={itemIndex}
                    image={item.imageUrl}
                    date={item.date}
                    description={`${category.title} event ${itemIndex + 1}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center z-10">
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
    </div>
  );
};

export default UpcomingEventsSection;
