"use client";

import React from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Event } from "@/lib/types";
import { dummyProfileImage } from "@/lib/constants";
import { ensureDateAsObject } from "@/lib/utils";
import { Calendar, Tag, Info, X } from "lucide-react";

interface EventDetailsModalProps {
  event: Event | null;
  onClose: () => void;
}

const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  event,
  onClose,
}) => {
  if (!event) return null;

  const eventDate = ensureDateAsObject(event.date);

  return (
    <Dialog open={!!event} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[525px] p-0">
        <div className="relative w-full h-64">
          <Image
            src={event.image || dummyProfileImage}
            alt={event.name}
            fill
            className="object-cover rounded-t-lg"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-2 right-2 h-8 w-8 p-0 bg-white/80 hover:bg-white rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <DialogHeader className="p-6">
          <DialogTitle className="text-2xl font-semibold">
            {event.name}
          </DialogTitle>
          {event.description && (
            <DialogDescription className="text-base">
              {event.description}
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="px-6 pb-6 space-y-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm font-medium">
              {eventDate.month} {eventDate.day}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Tag className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm capitalize">{event.category}</p>
          </div>
          {event.is_public !== undefined && (
            <div className="flex items-center gap-3">
              <Info className="h-5 w-5 text-muted-foreground" />
              <p className="text-sm">
                {event.is_public ? "Public Event" : "Private Event"}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventDetailsModal;
