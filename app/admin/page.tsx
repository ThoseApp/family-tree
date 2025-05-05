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
import React from "react";

const DashboardPage = () => {
  // Placeholder data - replace with actual data fetching
  const pendingMembers = 4;
  const galleryRequests = 2;
  const landingPageImageUrl = dummyProfileImage; // Replace with actual image path
  const eventHighlightImageUrl = dummyProfileImage; // Replace with actual image path

  return (
    <div className="flex flex-col gap-y-8 lg:gap-y-12">
      {/* HEADER SECTION */}
      <div className="flex md:items-center md:flex-row flex-col md:justify-between gap-y-4">
        <h1 className="text-2xl font-semibold">Welcome back, Admin</h1>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {/* Pending Member Requests Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium text-muted-foreground">
              Pending Member Requests
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-6xl font-bold">{pendingMembers}</span>
          </CardContent>
          <CardFooter>
            <div className="flex items-center gap-4 w-full justify-end">
              <Button
                variant="outline"
                className="w-full rounded-full"
                size="lg"
              >
                View All
              </Button>
              <Button
                className="w-full rounded-full bg-foreground text-background hover:bg-foreground/80"
                size="lg"
              >
                Accept
              </Button>
            </div>
          </CardFooter>
        </Card>

        {/* Gallery Uploads Requests Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium text-muted-foreground">
              Gallery Uploads Requests
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-6xl font-bold">{galleryRequests}</span>
          </CardContent>

          <CardFooter>
            <div className="flex items-center gap-4 w-full justify-end">
              <Button
                variant="outline"
                className="w-full rounded-full"
                size="lg"
              >
                View All
              </Button>
              <Button
                className="w-full rounded-full bg-foreground text-background hover:bg-foreground/80"
                size="lg"
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
            <div>
              <p className="font-semibold">Smith Family Reunion</p>
              <p className="text-sm text-muted-foreground">April 15</p>
            </div>
            <div className="relative aspect-video">
              <Image
                src={eventHighlightImageUrl}
                alt="Event Highlight"
                fill
                className="object-cover rounded-xl"
              />
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex items-center gap-4 w-full justify-end">
              <Button
                variant="outline"
                className="w-full rounded-full"
                size="lg"
              >
                View All
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        <Button variant="outline" className=" rounded-full" size="lg">
          Add Event
        </Button>
        <Button variant="outline" className=" rounded-full" size="lg">
          Add Member
        </Button>
      </div>
    </div>
  );
};

export default DashboardPage;
