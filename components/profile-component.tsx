"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image"; // Assuming Next.js for Image component
import { dummyProfileImage } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useUserStore } from "@/stores/user-store";
import { useGalleryStore } from "@/stores/gallery-store";
import { useLifeEventsStore } from "@/stores/life-events-store";
import { toast } from "sonner";
import { UserProfile, LifeEvent } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Plus, Edit2, Trash2, Calendar as CalendarIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LoadingIcon } from "@/components/loading-icon";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { EnhancedCalendar } from "@/components/ui/enhanced-calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Simple component for linked family members
const FamilyMember = ({
  name,
  imageUrl,
}: {
  name: string;
  imageUrl: string;
}) => (
  <div className="flex items-center space-x-2 mr-4 mb-2">
    <div className="relative w-10 h-10">
      <Image
        src={imageUrl}
        alt={name}
        fill
        className="rounded-full object-cover"
      />
    </div>
    <span>{name}</span>
  </div>
);

const ProfileComponent = () => {
  const { user, getUserProfile } = useUserStore();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { fetchUserGallery, userGallery } = useGalleryStore();
  const {
    lifeEvents,
    loading: lifeEventsLoading,
    fetchUserLifeEvents,
    createLifeEvent,
    updateLifeEvent,
    deleteLifeEvent,
  } = useLifeEventsStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Life events dialog states
  const [isLifeEventDialogOpen, setIsLifeEventDialogOpen] = useState(false);
  const [editingLifeEvent, setEditingLifeEvent] = useState<LifeEvent | null>(
    null
  );
  const [lifeEventFormData, setLifeEventFormData] = useState({
    year: "",
    title: "",
    description: "",
    date: undefined as Date | undefined,
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      toast.error("User not authenticated");
      return;
    }

    (async () => {
      fetchUserGallery(user.id);
      const profile = await getUserProfile();
      setUserProfile(profile);
      await fetchUserLifeEvents(user.id);
    })();
  }, [user, fetchUserGallery, getUserProfile, fetchUserLifeEvents]);

  const handleAddLifeEvent = () => {
    setEditingLifeEvent(null);
    setLifeEventFormData({
      year: "",
      title: "",
      description: "",
      date: undefined,
    });
    setIsLifeEventDialogOpen(true);
  };

  const handleEditLifeEvent = (event: LifeEvent) => {
    setEditingLifeEvent(event);
    setLifeEventFormData({
      year: event.year,
      title: event.title,
      description: event.description || "",
      date: event.date ? new Date(event.date) : undefined,
    });
    setIsLifeEventDialogOpen(true);
  };

  const handleSaveLifeEvent = async () => {
    if (!user || !lifeEventFormData.year || !lifeEventFormData.title) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (editingLifeEvent) {
        await updateLifeEvent(
          editingLifeEvent.id,
          {
            ...lifeEventFormData,
            date: lifeEventFormData.date?.toISOString(),
          },
          user.id
        );
      } else {
        await createLifeEvent(
          {
            ...lifeEventFormData,
            date: lifeEventFormData.date?.toISOString(),
          },
          user.id
        );
      }
      setIsLifeEventDialogOpen(false);
    } catch (error) {
      console.error("Error saving life event:", error);
    }
  };

  const handleDeleteLifeEvent = async (eventId: string) => {
    setDeletingEventId(eventId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteLifeEvent = async () => {
    if (!user || !deletingEventId) return;

    try {
      await deleteLifeEvent(deletingEventId, user.id);
      setIsDeleteDialogOpen(false);
      setDeletingEventId(null);
    } catch (error) {
      console.error("Error deleting life event:", error);
    }
  };

  return (
    <div className="flex flex-col gap-y-8 lg:gap-y-12">
      {/* HEADER SECTION */}
      <div className="flex md:items-center md:flex-row flex-col md:justify-between gap-y-4">
        <h1 className="text-2xl font-semibold">Profile</h1>
      </div>

      {/* Profile Section */}
      <Card>
        {/* Header */}
        <CardHeader className="">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="relative w-16 h-16">
                <Image
                  src={userProfile?.image || dummyProfileImage}
                  alt={userProfile?.first_name || ""}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <h1 className="text-2xl font-semibold">
                {userProfile?.first_name} {userProfile?.last_name}
              </h1>
            </div>
            <Button variant="outline" asChild>
              <Link
                href={
                  user?.user_metadata?.is_admin
                    ? "/admin/settings"
                    : "/dashboard/settings"
                }
              >
                Edit Profile
              </Link>
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Basic Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-gray-700">
              <div>
                <span className="font-medium text-gray-900">Full Name:</span>{" "}
                {userProfile?.first_name} {userProfile?.last_name}
              </div>
              <div>
                <span className="font-medium text-gray-900">
                  Date of Birth:
                </span>{" "}
                {formatDate(new Date(userProfile?.date_of_birth || ""))}
              </div>
              <div>
                <span className="font-medium text-gray-900">Gender:</span>{" "}
                {userProfile?.gender}
              </div>
              <div>
                <span className="font-medium text-gray-900">Phone Number:</span>{" "}
                {userProfile?.phone_number}{" "}
                <span className="text-sm text-gray-500">(Optional)</span>
              </div>
              <div>
                <span className="font-medium text-gray-900">Occupation:</span>{" "}
                {userProfile?.occupation}{" "}
                <span className="text-sm text-gray-500">(Optional)</span>
              </div>
              <div>
                <span className="font-medium text-gray-900">
                  Marital Status:
                </span>{" "}
                {userProfile?.marital_status}
              </div>
            </div>
          </div>

          {/* Biography */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Biography</h2>
            <p className="text-gray-700 leading-relaxed">{userProfile?.bio}</p>
          </div>

          {/* Timeline / Life Events */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Timeline / Life Events</h2>
              <Button
                onClick={handleAddLifeEvent}
                size="sm"
                className="bg-foreground text-background hover:bg-foreground/80"
              >
                <Plus className="size-4 mr-2" />
                Add Event
              </Button>
            </div>

            {lifeEventsLoading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingIcon className="size-6" />
                <span className="ml-2">Loading life events...</span>
              </div>
            ) : lifeEvents.length > 0 ? (
              <div className="space-y-4">
                {lifeEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CalendarIcon className="size-4 text-gray-500" />
                        <span className="font-medium text-gray-900">
                          {event.year}
                        </span>
                        <span className="text-lg font-semibold text-gray-900">
                          {event.title}
                        </span>
                      </div>
                      {event.description && (
                        <p className="text-gray-600 text-sm ml-6">
                          {event.description}
                        </p>
                      )}
                      {event.date && (
                        <p className="text-gray-500 text-xs ml-6 mt-1">
                          Date: {formatDate(new Date(event.date))}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditLifeEvent(event)}
                      >
                        <Edit2 className="size-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteLifeEvent(event.id)}
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CalendarIcon className="size-12 mx-auto mb-2 text-gray-300" />
                <p>No life events added yet.</p>
                <p className="text-sm">
                  Click &quot;Add Event&quot; to get started!
                </p>
              </div>
            )}
          </div>

          {/* Gallery */}
          <div>
            <h2 className="text-xl font-semibold mb-2">Gallery</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {userGallery.map((imgSrc, index) => (
                <div
                  key={index}
                  className="aspect-square overflow-hidden rounded"
                >
                  <Image
                    src={imgSrc.url}
                    alt={`Gallery image ${index + 1}`}
                    width={200}
                    height={200}
                    className="object-cover w-full h-full"
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Life Event Dialog */}
      <Dialog
        open={isLifeEventDialogOpen}
        onOpenChange={setIsLifeEventDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingLifeEvent ? "Edit Life Event" : "Add Life Event"}
            </DialogTitle>
            <DialogDescription>
              Add important milestones and memories to your timeline.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="year">Year *</Label>
              <Input
                id="year"
                type="number"
                placeholder="e.g., 1990"
                value={lifeEventFormData.year}
                onChange={(e) =>
                  setLifeEventFormData((prev) => ({
                    ...prev,
                    year: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Graduated from University"
                value={lifeEventFormData.title}
                onChange={(e) =>
                  setLifeEventFormData((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Add more details about this event..."
                value={lifeEventFormData.description}
                onChange={(e) =>
                  setLifeEventFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <Label className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Specific Date (Optional)
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !lifeEventFormData.date && "text-muted-foreground"
                    )}
                  >
                    {lifeEventFormData.date ? (
                      format(lifeEventFormData.date, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <EnhancedCalendar
                    mode="single"
                    selected={lifeEventFormData.date}
                    onSelect={(date) => {
                      setLifeEventFormData((prev) => ({ ...prev, date }));
                    }}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsLifeEventDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveLifeEvent} disabled={lifeEventsLoading}>
              {lifeEventsLoading ? (
                <>
                  <LoadingIcon className="size-4 mr-2" />
                  Saving...
                </>
              ) : editingLifeEvent ? (
                "Update Event"
              ) : (
                "Add Event"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Life Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this life event? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteLifeEvent}
              disabled={lifeEventsLoading}
            >
              {lifeEventsLoading ? (
                <>
                  <LoadingIcon className="size-4 mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete Event"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileComponent;
