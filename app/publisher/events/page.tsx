import { Metadata } from "next";
import EventComponent from "@/components/event-component";
import React, { Suspense } from "react";
import { generatePageMetadata } from "@/lib/constants/metadata";
import { LoadingIcon } from "@/components/loading-icon";

export const metadata: Metadata = generatePageMetadata("events", {
  title: "Manage Events - Publisher Dashboard",
  description:
    "Manage and publish family events as a content publisher. Create, edit, and moderate family gatherings and celebrations.",
  keywords: ["publisher", "event management", "content management"],
});

const page = () => {
  return (
    <Suspense fallback={<LoadingIcon />}>
      <EventComponent />
    </Suspense>
  );
};

export default page;
