"use client";

import React, { useEffect, useState } from "react";
import EventsTable from "@/components/tables/events";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  CalendarIcon,
  Plus,
  Users,
  Calendar,
  Globe,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
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
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { uploadImage } from "@/lib/file-upload";
import { BucketFolderEnum } from "@/lib/constants/enums";
import Image from "next/image";
import { useUserStore } from "@/stores/user-store";
import { Event } from "@/lib/types";

const EVENT_CATEGORIES = [
  "Birthday",
  "Wedding",
  "Anniversary",
  "Reunion",
  "Memorial",
  "Holiday",
  "Community",
  "Other",
];

const PublisherEventsPage = () => {
  const {
    publicEvents,
    loading,
    fetchPublicEvents,
    createEvent,
    updateEvent,
    deleteEvent,
  } = useEventsStore();

  const { user } = useUserStore();

  const [activeTab, setActiveTab] = useState("events");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedEditFile, setSelectedEditFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Form state for the main form
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    category: "",
    description: "",
    image: "",
    is_public: true, // Publisher events are public by default
  });

  // Date state for the date picker
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  // Form state for the edit dialog
  const [editData, setEditData] = useState({
    name: "",
    date: "",
    category: "",
    description: "",
    image: "",
    is_public: true,
  });
  const [selectedEditDate, setSelectedEditDate] = useState<Date | undefined>(
    undefined
  );

  useEffect(() => {
    fetchPublicEvents();
  }, [fetchPublicEvents]);

  const toggleForm = () => {
    setShowForm(!showForm);
    if (!showForm) {
      // Reset form when opening
      setFormData({
        name: "",
        date: "",
        category: "",
        description: "",
        image: "",
        is_public: true,
      });
      setSelectedDate(undefined);
      setSelectedFile(null);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      setFormData((prev) => ({
        ...prev,
        date: date.toISOString().split("T")[0],
      }));
    }
  };

  const handleEditDateSelect = (date: Date | undefined) => {
    setSelectedEditDate(date);
    if (date) {
      setEditData((prev) => ({
        ...prev,
        date: date.toISOString().split("T")[0],
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setSelectedFile(file || null);
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setSelectedEditFile(file || null);
  };

  const handleMainFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !formData.name || !formData.date || !formData.category) {
      toast.error("Please fill in all required fields (Name, Date, Category)");
      return;
    }

    setIsUploading(true);
    let imageUrl = "";

    if (selectedFile) {
      const uploadedUrl = await uploadImage(
        selectedFile,
        BucketFolderEnum.EVENT_IMAGES
      );
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
      } else {
        setIsUploading(false);
        toast.error("Image upload failed. Please try again.");
        return;
      }
    }
    setIsUploading(false);

    try {
      await createEvent({
        name: formData.name,
        date: formData.date,
        category: formData.category,
        description: formData.description || undefined,
        image: imageUrl || undefined,
        is_public: formData.is_public,
        user_id: user.id,
      });

      // Reset form
      setFormData({
        name: "",
        date: "",
        category: "",
        description: "",
        image: "",
        is_public: true,
      });
      setSelectedDate(undefined);
      setSelectedFile(null);
      setShowForm(false);

      // Refresh public events
      fetchPublicEvents();
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };

  const handleEdit = (event: Event) => {
    setSelectedEvent(event);
    setEditData({
      name: event.name,
      date: typeof event.date === "string" ? event.date : "",
      category: event.category,
      description: event.description || "",
      image: event.image || "",
      is_public: event.is_public || false,
    });
    setSelectedEditFile(null);

    // Try to parse the date for the date picker
    try {
      setSelectedEditDate(
        new Date(typeof event.date === "string" ? event.date : "")
      );
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
      toast.error("Please fill in all required fields (Name, Date, Category)");
      return;
    }

    setIsUploading(true);
    let imageUrl = editData.image;

    if (selectedEditFile) {
      const uploadedUrl = await uploadImage(
        selectedEditFile,
        BucketFolderEnum.EVENT_IMAGES
      );
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
      } else {
        setIsUploading(false);
        toast.error("Image upload failed. Please try again.");
        return;
      }
    }
    setIsUploading(false);

    try {
      await updateEvent(selectedEvent.id, {
        name: editData.name,
        date: editData.date,
        category: editData.category,
        description: editData.description || undefined,
        image: imageUrl || undefined,
        is_public: editData.is_public,
      });

      setIsEditDialogOpen(false);
      setSelectedEvent(null);

      // Refresh public events
      fetchPublicEvents();
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

      // Refresh public events
      fetchPublicEvents();
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
        <div>
          <h1 className="text-2xl font-semibold">Public Events Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create and manage public events visible to all family members.
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Add Event Button */}
          <Button
            className="bg-foreground text-background rounded-full hover:bg-foreground/80"
            onClick={toggleForm}
            id="add-event-button"
          >
            {showForm ? (
              <>
                <ChevronUp className="size-5 mr-2" />
                Hide Form
              </>
            ) : (
              <>
                <Plus className="size-5 mr-2" />
                Add Public Event
              </>
            )}
          </Button>
        </div>
      </div>

      {/* NEW EVENT FORM */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Create Public Event
            </CardTitle>
          </CardHeader>
          <form onSubmit={handleMainFormSubmit}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Event Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Enter event name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger>
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

                <div className="space-y-2">
                  <Label>Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? (
                          format(selectedDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Event Image</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Enter event description"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_public"
                  checked={formData.is_public}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      is_public: checked as boolean,
                    }))
                  }
                />
                <Label htmlFor="is_public" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Make this event public (visible to all family members)
                </Label>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUploading || loading}>
                {isUploading ? (
                  <>
                    <LoadingIcon className="mr-2 h-4 w-4" />
                    Uploading...
                  </>
                ) : (
                  "Create Event"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {/* EVENTS DISPLAY */}
      {loading && publicEvents.length === 0 ? (
        <div className="flex items-center justify-center h-40">
          <LoadingIcon className="size-8" />
        </div>
      ) : (
        <EventsTable
          data={publicEvents}
          onEditClick={handleEdit}
          onDeleteClick={(id) => handleDelete(id)}
        />
      )}

      {/* EDIT DIALOG */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Public Event</DialogTitle>
            <DialogDescription>
              Update the public event details below.
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <form onSubmit={handleUpdate}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Event Name *</Label>
                    <Input
                      id="edit-name"
                      value={editData.name}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Enter event name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-category">Category *</Label>
                    <Select
                      value={editData.category}
                      onValueChange={(value) =>
                        setEditData((prev) => ({ ...prev, category: value }))
                      }
                    >
                      <SelectTrigger>
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

                  <div className="space-y-2">
                    <Label>Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !selectedEditDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedEditDate ? (
                            format(selectedEditDate, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={selectedEditDate}
                          onSelect={handleEditDateSelect}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-image">Event Image</Label>
                    <Input
                      id="edit-image"
                      type="file"
                      accept="image/*"
                      onChange={handleEditFileChange}
                    />
                    {editData.image && !selectedEditFile && (
                      <div className="mt-2">
                        <p className="text-sm text-muted-foreground">
                          Current image: {editData.image}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={editData.description}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Enter event description"
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-is_public"
                    checked={editData.is_public}
                    onCheckedChange={(checked) =>
                      setEditData((prev) => ({
                        ...prev,
                        is_public: checked as boolean,
                      }))
                    }
                  />
                  <Label
                    htmlFor="edit-is_public"
                    className="flex items-center gap-2"
                  >
                    <Globe className="h-4 w-4" />
                    Make this event public (visible to all family members)
                  </Label>
                </div>
              </div>

              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isUploading || loading}>
                  {isUploading ? (
                    <>
                      <LoadingIcon className="mr-2 h-4 w-4" />
                      Uploading...
                    </>
                  ) : (
                    "Update Event"
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the
              event.
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
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PublisherEventsPage;
