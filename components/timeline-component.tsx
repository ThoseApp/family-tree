"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/stores/user-store";
import { useLifeEventsStore } from "@/stores/life-events-store";
import { toast } from "sonner";
import { LifeEvent } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Plus, Edit2, Trash2, Calendar, Search, X } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

  // Search functionality states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilter, setSearchFilter] = useState("all");

  // Filter life events based on search query and filter
  const filteredLifeEvents = useMemo(() => {
    if (!searchQuery.trim()) return lifeEvents;

    return lifeEvents.filter((event) => {
      const query = searchQuery.toLowerCase();

      switch (searchFilter) {
        case "title":
          return event.title.toLowerCase().includes(query);
        case "description":
          return (event.description || "").toLowerCase().includes(query);
        case "year":
          return event.year.includes(query);
        case "all":
        default:
          return (
            event.title.toLowerCase().includes(query) ||
            (event.description || "").toLowerCase().includes(query) ||
            event.year.includes(query)
          );
      }
    });
  }, [lifeEvents, searchQuery, searchFilter]);

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

      {/* SEARCH SECTION */}
      {lifeEvents.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4" />
              <Input
                placeholder="Search timeline by title, description, or year..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label
                htmlFor="search-filter"
                className="text-sm font-medium whitespace-nowrap"
              >
                Search in:
              </Label>
              <Select value={searchFilter} onValueChange={setSearchFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All fields</SelectItem>
                  <SelectItem value="title">Title only</SelectItem>
                  <SelectItem value="description">Description only</SelectItem>
                  <SelectItem value="year">Year only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {searchQuery && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="shrink-0"
              >
                <X className="size-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>
      )}

      {/* TIMELINE CONTENT */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        {lifeEventsLoading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingIcon className="size-6" />
            <span className="ml-2">Loading life events...</span>
          </div>
        ) : filteredLifeEvents.length > 0 ? (
          <div className="space-y-4">
            {filteredLifeEvents.map((event) => (
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
                    <p className="text-gray-600 mt-2">{event.description}</p>
                  )}
                  {event.date && (
                    <p className="text-sm text-gray-500 mt-1">
                      Date: {formatDate(event.date)}
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
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : lifeEvents.length > 0 && searchQuery ? (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No matching events found
            </h3>
            <p className="text-gray-500 mb-4">
              Try adjusting your search terms or search filter.
            </p>
            <Button variant="outline" onClick={() => setSearchQuery("")}>
              Clear Search
            </Button>
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="size-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No life events yet
            </h3>
            <p className="text-gray-600 mb-4">
              Start building your timeline by adding your first life event.
            </p>
            <Button onClick={handleAddLifeEvent}>
              <Plus className="size-4 mr-2" />
              Add Life Event
            </Button>
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
