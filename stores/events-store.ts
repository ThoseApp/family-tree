import { create } from "zustand";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { Event, getUserRoleFromMetadata } from "@/lib/types";
import { EventStatusEnum, NotificationTypeEnum } from "@/lib/constants/enums";
import {
  canCurrentUserAutoApprove,
  createNotificationForAllAdmins,
} from "@/lib/utils/multi-admin-helpers";
// import { v4 as uuidv4 } from "uuid";

interface EventsState {
  events: Event[];
  userEvents: Event[];
  publicEvents: Event[];
  pendingEvents: Event[];
  loading: boolean;
  error: string | null;

  fetchEvents: () => Promise<Event[]>;
  fetchUserEvents: (user_id: string) => Promise<Event[]>;
  fetchUpcomingEvents: () => Promise<Event[]>;
  fetchPublicEvents: () => Promise<Event[]>;
  fetchPendingEvents: () => Promise<Event[]>;
  createEvent: (event: Omit<Event, "id">) => Promise<Event | null>;
  updateEvent: (
    id: string,
    event: Partial<Omit<Event, "id">>
  ) => Promise<Event | null>;
  deleteEvent: (id: string) => Promise<boolean>;
  approveEvent: (id: string) => Promise<boolean>;
  rejectEvent: (id: string) => Promise<boolean>;
}

export const useEventsStore = create<EventsState>((set, get) => ({
  events: [],
  userEvents: [],
  publicEvents: [],
  pendingEvents: [],
  loading: false,
  error: null,

  fetchEvents: async () => {
    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("status", EventStatusEnum.approved)
        .order("date", { ascending: true });

      if (error) throw error;

      const events = data as Event[];
      set({ events, loading: false });
      return events;
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to fetch events";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      return [];
    }
  },

  fetchUpcomingEvents: async () => {
    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: true })
        .gte("date", new Date().toISOString());

      if (error) throw error;

      const events = data as Event[];
      set({ events, loading: false });
      return events;
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to fetch events";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      return [];
    }
  },

  fetchUserEvents: async (user_id: string) => {
    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("user_id", user_id)
        .order("date", { ascending: true });

      if (error) throw error;

      const events = data as Event[];
      set({ userEvents: events, loading: false });
      return events;
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to fetch events";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      return [];
    }
  },

  fetchPublicEvents: async () => {
    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("is_public", true)
        .eq("status", EventStatusEnum.approved)
        .order("date", { ascending: true });

      if (error) throw error;

      const events = data as Event[];
      set({ publicEvents: events, loading: false });
      return events;
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to fetch public events";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      return [];
    }
  },

  fetchPendingEvents: async () => {
    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("status", EventStatusEnum.pending)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const events = data as Event[];
      set({ pendingEvents: events, loading: false });
      return events;
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to fetch pending events";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      return [];
    }
  },

  createEvent: async (event) => {
    set({ loading: true, error: null });

    try {
      // Check if current user can auto-approve
      const canAutoApprove = await canCurrentUserAutoApprove();

      // Format date for consistency if it's not already formatted
      const formattedEvent = {
        ...event,
        status: canAutoApprove
          ? EventStatusEnum.approved
          : EventStatusEnum.pending,
        is_public: event.is_public || false,
        // id: uuidv4(),
      };

      const { data, error } = await supabase
        .from("events")
        .insert(formattedEvent)
        .select()
        .single();

      if (error) throw error;

      const newEvent = data as Event;
      set((state) => ({
        userEvents: [...state.userEvents, newEvent],
        loading: false,
      }));

      // Create notification for all admins if user is not admin/publisher and event needs approval
      if (!canAutoApprove && newEvent.user_id) {
        try {
          await createNotificationForAllAdmins({
            title: "New Event Request",
            body: `A new event "${newEvent.name}" has been submitted and is pending approval.`,
            type: NotificationTypeEnum.event_request,
            resource_id: newEvent.id,
            image: newEvent.image,
          });
        } catch (notificationErr) {
          console.error("Failed to create notification:", notificationErr);
        }
      }

      toast.success(
        canAutoApprove
          ? "Event created successfully"
          : "Event submitted for approval"
      );
      return newEvent;
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to create event";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      return null;
    }
  },

  updateEvent: async (id, eventUpdates) => {
    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from("events")
        .update(eventUpdates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      const updatedEvent = data as Event;
      set((state) => ({
        events: state.events.map((event) =>
          event.id === id ? updatedEvent : event
        ),
        userEvents: state.userEvents.map((event) =>
          event.id === id ? updatedEvent : event
        ),
        loading: false,
      }));

      toast.success("Event updated successfully");
      return updatedEvent;
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to update event";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      return null;
    }
  },

  deleteEvent: async (id) => {
    set({ loading: true, error: null });

    try {
      const { error } = await supabase.from("events").delete().eq("id", id);

      if (error) throw error;

      set((state) => ({
        events: state.events.filter((event) => event.id !== id),
        userEvents: state.userEvents.filter((event) => event.id !== id),
        loading: false,
      }));

      toast.success("Event deleted successfully");
      return true;
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to delete event";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      return false;
    }
  },

  approveEvent: async (id) => {
    set({ loading: true, error: null });

    try {
      // Get the event to find user info for notification
      const { data: event, error: fetchError } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from("events")
        .update({
          status: EventStatusEnum.approved,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      // Create notification for the user
      if (event && event.user_id) {
        try {
          await supabase.rpc("create_system_notification", {
            p_user_id: event.user_id,
            p_title: "Event Approved",
            p_body: `Your event "${event.name}" has been approved and is now visible to everyone.`,
            p_type: NotificationTypeEnum.event_approved,
            p_resource_id: id,
            p_image: event.image,
          });
        } catch (notificationErr) {
          console.error("Failed to create notification:", notificationErr);
        }
      }

      // Update local state
      set((state) => ({
        events: state.events.map((event) =>
          event.id === id
            ? { ...event, status: EventStatusEnum.approved }
            : event
        ),
        pendingEvents: state.pendingEvents.filter((event) => event.id !== id),
        loading: false,
      }));

      toast.success("Event approved successfully");
      return true;
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to approve event";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      return false;
    }
  },

  rejectEvent: async (id) => {
    set({ loading: true, error: null });

    try {
      // Get the event to find user info for notification
      const { data: event, error: fetchError } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from("events")
        .update({
          status: EventStatusEnum.rejected,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      // Create notification for the user
      if (event && event.user_id) {
        try {
          await supabase.rpc("create_system_notification", {
            p_user_id: event.user_id,
            p_title: "Event Declined",
            p_body: `Your event "${event.name}" has been declined. Please check if it meets our community guidelines.`,
            p_type: NotificationTypeEnum.event_declined,
            p_resource_id: id,
            p_image: event.image,
          });
        } catch (notificationErr) {
          console.error("Failed to create notification:", notificationErr);
        }
      }

      // Update local state
      set((state) => ({
        events: state.events.map((event) =>
          event.id === id
            ? { ...event, status: EventStatusEnum.rejected }
            : event
        ),
        pendingEvents: state.pendingEvents.filter((event) => event.id !== id),
        loading: false,
      }));

      toast.success("Event declined successfully");
      return true;
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to decline event";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      return false;
    }
  },
}));
