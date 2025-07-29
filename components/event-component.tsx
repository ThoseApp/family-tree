"use client";

import EventsTable from "@/components/tables/events";
import InvitationsComponent from "@/components/invitations-component";
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
import {
  CalendarIcon,
  ChevronDown,
  ChevronUp,
  Plus,
  Users,
  Send,
  Mail,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useEventsStore } from "@/stores/events-store";
import { useEventInvitationsStore } from "@/stores/event-invitations-store";
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
import { EnhancedCalendar } from "@/components/ui/enhanced-calendar";
import { format } from "date-fns";
import { uploadImage } from "@/lib/file-upload";
import { BucketFolderEnum } from "@/lib/constants/enums";
import Image from "next/image";
import { useUserStore } from "@/stores/user-store";
import { Event, UserProfile } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { dummyProfileImage } from "@/lib/constants";
import { useSearchParams } from "next/navigation";

const EVENT_CATEGORIES = [
  "Birthday",
  "Wedding",
  "Anniversary",
  "Reunion",
  "Memorial",
  "Holiday",
  "Other",
];

const EventComponent = () => {
  const {
    userEvents,
    loading,
    fetchUserEvents,
    createEvent,
    updateEvent,
    deleteEvent,
  } = useEventsStore();

  const {
    sendInvitations,
    getFamilyMembers,
    loading: inviteLoading,
  } = useEventInvitationsStore();

  const { user } = useUserStore();
  const searchParams = useSearchParams();

  // Tab state - check URL parameter for initial tab
  const [activeTab, setActiveTab] = useState(() => {
    const tab = searchParams.get("tab");
    return tab === "invitations" ? "invitations" : "events";
  });
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedEditFile, setSelectedEditFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Invitation states
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [eventToInvite, setEventToInvite] = useState<Event | null>(null);
  const [familyMembers, setFamilyMembers] = useState<UserProfile[]>([]);
  const [selectedInvitees, setSelectedInvitees] = useState<string[]>([]);
  const [inviteMessage, setInviteMessage] = useState("");

  // Form state for the main form
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    category: "",
    description: "",
    image: "",
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
  });

  // Edit date state
  const [selectedEditDate, setSelectedEditDate] = useState<Date | undefined>(
    undefined
  );

  useEffect(() => {
    if (user) {
      fetchUserEvents(user.id);
    }
  }, [fetchUserEvents, user]);

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

  // Load family members when invite dialog opens
  useEffect(() => {
    if (isInviteDialogOpen) {
      loadFamilyMembers();
    }
  }, [isInviteDialogOpen]);

  const loadFamilyMembers = async () => {
    const members = await getFamilyMembers();
    // Filter out the current user
    const filteredMembers = members.filter(
      (member) => member.user_id !== user?.id
    );
    setFamilyMembers(filteredMembers);
  };

  const toggleForm = () => {
    setShowForm((prev) => !prev);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "description" && selectedEvent) {
      setEditData((prev) => ({ ...prev, [name]: value }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }));
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
        user_id: user.id,
      });

      // Reset form
      setFormData({
        name: "",
        date: "",
        category: "",
        description: "",
        image: "",
      });
      setSelectedDate(undefined);
      setSelectedFile(null);
      setShowForm(false);
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };

  const handleEdit = (event: any) => {
    setSelectedEvent(event);
    setEditData({
      name: event.name,
      date: event.date,
      category: event.category,
      description: event.description || "",
      image: event.image || "",
    });
    setSelectedEditFile(null);

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

  // Invitation handlers
  const handleInvite = (event: Event) => {
    setEventToInvite(event);
    setSelectedInvitees([]);
    setInviteMessage("");
    setIsInviteDialogOpen(true);
  };

  const handleInviteeSelection = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedInvitees((prev) => [...prev, userId]);
    } else {
      setSelectedInvitees((prev) => prev.filter((id) => id !== userId));
    }
  };

  const handleSendInvitations = async () => {
    if (!user || !eventToInvite || selectedInvitees.length === 0) {
      toast.error("Please select at least one family member to invite");
      return;
    }

    const success = await sendInvitations(
      eventToInvite.id,
      user.id,
      selectedInvitees,
      inviteMessage || undefined
    );

    if (success) {
      setIsInviteDialogOpen(false);
      setEventToInvite(null);
      setSelectedInvitees([]);
      setInviteMessage("");
    }
  };

  return (
    <div className="flex flex-col gap-y-8 lg:gap-y-12">
      {/* HEADER SECTION */}
      <div className="flex md:items-center md:flex-row flex-col md:justify-between gap-y-4">
        <h1 className="text-2xl font-semibold">Events & Invitations</h1>
      </div>

      {/* TABS */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="events" className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Events
          </TabsTrigger>
          <TabsTrigger value="invitations" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Invitations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="mt-6">
          <div className="flex flex-col gap-y-8 lg:gap-y-12">
            {/* ADD EVENT BUTTON */}
            <div className="flex items-center justify-end">
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

            {loading && userEvents.length === 0 ? (
              <div className="flex items-center justify-center h-40">
                <LoadingIcon className="size-8" />
              </div>
            ) : (
              <EventsTable
                data={userEvents}
                onEditClick={handleEdit}
                onDeleteClick={(id) => handleDelete(id)}
                onInviteClick={handleInvite}
              />
            )}

            {/* NEW EVENT FORM */}
            {showForm && (
              <Card className="animate-in fade-in-50 duration-300">
                <CardHeader>
                  <CardTitle>Add New Event</CardTitle>
                </CardHeader>

                <CardContent>
                  <div className="flex flex-col gap-2 lg:gap-4">
                    {/* IMAGE UPLOAD (OPTIONAL) */}
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="image-upload">
                        Event Image (Optional)
                      </Label>
                      <Input
                        id="image-upload"
                        name="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={loading || isUploading}
                      />
                      {selectedFile && (
                        <div className="mt-2">
                          <p className="text-sm text-muted-foreground">
                            Preview:
                          </p>
                          <Image
                            src={URL.createObjectURL(selectedFile)}
                            alt="Preview"
                            width={100}
                            height={100}
                            className="rounded-md object-cover"
                          />
                        </div>
                      )}
                    </div>

                    {/* TITLE */}
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="name">Event Name</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="E.g Grandma Beth's 80th Birthday Celebration"
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={loading || isUploading}
                        required
                      />
                    </div>

                    {/* DATE */}
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="date">Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "justify-start text-left font-normal",
                              !selectedDate && "text-muted-foreground"
                            )}
                            disabled={loading || isUploading}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? (
                              format(selectedDate, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <EnhancedCalendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
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
                        disabled={loading || isUploading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
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
                      <Label htmlFor="description">
                        Description (Optional)
                      </Label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Add event description..."
                        value={formData.description}
                        onChange={handleTextareaChange}
                        disabled={loading || isUploading}
                        rows={3}
                      />
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="w-full flex items-end justify-end">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      className="bg-foreground text-background rounded-full hover:bg-foreground/80"
                      disabled={loading || isUploading}
                      onClick={handleMainFormSubmit}
                    >
                      {loading && <LoadingIcon className="mr-2" />}
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-full"
                      onClick={() => setShowForm(false)}
                      disabled={loading || isUploading}
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
                    {/* Edit Image Upload */}
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="edit-image-upload">
                        Event Image (Optional)
                      </Label>
                      <Input
                        id="edit-image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleEditFileChange}
                        disabled={loading || isUploading}
                      />
                      {selectedEditFile && (
                        <div className="mt-2">
                          <p className="text-sm text-muted-foreground">
                            New Image Preview:
                          </p>
                          <Image
                            src={URL.createObjectURL(selectedEditFile)}
                            alt="New image preview"
                            width={100}
                            height={100}
                            className="rounded-md object-cover"
                          />
                        </div>
                      )}
                      {!selectedEditFile && editData.image && (
                        <div className="mt-2">
                          <p className="text-sm text-muted-foreground">
                            Current Image:
                          </p>
                          <Image
                            src={editData.image}
                            alt="Current event image"
                            width={100}
                            height={100}
                            className="rounded-md object-cover"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="edit-name">Event Name</Label>
                      <Input
                        id="edit-name"
                        name="name"
                        value={editData.name}
                        onChange={handleInputChange}
                        disabled={loading || isUploading}
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
                            disabled={loading || isUploading}
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
                          <EnhancedCalendar
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
                        onValueChange={handleSelectChange}
                        disabled={loading || isUploading}
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
                      <Label htmlFor="edit-description">
                        Description (Optional)
                      </Label>
                      <Textarea
                        id="edit-description"
                        name="description"
                        value={editData.description}
                        onChange={handleTextareaChange}
                        disabled={loading || isUploading}
                        rows={3}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button
                      type="submit"
                      disabled={loading || isUploading}
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
            <Dialog
              open={isDeleteDialogOpen}
              onOpenChange={setIsDeleteDialogOpen}
            >
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Confirm Deletion</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this event? This action
                    cannot be undone.
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

            {/* INVITE DIALOG */}
            <Dialog
              open={isInviteDialogOpen}
              onOpenChange={setIsInviteDialogOpen}
            >
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Users className="size-5" />
                    Invite Family Members
                  </DialogTitle>
                  <DialogDescription>
                    Send invitations to family members for &quot;
                    {eventToInvite?.name || "this event"}&quot;
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  {/* Message Input */}
                  <div>
                    <Label htmlFor="invite-message">
                      Personal Message (Optional)
                    </Label>
                    <Textarea
                      id="invite-message"
                      placeholder="Add a personal message to your invitation..."
                      value={inviteMessage}
                      onChange={(e) => setInviteMessage(e.target.value)}
                      rows={3}
                    />
                  </div>

                  {/* Family Members Selection */}
                  <div>
                    <Label className="text-sm font-medium">
                      Select Family Members
                    </Label>
                    <div className="mt-2 max-h-80 overflow-y-auto border rounded-md p-3">
                      {familyMembers.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No family members available to invite
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {familyMembers.map((member) => (
                            <div
                              key={member.user_id}
                              className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded"
                            >
                              <Checkbox
                                id={`member-${member.user_id}`}
                                checked={selectedInvitees.includes(
                                  member.user_id
                                )}
                                onCheckedChange={(checked) =>
                                  handleInviteeSelection(
                                    member.user_id,
                                    checked as boolean
                                  )
                                }
                              />
                              <Avatar className="size-8">
                                <AvatarImage
                                  src={member.image || dummyProfileImage}
                                  alt={`${member.first_name} ${member.last_name}`}
                                />
                                <AvatarFallback>
                                  {member.first_name?.[0]}
                                  {member.last_name?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="text-sm font-medium">
                                  {member.first_name} {member.last_name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {member.email}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {selectedInvitees.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {selectedInvitees.length} family member
                        {selectedInvitees.length === 1 ? "" : "s"} selected
                      </p>
                    )}
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsInviteDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSendInvitations}
                    disabled={inviteLoading || selectedInvitees.length === 0}
                    className="bg-foreground text-background hover:bg-foreground/80"
                  >
                    {inviteLoading ? (
                      <>
                        <LoadingIcon className="size-4 mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="size-4 mr-2" />
                        Send Invitations ({selectedInvitees.length})
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </TabsContent>

        <TabsContent value="invitations" className="mt-6">
          <InvitationsComponent />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EventComponent;
