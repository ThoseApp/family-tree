"use client";

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
import { CalendarIcon, ChevronDown, ChevronUp, Plus } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useEventsStore } from "@/stores/events-store";
import { toast } from "sonner";
import { LoadingIcon } from "@/components/loading-icon";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

const EVENT_CATEGORIES = [
  "Birthday",
  "Wedding",
  "Anniversary",
  "Reunion",
  "Memorial",
  "Holiday",
  "Other",
];

const EventsPage = () => {
  const {
    events,
    loading,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
  } = useEventsStore();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);

  // Form state for the main form
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    category: "",
    description: "",
  });

  // Date state for the date picker
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  // Form state for the edit dialog
  const [editData, setEditData] = useState({
    name: "",
    date: "",
    category: "",
    description: "",
  });

  // Edit date state
  const [selectedEditDate, setSelectedEditDate] = useState<Date | undefined>(
    undefined
  );

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Update formData.date when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      setFormData((prev) => ({
        ...prev,
        date: format(selectedDate, "yyyy-MM-dd"),
      }));
    }
  }, [selectedDate]);

  // Update editData.date when selectedEditDate changes
  useEffect(() => {
    if (selectedEditDate) {
      setEditData((prev) => ({
        ...prev,
        date: format(selectedEditDate, "yyyy-MM-dd"),
      }));
    }
  }, [selectedEditDate]);

  const resetForm = () => {
    setFormData({
      name: "",
      date: "",
      category: "",
      description: "",
    });
    setSelectedDate(undefined);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }));
  };

  const handleMainFormSubmit = async () => {
    if (!formData.name || !formData.date || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await createEvent({
        name: formData.name,
        date: formData.date,
        category: formData.category,
        description: formData.description || undefined,
      });

      resetForm();
      setShowForm(false);
      toast.success("Event created successfully");
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };

  // Toggle form visibility
  const toggleForm = () => {
    setShowForm(!showForm);
    if (!showForm) {
      // Reset the form when opening it
      resetForm();
    }
  };

  // Edit dialog handlers
  const handleEditInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSelectChange = (value: string) => {
    setEditData((prev) => ({ ...prev, category: value }));
  };

  const handleEdit = (event: any) => {
    setSelectedEvent(event);
    setEditData({
      name: event.name,
      date: event.date,
      category: event.category,
      description: event.description || "",
    });

    // Try to parse the date for the date picker
    try {
      setSelectedEditDate(new Date(event.date));
    } catch (error) {
      setSelectedEditDate(undefined);
    }

    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !selectedEvent ||
      !editData.name ||
      !editData.date ||
      !editData.category
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await updateEvent(selectedEvent.id, {
        name: editData.name,
        date: editData.date,
        category: editData.category,
        description: editData.description || undefined,
      });

      setIsEditDialogOpen(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };

  const handleDelete = async (id: string) => {
    setEventToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!eventToDelete) return;

    try {
      await deleteEvent(eventToDelete);
      toast.success("Event deleted successfully");
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event");
    } finally {
      setIsDeleteDialogOpen(false);
      setEventToDelete(null);
    }
  };

  return (
    <div className="flex flex-col gap-y-8 lg:gap-y-12">
      {/* HEADER SECTION */}
      <div className="flex md:items-center md:flex-row flex-col md:justify-between gap-y-4">
        <h1 className="text-2xl font-semibold">Upcoming Events</h1>

        <div className="flex items-center gap-4">
          <Button
            className="bg-foreground text-background rounded-full hover:bg-foreground/80"
            onClick={toggleForm}
          >
            {showForm ? (
              <>
                <ChevronUp className="size-5 mr-2" />
                Hide Form
              </>
            ) : (
              <>
                <Plus className="size-5 mr-2" />
                Add New Event
              </>
            )}
          </Button>
        </div>
      </div>

      {loading && events.length === 0 ? (
        <div className="flex items-center justify-center h-40">
          <LoadingIcon className="size-8" />
        </div>
      ) : (
        <EventsTable
          data={events}
          onEditClick={handleEdit}
          onDeleteClick={(id) => handleDelete(id)}
        />
      )}

      {/* NEW EVENT */}
      {showForm && (
        <Card className="animate-in fade-in-50 duration-300">
          <CardHeader>
            <CardTitle>Add New Event</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col gap-2 lg:gap-4">
              {/* TITLE */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Title</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>

              {/* DATE */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="date">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                      disabled={loading}
                    >
                      {selectedDate ? (
                        format(selectedDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date("1900-01-01")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* CATEGORY */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={handleSelectChange}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* DESCRIPTION */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="w-full flex items-end justify-end">
            <div className="flex items-center justify-end gap-2">
              <Button
                className="bg-foreground text-background rounded-full hover:bg-foreground/80"
                disabled={loading}
                onClick={handleMainFormSubmit}
              >
                {loading && <LoadingIcon className="mr-2" />}
                Save
              </Button>
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => setShowForm(false)}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}

      {/* EDIT EVENT DIALOG */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>Update event details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate}>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-name">Event Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={editData.name}
                  onChange={handleEditInputChange}
                  disabled={loading}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-date">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !selectedEditDate && "text-muted-foreground"
                      )}
                      disabled={loading}
                    >
                      {selectedEditDate ? (
                        format(selectedEditDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedEditDate}
                      onSelect={setSelectedEditDate}
                      disabled={(date) => date < new Date("1900-01-01")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  value={editData.category}
                  onValueChange={handleEditSelectChange}
                >
                  <SelectTrigger id="edit-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-description">Description (Optional)</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  value={editData.description}
                  onChange={handleEditInputChange}
                  disabled={loading}
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                type="submit"
                disabled={loading}
                className="bg-foreground text-background rounded-full hover:bg-foreground/80"
              >
                {loading && <LoadingIcon className="mr-2" />}
                Update Event
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this event? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={loading}
              className="rounded-full"
            >
              {loading && <LoadingIcon className="mr-2" />}
              Delete
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventsPage;
