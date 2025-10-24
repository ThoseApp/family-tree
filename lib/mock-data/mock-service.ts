import { MockDatabase, MockFilter, MockOrder, MockTable } from "./types";

/**
 * Generate a UUID-like string for mock data
 */
function generateId(): string {
  return (
    "mock-" +
    Math.random().toString(36).substr(2, 9) +
    "-" +
    Date.now().toString(36)
  );
}

/**
 * MockDataService - In-memory data store for mock mode
 * Provides CRUD operations and query filtering similar to Supabase
 */
class MockDataService {
  private data: MockDatabase;
  private initialized: boolean = false;

  constructor() {
    this.data = {
      profiles: [],
      "family-tree": [],
      events: [],
      notice_boards: [],
      galleries: [],
      albums: [],
      history: [],
      notifications: [],
      event_invitations: [],
      family_member_requests: [],
      landing_page_sections: [],
      life_events: [],
    };
  }

  /**
   * Initialize the mock data from fixtures
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Load all fixtures
      const [
        users,
        profiles,
        familyMembers,
        events,
        notices,
        gallery,
        albums,
        history,
        notifications,
        invitations,
        memberRequests,
        landingPage,
      ] = await Promise.all([
        import("./fixtures/users.json"),
        import("./fixtures/profiles.json"),
        import("./fixtures/family-members.json"),
        import("./fixtures/events.json"),
        import("./fixtures/notices.json"),
        import("./fixtures/gallery.json"),
        import("./fixtures/albums.json"),
        import("./fixtures/history.json"),
        import("./fixtures/notifications.json"),
        import("./fixtures/invitations.json"),
        import("./fixtures/member-requests.json"),
        import("./fixtures/landing-page.json"),
      ]);

      // Populate the in-memory store
      this.data.profiles = [...profiles.default];
      this.data["family-tree"] = [...familyMembers.default];
      this.data.events = [...events.default];
      this.data.notice_boards = [...notices.default];
      this.data.galleries = [...gallery.default];
      this.data.albums = [...albums.default];
      this.data.history = [...history.default];
      this.data.notifications = [...notifications.default];
      this.data.event_invitations = [...invitations.default];
      this.data.family_member_requests = [...memberRequests.default];
      this.data.landing_page_sections = [...landingPage.default];
      this.data.life_events = [];

      this.initialized = true;
      console.log("[Mock Data] Initialized with fixture data");
    } catch (error) {
      console.error("[Mock Data] Failed to initialize:", error);
      throw error;
    }
  }

  /**
   * Reset all data to initial fixtures
   */
  async reset(): Promise<void> {
    this.initialized = false;
    await this.initialize();
  }

  /**
   * Get all records from a table
   */
  getAll(table: MockTable): any[] {
    return [...(this.data[table] || [])];
  }

  /**
   * Get a single record by ID
   */
  getById(table: MockTable, id: string | number): any | null {
    const records = this.data[table] || [];
    return records.find((record: any) => record.id === id) || null;
  }

  /**
   * Query records with filters
   */
  query(
    table: MockTable,
    filters: MockFilter[] = [],
    orders: MockOrder[] = [],
    limit?: number,
    offset?: number
  ): any[] {
    let results = [...(this.data[table] || [])];

    // Apply filters
    for (const filter of filters) {
      results = results.filter((record: any) => {
        return this.applyFilter(record, filter);
      });
    }

    // Apply sorting
    if (orders.length > 0) {
      results.sort((a: any, b: any) => {
        for (const order of orders) {
          const aVal = a[order.column];
          const bVal = b[order.column];

          if (aVal === bVal) continue;

          if (aVal === null || aVal === undefined) return 1;
          if (bVal === null || bVal === undefined) return -1;

          const comparison = aVal < bVal ? -1 : 1;
          return order.ascending ? comparison : -comparison;
        }
        return 0;
      });
    }

    // Apply pagination
    if (offset !== undefined) {
      results = results.slice(offset);
    }
    if (limit !== undefined) {
      results = results.slice(0, limit);
    }

    return results;
  }

  /**
   * Apply a single filter to a record
   */
  private applyFilter(record: any, filter: MockFilter): boolean {
    const value = record[filter.column];

    switch (filter.operator) {
      case "eq":
        return value === filter.value;
      case "neq":
        return value !== filter.value;
      case "gt":
        return value > filter.value;
      case "gte":
        return value >= filter.value;
      case "lt":
        return value < filter.value;
      case "lte":
        return value <= filter.value;
      case "in":
        return Array.isArray(filter.value) && filter.value.includes(value);
      case "is":
        if (filter.value === null) return value === null;
        if (filter.value === true) return value === true;
        if (filter.value === false) return value === false;
        return value === filter.value;
      case "like":
        if (typeof value !== "string") return false;
        const likePattern = filter.value.replace(/%/g, ".*");
        return new RegExp(`^${likePattern}$`).test(value);
      case "ilike":
        if (typeof value !== "string") return false;
        const ilikePattern = filter.value.replace(/%/g, ".*");
        return new RegExp(`^${ilikePattern}$`, "i").test(value);
      case "contains":
        if (Array.isArray(value)) {
          return value.includes(filter.value);
        }
        if (typeof value === "string") {
          return value.includes(filter.value);
        }
        return false;
      default:
        return true;
    }
  }

  /**
   * Insert a new record
   */
  insert(table: MockTable, data: any | any[]): any[] {
    const records = Array.isArray(data) ? data : [data];
    const inserted: any[] = [];

    for (const record of records) {
      const newRecord = {
        ...record,
        id: record.id || generateId(),
        created_at: record.created_at || new Date().toISOString(),
        updated_at: record.updated_at || new Date().toISOString(),
      };

      this.data[table].push(newRecord);
      inserted.push({ ...newRecord });
    }

    return inserted;
  }

  /**
   * Update records matching filters
   */
  update(table: MockTable, updates: any, filters: MockFilter[] = []): any[] {
    const records = this.data[table] || [];
    const updated: any[] = [];

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const matches = filters.every((filter) =>
        this.applyFilter(record, filter)
      );

      if (matches) {
        records[i] = {
          ...record,
          ...updates,
          updated_at: new Date().toISOString(),
        };
        updated.push({ ...records[i] });
      }
    }

    return updated;
  }

  /**
   * Delete records matching filters
   */
  delete(table: MockTable, filters: MockFilter[] = []): any[] {
    const records = this.data[table] || [];
    const deleted: any[] = [];

    this.data[table] = records.filter((record: any) => {
      const matches = filters.every((filter) =>
        this.applyFilter(record, filter)
      );
      if (matches) {
        deleted.push({ ...record });
        return false;
      }
      return true;
    });

    return deleted;
  }

  /**
   * Count records matching filters
   */
  count(table: MockTable, filters: MockFilter[] = []): number {
    return this.query(table, filters).length;
  }

  /**
   * Execute a mock RPC function
   */
  async rpc(functionName: string, params: any = {}): Promise<any> {
    console.log(`[Mock RPC] Executing ${functionName}`, params);

    switch (functionName) {
      case "create_system_notification":
        return this.createSystemNotification(params);
      case "get_pending_counts":
        return this.getPendingCounts();
      case "mark_notifications_as_read":
        return this.markNotificationsAsRead(params);
      default:
        console.warn(`[Mock RPC] Unknown function: ${functionName}`);
        return null;
    }
  }

  /**
   * Mock RPC: Create system notification
   */
  private createSystemNotification(params: any): any {
    const notification = {
      id: generateId(),
      user_id: params.p_user_id,
      title: params.p_title,
      body: params.p_body,
      type: params.p_type,
      resource_id: params.p_resource_id || null,
      image: params.p_image || null,
      read: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.data.notifications.push(notification);
    return notification;
  }

  /**
   * Mock RPC: Get pending counts
   */
  private getPendingCounts(): any {
    return {
      pending_events: this.count("events", [
        { column: "status", operator: "eq", value: "pending" },
      ]),
      pending_galleries: this.count("galleries", [
        { column: "status", operator: "eq", value: "pending" },
      ]),
      pending_notices: this.count("notice_boards", [
        { column: "status", operator: "eq", value: "pending" },
      ]),
      pending_member_requests: this.count("family_member_requests", [
        { column: "status", operator: "eq", value: "pending" },
      ]),
      pending_profiles: this.count("profiles", [
        { column: "status", operator: "eq", value: "pending" },
      ]),
    };
  }

  /**
   * Mock RPC: Mark notifications as read
   */
  private markNotificationsAsRead(params: any): any {
    const { notification_ids } = params;
    const filters: MockFilter[] = [
      { column: "id", operator: "in", value: notification_ids },
    ];
    return this.update("notifications", { read: true }, filters);
  }

  /**
   * Export current state (for debugging)
   */
  export(): MockDatabase {
    return JSON.parse(JSON.stringify(this.data));
  }

  /**
   * Import state (for testing)
   */
  import(data: Partial<MockDatabase>): void {
    Object.assign(this.data, data);
  }
}

// Singleton instance
export const mockDataService = new MockDataService();
