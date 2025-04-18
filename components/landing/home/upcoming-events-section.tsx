import React from "react";
import EventCard from "@/components/cards/event-card";
import FrameWrapper from "@/components/wrappers/frame-wrapper";
import { Button } from "@/components/ui/button";
import { eventCategories } from "@/lib/constants/landing";

const UpcomingEventsSection = () => {
  return (
    <FrameWrapper className="  home-events-section py-12  text-background">
      {/* OVERLAY */}
      <div className=" before:content-[''] before:absolute before:inset-0 before:bg-[#191410BD]/70" />

      {/* HEADER SECTION */}

      <div className="text-center  items-center z-10">
        <h2 className="text-xl md:text-2xl font-semibold text-background ">
          UPCOMING EVENTS
        </h2>
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
                  imageUrl={item.imageUrl}
                  date={item.date}
                  alt={`${category.title} event ${itemIndex + 1}`}
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
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Button>
      </div>
    </FrameWrapper>
  );
};

export default UpcomingEventsSection;
