import { MockRealtimeChannel } from "./types";

type RealtimeEvent = "INSERT" | "UPDATE" | "DELETE" | "*";
type RealtimeCallback = (payload: any) => void;

interface RealtimeListener {
  event: RealtimeEvent;
  filter: any;
  callback: RealtimeCallback;
}

/**
 * MockRealtimeService - Mock realtime subscription system
 * Simulates Supabase realtime channels and broadcasts
 */
class MockRealtimeService {
  private channels: Map<string, MockRealtimeChannelImpl> = new Map();
  private eventEmitter: EventTarget;

  constructor() {
    this.eventEmitter = new EventTarget();
  }

  /**
   * Create or get a channel
   */
  channel(name: string): MockRealtimeChannel {
    if (!this.channels.has(name)) {
      const channel = new MockRealtimeChannelImpl(name, this.eventEmitter);
      this.channels.set(name, channel);
    }

    return this.channels.get(name)!;
  }

  /**
   * Broadcast a change event to all subscribed channels
   */
  broadcast(table: string, eventType: RealtimeEvent, record: any): void {
    const event = new CustomEvent(`realtime:${table}`, {
      detail: {
        eventType,
        table,
        record,
        old: eventType === "UPDATE" || eventType === "DELETE" ? record : null,
        new: eventType === "INSERT" || eventType === "UPDATE" ? record : null,
      },
    });

    // Simulate network delay
    setTimeout(() => {
      this.eventEmitter.dispatchEvent(event);
      console.log(`[Mock Realtime] Broadcast ${eventType} on ${table}`, record);
    }, 50 + Math.random() * 100); // 50-150ms delay
  }

  /**
   * Remove all channels (cleanup)
   */
  removeAllChannels(): void {
    for (const channel of this.channels.values()) {
      channel.unsubscribe();
    }
    this.channels.clear();
  }
}

/**
 * MockRealtimeChannelImpl - Individual channel implementation
 */
class MockRealtimeChannelImpl implements MockRealtimeChannel {
  private listeners: RealtimeListener[] = [];
  private subscribed: boolean = false;
  private name: string;
  private eventEmitter: EventTarget;

  constructor(name: string, eventEmitter: EventTarget) {
    this.name = name;
    this.eventEmitter = eventEmitter;
  }

  /**
   * Subscribe to the channel
   */
  subscribe(callback?: () => void): MockRealtimeChannel {
    if (this.subscribed) {
      console.warn(`[Mock Realtime] Channel ${this.name} already subscribed`);
      return this;
    }

    this.subscribed = true;
    console.log(`[Mock Realtime] Subscribed to channel ${this.name}`);

    // Simulate subscription delay
    setTimeout(() => {
      if (callback) callback();
    }, 100);

    return this;
  }

  /**
   * Listen to specific events
   */
  on(
    event: string,
    filter: any,
    callback: (payload: any) => void
  ): MockRealtimeChannel {
    // Parse the event type (postgres_changes, broadcast, presence, etc.)
    if (event === "postgres_changes") {
      const table = filter.table;
      const eventType = filter.event || "*";

      this.listeners.push({
        event: eventType as RealtimeEvent,
        filter,
        callback,
      });

      // Set up event listener on the event emitter
      const eventListener = (e: Event) => {
        const customEvent = e as CustomEvent;
        const {
          eventType: changeType,
          table: changeTable,
          record,
        } = customEvent.detail;

        // Check if this event matches our filters
        if (changeTable !== table) return;
        if (eventType !== "*" && eventType !== changeType) return;

        // Call the callback with Supabase-like payload
        callback({
          commit_timestamp: new Date().toISOString(),
          eventType: changeType,
          schema: "public",
          table: table,
          old: customEvent.detail.old,
          new: customEvent.detail.new,
          errors: null,
        });
      };

      this.eventEmitter.addEventListener(
        `realtime:${table}`,
        eventListener as EventListener
      );
      console.log(`[Mock Realtime] Listening to ${eventType} on ${table}`);
    }

    return this;
  }

  /**
   * Unsubscribe from the channel
   */
  async unsubscribe(): Promise<void> {
    if (!this.subscribed) return;

    this.subscribed = false;
    this.listeners = [];
    console.log(`[Mock Realtime] Unsubscribed from channel ${this.name}`);
  }
}

// Singleton instance
export const mockRealtimeService = new MockRealtimeService();

/**
 * Helper function to trigger mock realtime events
 * Use this in your mock data service after insert/update/delete operations
 */
export function triggerRealtimeEvent(
  table: string,
  eventType: "INSERT" | "UPDATE" | "DELETE",
  record: any
): void {
  mockRealtimeService.broadcast(table, eventType, record);
}
