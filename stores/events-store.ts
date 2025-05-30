import { create } from "zustand";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { Event } from "@/lib/types";
// import { v4 as uuidv4 } from "uuid";

interface EventsState {
  events: Event[];
  userEvents: Event[];
  loading: boolean;
  error: string | null;

  fetchEvents: () => Promise<Event[]>;
  fetchUserEvents: (user_id: string) => Promise<Event[]>;
  fetchUpcomingEvents: () => Promise<Event[]>;
  createEvent: (event: Omit<Event, "id">) => Promise<Event | null>;
  updateEvent: (
    id: string,
    event: Partial<Omit<Event, "id">>
  ) => Promise<Event | null>;
  deleteEvent: (id: string) => Promise<boolean>;
}

export const useEventsStore = create<EventsState>((set, get) => ({
  events: [],
  userEvents: [],
  loading: false,
  error: null,

  fetchEvents: async () => {
    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
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

  createEvent: async (event) => {
    set({ loading: true, error: null });

    try {
      // Format date for consistency if it's not already formatted
      const formattedEvent = {
        ...event,
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

      toast.success("Event created successfully");
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
}));
