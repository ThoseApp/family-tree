import { create } from "zustand";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { LifeEvent } from "@/lib/types";

interface LifeEventsState {
  lifeEvents: LifeEvent[];
  loading: boolean;
  error: string | null;

  fetchUserLifeEvents: (user_id: string) => Promise<LifeEvent[]>;
  createLifeEvent: (
    event: Omit<LifeEvent, "id" | "created_at" | "updated_at">,
    user_id: string
  ) => Promise<LifeEvent | null>;
  updateLifeEvent: (
    id: string,
    event: Partial<Omit<LifeEvent, "id" | "created_at" | "updated_at">>,
    user_id: string
  ) => Promise<LifeEvent | null>;
  deleteLifeEvent: (id: string, user_id: string) => Promise<boolean>;
}

export const useLifeEventsStore = create<LifeEventsState>((set, get) => ({
  lifeEvents: [],
  loading: false,
  error: null,

  fetchUserLifeEvents: async (user_id: string) => {
    set({ loading: true, error: null });

    try {
      // Get user profile and extract timeline from JSONB
      const { data, error } = await supabase
        .from("profiles")
        .select("timeline")
        .eq("user_id", user_id)
        .single();

      if (error) throw error;

      // Parse the timeline JSONB data
      const timelineData = data?.timeline || [];
      const events: LifeEvent[] = Array.isArray(timelineData)
        ? timelineData.map((event: any, index: number) => ({
            id: event.id || `event-${index}`,
            year: event.year || new Date().getFullYear().toString(),
            title: event.title || event.event || "",
            description: event.description || "",
            date: event.date || "",
            created_at: event.created_at || new Date().toISOString(),
            updated_at: event.updated_at || new Date().toISOString(),
          }))
        : [];

      set({ lifeEvents: events, loading: false });
      return events;
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to fetch life events";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      return [];
    }
  },

  createLifeEvent: async (eventData, user_id: string) => {
    set({ loading: true, error: null });

    try {
      const newEvent: LifeEvent = {
        ...eventData,
        id: `event-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Get current timeline
      const { data: currentProfile, error: fetchError } = await supabase
        .from("profiles")
        .select("timeline")
        .eq("user_id", user_id)
        .single();

      if (fetchError) throw fetchError;

      const currentTimeline = currentProfile?.timeline || [];
      const updatedTimeline = [...currentTimeline, newEvent];

      // Update the timeline in the database
      const { error } = await supabase
        .from("profiles")
        .update({
          timeline: updatedTimeline,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user_id);

      if (error) throw error;

      set((state) => ({
        lifeEvents: [...state.lifeEvents, newEvent].sort(
          (a, b) => parseInt(b.year) - parseInt(a.year)
        ),
        loading: false,
      }));

      toast.success("Life event added successfully");
      return newEvent;
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to create life event";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      return null;
    }
  },

  updateLifeEvent: async (id, eventUpdates, user_id: string) => {
    set({ loading: true, error: null });

    try {
      // Get current timeline
      const { data: currentProfile, error: fetchError } = await supabase
        .from("profiles")
        .select("timeline")
        .eq("user_id", user_id)
        .single();

      if (fetchError) throw fetchError;

      const currentTimeline = currentProfile?.timeline || [];
      const updatedTimeline = currentTimeline.map((event: any) =>
        event.id === id
          ? { ...event, ...eventUpdates, updated_at: new Date().toISOString() }
          : event
      );

      // Update the timeline in the database
      const { error } = await supabase
        .from("profiles")
        .update({
          timeline: updatedTimeline,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user_id);

      if (error) throw error;

      const updatedEvent = updatedTimeline.find(
        (event: any) => event.id === id
      );

      set((state) => ({
        lifeEvents: state.lifeEvents
          .map((event) =>
            event.id === id
              ? {
                  ...event,
                  ...eventUpdates,
                  updated_at: new Date().toISOString(),
                }
              : event
          )
          .sort((a, b) => parseInt(b.year) - parseInt(a.year)),
        loading: false,
      }));

      toast.success("Life event updated successfully");
      return updatedEvent;
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to update life event";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      return null;
    }
  },

  deleteLifeEvent: async (id, user_id: string) => {
    set({ loading: true, error: null });

    try {
      // Get current timeline
      const { data: currentProfile, error: fetchError } = await supabase
        .from("profiles")
        .select("timeline")
        .eq("user_id", user_id)
        .single();

      if (fetchError) throw fetchError;

      const currentTimeline = currentProfile?.timeline || [];
      const updatedTimeline = currentTimeline.filter(
        (event: any) => event.id !== id
      );

      // Update the timeline in the database
      const { error } = await supabase
        .from("profiles")
        .update({
          timeline: updatedTimeline,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user_id);

      if (error) throw error;

      set((state) => ({
        lifeEvents: state.lifeEvents.filter((event) => event.id !== id),
        loading: false,
      }));

      toast.success("Life event deleted successfully");
      return true;
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to delete life event";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      return false;
    }
  },
}));
