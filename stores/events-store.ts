import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// TODO: Define a more specific type for Event if available
interface Event {
  id: string;
  title: string;
  date: string; // Or Date object, depending on your needs
  description: string;
  location?: string;
  // Add other relevant properties, e.g., attendees, rsvpStatus, etc.
}

interface EventsState {
  events: Event[];
  isLoading: boolean;
  error: string | null;
  selectedEvent: Event | null;
}

interface EventsActions {
  fetchEvents: () => Promise<void>;
  fetchEventById: (eventId: string) => Promise<void>;
  addEvent: (event: Omit<Event, "id">) => Promise<void>; // Assuming ID is generated on add
  updateEvent: (eventId: string, updates: Partial<Event>) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  selectEvent: (event: Event | null) => void;
}

const initialState: EventsState = {
  events: [],
  isLoading: false,
  error: null,
  selectedEvent: null,
};

export const useEventsStore = create(
  persist<EventsState & EventsActions>(
    (set, get) => ({
      ...initialState,
      fetchEvents: async () => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const mockEvents: Event[] = [
            {
              id: "1",
              title: "Family Reunion",
              date: "2024-08-15",
              description: "Annual family gathering.",
            },
            {
              id: "2",
              title: "Grandma's Birthday",
              date: "2024-09-20",
              description: "Celebrating Grandma turning 80!",
            },
          ]; // Replace with actual API call
          set({ events: mockEvents, isLoading: false });
        } catch (err: any) {
          set({
            error: err.message || "Failed to fetch events",
            isLoading: false,
          });
        }
      },
      fetchEventById: async (eventId: string) => {
        set({ isLoading: true, error: null, selectedEvent: null });
        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1000));
          // This is a simplified mock. In a real app, you'd fetch a single event from your backend.
          const event = get().events.find((e) => e.id === eventId) || null;
          if (event) {
            set({ selectedEvent: event, isLoading: false });
          } else {
            set({ error: "Event not found", isLoading: false });
          }
        } catch (err: any) {
          set({
            error: err.message || "Failed to fetch event",
            isLoading: false,
          });
        }
      },
      addEvent: async (event) => {
        set({ isLoading: true });
        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const newEvent: Event = { ...event, id: Date.now().toString() }; // Example ID generation
          set((state) => ({
            events: [...state.events, newEvent],
            isLoading: false,
          }));
        } catch (err: any) {
          set({
            error: err.message || "Failed to add event",
            isLoading: false,
          });
        }
      },
      updateEvent: async (eventId, updates) => {
        set({ isLoading: true });
        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1000));
          set((state) => ({
            events: state.events.map((event) =>
              event.id === eventId ? { ...event, ...updates } : event
            ),
            isLoading: false,
          }));
        } catch (err: any) {
          set({
            error: err.message || "Failed to update event",
            isLoading: false,
          });
        }
      },
      deleteEvent: async (eventId) => {
        set({ isLoading: true });
        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1000));
          set((state) => ({
            events: state.events.filter((event) => event.id !== eventId),
            isLoading: false,
          }));
        } catch (err: any) {
          set({
            error: err.message || "Failed to delete event",
            isLoading: false,
          });
        }
      },
      selectEvent: (event) => {
        set({ selectedEvent: event });
      },
    }),
    {
      name: "events-storage", // unique name
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);

// Optional: Persist store (if needed)
// import { persist, createJSONStorage } from 'zustand/middleware';
//
// export const useEventsStore = create(
//   persist<EventsState & EventsActions>(
//     (set, get) => ({
//       // ... store definition ...
//     }),
//     {
//       name: 'events-storage', // unique name
//       storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
//     }
//   )
// );
