"use client";

import EventCard from "@/components/cards/event-card";
import PageHeader from "@/components/page-header";
import { dummyProfileImage } from "@/lib/constants";
import { ensureDateAsObject } from "@/lib/utils";
import { dummyEvents } from "@/lib/constants/landing";
import { useEventsStore } from "@/stores/events-store";
import React, { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

import EventDetailsModal from "@/components/modals/event-details-modal";
import { Event } from "@/lib/types";

const EventsPage = () => {
  const { fetchUpcomingEvents, events } = useEventsStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    fetchUpcomingEvents();
  }, [fetchUpcomingEvents]);

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
  };
  // Filter events based on search query and category
  const filteredEvents = useMemo(() => {
    let filtered = [...events];

    // Search filter
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.name.toLowerCase().includes(searchLower) ||
          (event.description || "").toLowerCase().includes(searchLower) ||
          event.category.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (event) => event.category.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    return filtered;
  }, [events, searchQuery, categoryFilter]);

  const birthdays = useMemo(() => {
    return filteredEvents.filter(
      (event) => event.category.toLowerCase() === "birthday"
    );
  }, [filteredEvents]);

  const anniversaries = useMemo(() => {
    return filteredEvents.filter(
      (event) => event.category.toLowerCase() === "anniversary"
    );
  }, [filteredEvents]);

  const reunions = useMemo(() => {
    return filteredEvents.filter(
      (event) => event.category.toLowerCase() === "reunion"
    );
  }, [filteredEvents]);

  const weddings = useMemo(() => {
    return filteredEvents.filter(
      (event) => event.category.toLowerCase() === "wedding"
    );
  }, [filteredEvents]);

  const otherEvents = useMemo(() => {
    const excludedCategories = [
      "birthday",
      "anniversary",
      "reunion",
      "wedding",
    ];
    return filteredEvents.filter(
      (event) => !excludedCategories.includes(event.category.toLowerCase())
    );
  }, [filteredEvents]);

  // Get unique categories from events
  const availableCategories = useMemo(() => {
    const categories = Array.from(
      new Set(events.map((event) => event.category))
    );
    return categories.sort();
  }, [events]);

  return (
    <div className="pb-20">
      <PageHeader
        title="Upcoming Events"
        description="Join us for upcoming family events, gatherings, celebrations, and milestones that bring us closer together!"
      />

      {/* SEARCH AND FILTER SECTION */}
      <div className="mb-8 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search events by name, description, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery("")}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-4">
          <Label
            htmlFor="category-filter"
            className="text-sm font-medium whitespace-nowrap"
          >
            Filter by category:
          </Label>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {availableCategories.map((category) => (
                <SelectItem key={category} value={category.toLowerCase()}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(searchQuery || categoryFilter !== "all") && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setCategoryFilter("all");
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>

        {/* Results count */}
        {(searchQuery || categoryFilter !== "all") && (
          <p className="text-sm text-muted-foreground">
            Showing {filteredEvents.length} of {events.length} events
          </p>
        )}
      </div>

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
                  onClick={() => handleEventClick(event)}
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
                  onClick={() => handleEventClick(event)}
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
                  onClick={() => handleEventClick(event)}
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
                  onClick={() => handleEventClick(event)}
                />
              ))}
            </div>
          </div>
        )}

        {/* OTHER EVENTS */}
        {otherEvents.length > 0 && (
          <div className="flex flex-col gap-y-4">
            <h2 className="text-2xl font-semibold">Other Events</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-8">
              {otherEvents.map((event, index) => (
                <EventCard
                  key={index}
                  image={event.image || dummyProfileImage}
                  name={event.name}
                  description={event.description || "No description available."}
                  date={ensureDateAsObject(event.date)}
                  onClick={() => handleEventClick(event)}
                />
              ))}
            </div>
          </div>
        )}

        {/* NO RESULTS MESSAGE */}
        {filteredEvents.length === 0 && events.length > 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No events found
            </h3>
            <p className="text-gray-500 mb-4">
              Try adjusting your search terms or category filter.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setCategoryFilter("all");
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* NO EVENTS MESSAGE */}
        {events.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No upcoming events available
            </h3>
            <p className="text-gray-500">
              Check back later for upcoming family events.
            </p>
          </div>
        )}
      </div>

      <EventDetailsModal event={selectedEvent} onClose={handleCloseModal} />
    </div>
  );
};

export default EventsPage;
