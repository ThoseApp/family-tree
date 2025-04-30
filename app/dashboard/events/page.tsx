import EventsTable from "@/components/tables/events";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { dummyEvents } from "@/lib/constants/dashbaord";

import { Plus } from "lucide-react";
import React from "react";

const Page = () => {
  return (
    <div className="flex flex-col gap-y-8 lg:gap-y-12">
      {/* HEADER SECTION */}
      <div className="flex md:items-center md:flex-row flex-col md: justify-between gap-y-4">
        <h1 className="text-2xl font-semibold">Upcoming Events</h1>

        <div className="flex items-center gap-4">
          <Button className="bg-foreground text-background rounded-full hover:bg-foreground/80">
            <Plus className="size-5" />
            Add New Event
          </Button>
        </div>
      </div>

      <EventsTable data={dummyEvents} />

      {/* NEW EVENT */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Event</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-2 lg:gap-4">
            {/* TITLE */}
            <div className="flex flex-col gap-2">
              <Label>Title</Label>
              <Input />
            </div>

            {/* DATE */}
            <div className="flex flex-col gap-2">
              <Label>Date</Label>
              <Input />
            </div>

            {/* CATEGORY */}
            <div className="flex flex-col gap-2">
              <Label>Category</Label>
              <Input />
            </div>

            {/* DESCRIPTION */}
            <div className="flex flex-col gap-2">
              <Label>Description</Label>
              <Textarea rows={4} />
            </div>
          </div>
        </CardContent>

        <CardFooter className="w-full flex items-end justify-end">
          <div className="flex items-center justify-end gap-2">
            <Button className="bg-foreground text-background rounded-full hover:bg-foreground/80">
              Save
            </Button>
            <Button variant="outline" className="rounded-full">
              Cancel
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Page;
