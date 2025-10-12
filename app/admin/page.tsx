"use client";

import ClientMetadata from "@/components/seo/client-metadata";
import DashboardOverviewCard from "@/components/cards/dashboard-overview-card";
import UpcomingEventCard from "@/components/cards/upcoming-event-card";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { dummyProfileImage } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { cn } from "@/lib/utils";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import {
  GalleryStatusEnum,
  NoticeBoardStatusEnum,
} from "@/lib/constants/enums";
import { useEventsStore } from "@/stores/events-store";
import { useMemberRequestsStore } from "@/stores/member-requests-store";
import { toast } from "sonner";
import { LoadingIcon } from "@/components/loading-icon";

const DashboardPage = () => {
  const router = useRouter();
  const { events, fetchUpcomingEvents } = useEventsStore();

  // State for dashboard data
  const [galleryRequests, setGalleryRequests] = useState(0);
  const [noticeBoardRequests, setNoticeBoardRequests] = useState(0);
  const [pendingMembers, setPendingMembers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [featuredEvent, setFeaturedEvent] = useState<any>(null);
  const landingPageImageUrl = dummyProfileImage; // Replace with actual image path

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch pending gallery requests count
        const { count: galleryCount, error: galleryError } = await supabase
          .from("galleries")
          .select("*", { count: "exact", head: true })
          .eq("status", GalleryStatusEnum.pending);

        if (galleryError) {
          console.error("Error fetching gallery requests:", galleryError);
        } else {
          setGalleryRequests(galleryCount || 0);
        }

        // Fetch pending notice board requests count
        const { count: noticeBoardCount, error: noticeBoardError } =
          await supabase
            .from("notice_boards")
            .select("*", { count: "exact", head: true })
            .eq("status", NoticeBoardStatusEnum.pending);

        if (noticeBoardError) {
          console.error(
            "Error fetching notice board requests:",
            noticeBoardError
          );
        } else {
          setNoticeBoardRequests(noticeBoardCount || 0);
        }

        // Fetch pending member requests count using store
        const memberRequestsStore = useMemberRequestsStore.getState();
        const memberCount = await memberRequestsStore.getMemberRequestsCount();
        setPendingMembers(memberCount);

        // Fetch upcoming events
        const upcomingEvents = await fetchUpcomingEvents();
        if (upcomingEvents && upcomingEvents.length > 0) {
          setFeaturedEvent(upcomingEvents[0]); // Get the next upcoming event
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [fetchUpcomingEvents]);

  // Navigation handlers
  const handleViewGalleryRequests = () => {
    router.push("/admin/gallery-requests");
  };

  const handleViewNoticeBoardRequests = () => {
    router.push("/admin/notice-board-requests");
  };

  const handleAcceptGalleryRequests = async () => {
    try {
      // Get pending galleries and approve them in bulk
      const { data: pendingGalleries, error } = await supabase
        .from("galleries")
        .select("*")
        .eq("status", GalleryStatusEnum.pending)
        .limit(5); // Approve up to 5 at a time

      if (error) {
        throw error;
      }

      if (pendingGalleries && pendingGalleries.length > 0) {
        const { error: updateError } = await supabase
          .from("galleries")
          .update({
            status: GalleryStatusEnum.approved,
            updated_at: new Date().toISOString(),
          })
          .in(
            "id",
            pendingGalleries.map((g) => g.id)
          );

        if (updateError) {
          throw updateError;
        }

        toast.success(
          `Approved ${pendingGalleries.length} gallery request${
            pendingGalleries.length === 1 ? "" : "s"
          }`
        );

        // Refresh the count
        const { count } = await supabase
          .from("galleries")
          .select("*", { count: "exact", head: true })
          .eq("status", GalleryStatusEnum.pending);

        setGalleryRequests(count || 0);
      } else {
        toast.info("No pending gallery requests to approve");
      }
    } catch (error) {
      console.error("Error approving gallery requests:", error);
      toast.error("Failed to approve gallery requests");
    }
  };

  const handleAcceptNoticeBoardRequests = async () => {
    try {
      // Get pending notice boards and approve them in bulk
      const { data: pendingNoticeBoards, error } = await supabase
        .from("notice_boards")
        .select("*")
        .eq("status", NoticeBoardStatusEnum.pending)
        .limit(5); // Approve up to 5 at a time

      if (error) {
        throw error;
      }

      if (pendingNoticeBoards && pendingNoticeBoards.length > 0) {
        const { error: updateError } = await supabase
          .from("notice_boards")
          .update({
            status: NoticeBoardStatusEnum.approved,
            updated_at: new Date().toISOString(),
          })
          .in(
            "id",
            pendingNoticeBoards.map((nb) => nb.id)
          );

        if (updateError) {
          throw updateError;
        }

        toast.success(
          `Approved ${pendingNoticeBoards.length} notice board request${
            pendingNoticeBoards.length === 1 ? "" : "s"
          }`
        );

        // Refresh the count
        const { count } = await supabase
          .from("notice_boards")
          .select("*", { count: "exact", head: true })
          .eq("status", NoticeBoardStatusEnum.pending);

        setNoticeBoardRequests(count || 0);
      } else {
        toast.info("No pending notice board requests to approve");
      }
    } catch (error) {
      console.error("Error approving notice board requests:", error);
      toast.error("Failed to approve notice board requests");
    }
  };

  const handleEditLandingPage = () => {
    router.push("/admin/manage-landing-page");
  };

  const handleViewAllEvents = () => {
    router.push("/admin/events");
  };

  const handleAddEvent = () => {
    router.push("/admin/events");
  };

  const handleAddMember = () => {
    router.push("/admin/family-members");
  };

  return (
    <>
      <ClientMetadata
        title="Admin Dashboard - Mosuro Family Management"
        description="Administrative dashboard for managing the Mosuro family tree application. Handle member requests, content moderation, and system administration."
        keywords={["admin", "management", "administration"]}
        noIndex={true}
      />
      <div className="flex flex-col gap-y-8 lg:gap-y-12">
        {/* HEADER SECTION */}
        <div className="flex md:items-center md:flex-row flex-col md:justify-between gap-y-4">
          <h1 className="text-2xl font-semibold">Welcome back, Admin</h1>
          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <LoadingIcon className="size-4" />
              <span className="text-sm">Loading dashboard data...</span>
            </div>
          )}
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* Gallery Uploads Requests Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium text-muted-foreground">
                Gallery Uploads Requests
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <span className="text-6xl font-bold">
                {isLoading ? (
                  <LoadingIcon className="size-16" />
                ) : (
                  galleryRequests
                )}
              </span>
            </CardContent>

            <CardFooter>
              <div className="flex items-center gap-4 w-full justify-end">
                <Button
                  variant="outline"
                  className="w-full rounded-full"
                  size="lg"
                  onClick={handleViewGalleryRequests}
                  disabled={isLoading}
                >
                  View All
                </Button>
                <Button
                  className="w-full rounded-full bg-foreground text-background hover:bg-foreground/80"
                  size="lg"
                  onClick={handleAcceptGalleryRequests}
                  disabled={isLoading || galleryRequests === 0}
                >
                  Accept
                </Button>
              </div>
            </CardFooter>
          </Card>

          {/* Notice Board Requests Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium text-muted-foreground">
                Notice Board Requests
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <span className="text-6xl font-bold">
                {isLoading ? (
                  <LoadingIcon className="size-16" />
                ) : (
                  noticeBoardRequests
                )}
              </span>
            </CardContent>

            <CardFooter>
              <div className="flex items-center gap-4 w-full justify-end">
                <Button
                  variant="outline"
                  className="w-full rounded-full"
                  size="lg"
                  onClick={handleViewNoticeBoardRequests}
                  disabled={isLoading}
                >
                  View All
                </Button>
                <Button
                  className="w-full rounded-full bg-foreground text-background hover:bg-foreground/80"
                  size="lg"
                  onClick={handleAcceptNoticeBoardRequests}
                  disabled={isLoading || noticeBoardRequests === 0}
                >
                  Accept
                </Button>
              </div>
            </CardFooter>
          </Card>

          {/* Landing Page Updates Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium text-muted-foreground">
                Landing Page Updates
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Ensure Image component covers the area */}
              <div className="relative aspect-video">
                <Image
                  src={landingPageImageUrl}
                  alt="Landing Page Preview"
                  fill
                  className="object-cover rounded-xl"
                />
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex items-center gap-4 w-full justify-end">
                <Button
                  className="w-full rounded-full bg-foreground text-background hover:bg-foreground/80"
                  size="lg"
                  onClick={handleEditLandingPage}
                >
                  Edit
                </Button>
              </div>
            </CardFooter>
          </Card>

          {/* Event Highlights Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium text-muted-foreground">
                Event Highlights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingIcon className="size-8" />
                </div>
              ) : featuredEvent ? (
                <>
                  <div>
                    <p className="font-semibold">{featuredEvent.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(featuredEvent.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="relative aspect-video">
                    <Image
                      src={featuredEvent.image || dummyProfileImage}
                      alt="Event Highlight"
                      fill
                      className="object-cover rounded-xl"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="font-semibold">No upcoming events</p>
                    <p className="text-sm text-muted-foreground">
                      Create an event to see it here
                    </p>
                  </div>
                  <div className="relative aspect-video">
                    <Image
                      src={dummyProfileImage}
                      alt="Event Placeholder"
                      fill
                      className="object-cover rounded-xl opacity-50"
                    />
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter>
              <div className="flex items-center gap-4 w-full justify-end">
                <Button
                  variant="outline"
                  className="w-full rounded-full"
                  size="lg"
                  onClick={handleViewAllEvents}
                >
                  View All
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            className="rounded-full"
            size="lg"
            onClick={handleAddEvent}
            id="add-event-button"
          >
            Add Event
          </Button>
          <Button
            variant="outline"
            className="rounded-full"
            size="lg"
            onClick={handleAddMember}
            id="add-family-member-button"
          >
            Add Member
          </Button>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
