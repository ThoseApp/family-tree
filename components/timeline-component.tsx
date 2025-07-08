"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/stores/user-store";
import { useLifeEventsStore } from "@/stores/life-events-store";
import { toast } from "sonner";
import { LifeEvent } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Plus, Edit2, Trash2, Calendar } from "lucide-react";
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

const TimelineComponent = () => {
  const { user } = useUserStore();
  const {
    lifeEvents,
    loading: lifeEventsLoading,
    fetchUserLifeEvents,
    createLifeEvent,
    updateLifeEvent,
    deleteLifeEvent,
  } = useLifeEventsStore();

  // Life events dialog states
  const [isLifeEventDialogOpen, setIsLifeEventDialogOpen] = useState(false);
  const [editingLifeEvent, setEditingLifeEvent] = useState<LifeEvent | null>(
    null
  );
  const [lifeEventFormData, setLifeEventFormData] = useState({
    year: "",
    title: "",
    description: "",
    date: "",
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      toast.error("User not authenticated");
      return;
    }

    fetchUserLifeEvents(user.id);
  }, [user, fetchUserLifeEvents]);

  const handleAddLifeEvent = () => {
    setEditingLifeEvent(null);
    setLifeEventFormData({
      year: "",
      title: "",
      description: "",
      date: "",
    });
    setIsLifeEventDialogOpen(true);
  };

  const handleEditLifeEvent = (event: LifeEvent) => {
    setEditingLifeEvent(event);
    setLifeEventFormData({
      year: event.year,
      title: event.title,
      description: event.description || "",
      date: event.date || "",
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
        await updateLifeEvent(editingLifeEvent.id, lifeEventFormData, user.id);
      } else {
        await createLifeEvent(lifeEventFormData, user.id);
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
        <h1 className="text-2xl font-semibold">Timeline</h1>
        <Button
          onClick={handleAddLifeEvent}
          className="bg-foreground text-background hover:bg-foreground/80"
        >
          <Plus className="size-4 mr-2" />
          Add Life Event
        </Button>
      </div>

      {/* TIMELINE CONTENT */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
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
                    <Calendar className="size-4 text-gray-500" />
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
            <Calendar className="size-12 mx-auto mb-2 text-gray-300" />
            <p>No life events added yet.</p>
            <p className="text-sm">
              Click &quot;Add Life Event&quot; to get started!
            </p>
          </div>
        )}
      </div>

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
              <Label htmlFor="date">Specific Date (Optional)</Label>
              <Input
                id="date"
                type="date"
                value={lifeEventFormData.date}
                onChange={(e) =>
                  setLifeEventFormData((prev) => ({
                    ...prev,
                    date: e.target.value,
                  }))
                }
              />
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

export default TimelineComponent;
