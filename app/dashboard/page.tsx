"use client";

import ClientMetadata from "@/components/seo/client-metadata";
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
import { useAlbumStore, Album } from "@/stores/album-store";
import { useFamilyMembersStore } from "@/stores/family-members-store";
import { useUserStore } from "@/stores/user-store";
import { supabase } from "@/lib/supabase/client";
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

// Interface for recent family member
interface RecentFamilyMember {
  id: string;
  first_name: string;
  last_name: string;
  picture_link?: string | null;
  created_at: string;
}

const DashboardPage = () => {
  const { fetchUpcomingEvents } = useEventsStore();
  const { fetchAlbums, albums } = useAlbumStore();
  const { fetchFamilyMembers, familyMembers } = useFamilyMembersStore();
  const { user } = useUserStore();

  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [recentAlbums, setRecentAlbums] = useState<Album[]>([]);
  const [recentFamilyMembers, setRecentFamilyMembers] = useState<
    RecentFamilyMember[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  const sortedUpcomingEvents = [...upcomingEvents].sort((a, b) => {
    return (
      getSortableDate(a.date).getTime() - getSortableDate(b.date).getTime()
    );
  });

  const latestUpcomingEvent =
    sortedUpcomingEvents.length > 0 ? sortedUpcomingEvents[0] : null;

  // Fetch recently approved family members from profiles table
  const fetchRecentFamilyMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "user_id, first_name, last_name, email, status, updated_at, created_at"
        )
        .eq("status", "approved")
        .order("updated_at", { ascending: false })
        .limit(6);

      if (error) {
        console.error("Error fetching recent approved family members:", error);
        return [];
      }

      return (
        data?.map((member) => ({
          id: member.user_id,
          first_name: member.first_name || "Unknown",
          last_name: member.last_name || "",
          picture_link: null, // Profiles table doesn't have picture links
          created_at: member.updated_at || member.created_at,
        })) || []
      );
    } catch (error) {
      console.error("Error fetching recent approved family members:", error);
      return [];
    }
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);

      try {
        // Fetch all data in parallel
        await Promise.all([
          (async () => {
            const events = await fetchUpcomingEvents();
            setUpcomingEvents(events);
          })(),

          (async () => {
            await fetchAlbums();
            // Get the 7 most recent albums
            const recentAlbums = albums
              .sort(
                (a, b) =>
                  new Date(b.created_at).getTime() -
                  new Date(a.created_at).getTime()
              )
              .slice(0, 7);
            setRecentAlbums(recentAlbums);
          })(),

          (async () => {
            const members = await fetchRecentFamilyMembers();
            setRecentFamilyMembers(members.slice(0, 6));
          })(),
        ]);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [fetchUpcomingEvents, fetchAlbums]);

  // Update recent albums when albums state changes
  useEffect(() => {
    if (albums.length > 0) {
      const recentAlbums = albums
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        .slice(0, 7);
      setRecentAlbums(recentAlbums);
    }
  }, [albums]);

  return (
    <>
      <ClientMetadata
        title="Dashboard - Mosuro Family Portal"
        description="Your personal Mosuro family dashboard. Access family information, upcoming events, recent updates, and manage your family connections."
        keywords={["dashboard", "family portal", "personal hub"]}
      />
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
                    description={
                      event.description || "No description available."
                    }
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
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 7 }).map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "relative h-[30vh] bg-border w-full rounded-xl animate-pulse",
                      index === 5 && "col-span-3"
                    )}
                  />
                ))}
              </div>
            ) : recentAlbums.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {recentAlbums.map((album, index) => (
                  <div
                    key={album.id}
                    className={cn(
                      "relative h-[30vh] bg-border w-full rounded-xl overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow",
                      index === 5 && "col-span-3"
                    )}
                  >
                    {album.cover_image ? (
                      <Image
                        src={album.cover_image}
                        alt={album.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-12 h-12 mx-auto mb-2 bg-gray-300 rounded-lg flex items-center justify-center">
                            <svg
                              className="w-6 h-6 text-gray-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                          <p className="text-sm text-gray-600 font-medium">
                            {album.name}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Album info overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-end">
                      <div className="w-full p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <h3 className="font-semibold text-lg mb-1">
                          {album.name}
                        </h3>
                        <p className="text-sm opacity-90">
                          {album.item_count}{" "}
                          {album.item_count === 1 ? "item" : "items"}
                        </p>
                        {album.description && (
                          <p className="text-xs opacity-75 mt-1 line-clamp-2">
                            {album.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
                <p className="text-muted-foreground mb-2">
                  No albums created yet
                </p>
                <p className="text-sm text-gray-500">
                  Start by creating your first album to organize your family
                  photos
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default DashboardPage;
