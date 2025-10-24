import {
  MockSupabaseClient,
  MockQueryBuilder,
  MockResponse,
  MockFilter,
  MockOrder,
  MockTable,
} from "../mock-data/types";
import { mockDataService } from "../mock-data/mock-service";
import { mockAuthService } from "../mock-data/mock-auth";
import { mockStorageService } from "../mock-data/mock-storage";
import {
  mockRealtimeService,
  triggerRealtimeEvent,
} from "../mock-data/mock-realtime";

/**
 * MockQueryBuilderImpl - Implements the Supabase query builder interface
 */
class MockQueryBuilderImpl<T = any> implements MockQueryBuilder<T> {
  private table: MockTable;
  private selectedColumns: string = "*";
  private filters: MockFilter[] = [];
  private orders: MockOrder[] = [];
  private limitCount?: number;
  private offsetCount?: number;
  private isSingle: boolean = false;
  private operation: "select" | "insert" | "update" | "delete" = "select";
  private insertData?: any | any[];
  private updateData?: any;

  constructor(table: MockTable) {
    this.table = table;
  }

  /**
   * Select columns
   */
  select(columns: string = "*"): MockQueryBuilder<T> {
    this.selectedColumns = columns;
    this.operation = "select";
    return this;
  }

  /**
   * Insert records
   */
  insert(data: any | any[]): MockQueryBuilder<T> {
    this.insertData = data;
    this.operation = "insert";
    return this;
  }

  /**
   * Update records
   */
  update(data: any): MockQueryBuilder<T> {
    this.updateData = data;
    this.operation = "update";
    return this;
  }

  /**
   * Delete records
   */
  delete(): MockQueryBuilder<T> {
    this.operation = "delete";
    return this;
  }

  /**
   * Filter: equals
   */
  eq(column: string, value: any): MockQueryBuilder<T> {
    this.filters.push({ column, operator: "eq", value });
    return this;
  }

  /**
   * Filter: not equals
   */
  neq(column: string, value: any): MockQueryBuilder<T> {
    this.filters.push({ column, operator: "neq", value });
    return this;
  }

  /**
   * Filter: greater than
   */
  gt(column: string, value: any): MockQueryBuilder<T> {
    this.filters.push({ column, operator: "gt", value });
    return this;
  }

  /**
   * Filter: greater than or equal
   */
  gte(column: string, value: any): MockQueryBuilder<T> {
    this.filters.push({ column, operator: "gte", value });
    return this;
  }

  /**
   * Filter: less than
   */
  lt(column: string, value: any): MockQueryBuilder<T> {
    this.filters.push({ column, operator: "lt", value });
    return this;
  }

  /**
   * Filter: less than or equal
   */
  lte(column: string, value: any): MockQueryBuilder<T> {
    this.filters.push({ column, operator: "lte", value });
    return this;
  }

  /**
   * Filter: in array
   */
  in(column: string, values: any[]): MockQueryBuilder<T> {
    this.filters.push({ column, operator: "in", value: values });
    return this;
  }

  /**
   * Filter: is (for null, true, false)
   */
  is(column: string, value: any): MockQueryBuilder<T> {
    this.filters.push({ column, operator: "is", value });
    return this;
  }

  /**
   * Filter: like pattern match
   */
  like(column: string, pattern: string): MockQueryBuilder<T> {
    this.filters.push({ column, operator: "like", value: pattern });
    return this;
  }

  /**
   * Filter: case-insensitive like
   */
  ilike(column: string, pattern: string): MockQueryBuilder<T> {
    this.filters.push({ column, operator: "ilike", value: pattern });
    return this;
  }

  /**
   * Filter: contains
   */
  contains(column: string, value: any): MockQueryBuilder<T> {
    this.filters.push({ column, operator: "contains", value });
    return this;
  }

  /**
   * Order results
   */
  order(
    column: string,
    options?: { ascending?: boolean }
  ): MockQueryBuilder<T> {
    this.orders.push({
      column,
      ascending: options?.ascending !== false,
    });
    return this;
  }

  /**
   * Limit results
   */
  limit(count: number): MockQueryBuilder<T> {
    this.limitCount = count;
    return this;
  }

  /**
   * Return single result
   */
  single(): MockQueryBuilder<T> {
    this.isSingle = true;
    this.limitCount = 1;
    return this;
  }

  /**
   * Return single result or null
   */
  maybeSingle(): MockQueryBuilder<T> {
    this.isSingle = true;
    this.limitCount = 1;
    return this;
  }

  /**
   * Execute the query (make it thenable for Promise compatibility)
   */
  async then(
    resolve: (value: MockResponse<T>) => void,
    reject?: (reason: any) => void
  ): Promise<MockResponse<T>> {
    try {
      const result = await this.execute();
      resolve(result);
      return result;
    } catch (error: any) {
      const errorResult: MockResponse<T> = {
        data: null,
        error: {
          message: error.message || "Query failed",
          code: "query_error",
        },
      };
      if (reject) reject(errorResult);
      return errorResult;
    }
  }

  /**
   * Execute the query
   */
  private async execute(): Promise<MockResponse<T>> {
    // Simulate network delay
    await this.simulateDelay();

    try {
      let data: any = null;

      switch (this.operation) {
        case "select":
          data = mockDataService.query(
            this.table,
            this.filters,
            this.orders,
            this.limitCount,
            this.offsetCount
          );

          // If single mode, return just one record
          if (this.isSingle) {
            data = data.length > 0 ? data[0] : null;
          }
          break;

        case "insert":
          data = mockDataService.insert(this.table, this.insertData!);

          // Trigger realtime event
          const insertedRecords = Array.isArray(this.insertData)
            ? data
            : [data[0]];
          insertedRecords.forEach((record: any) => {
            triggerRealtimeEvent(this.table, "INSERT", record);
          });

          // If single mode or single insert, return just one record
          if (this.isSingle || !Array.isArray(this.insertData)) {
            data = data[0];
          }
          break;

        case "update":
          data = mockDataService.update(
            this.table,
            this.updateData!,
            this.filters
          );

          // Trigger realtime events
          data.forEach((record: any) => {
            triggerRealtimeEvent(this.table, "UPDATE", record);
          });

          // If single mode, return just one record
          if (this.isSingle) {
            data = data.length > 0 ? data[0] : null;
          }
          break;

        case "delete":
          data = mockDataService.delete(this.table, this.filters);

          // Trigger realtime events
          data.forEach((record: any) => {
            triggerRealtimeEvent(this.table, "DELETE", record);
          });

          break;
      }

      return {
        data: data as T,
        error: null,
      };
    } catch (error: any) {
      console.error(`[Mock Client] Query error on ${this.table}:`, error);
      return {
        data: null,
        error: {
          message: error.message || "Query failed",
          code: "query_error",
        },
      };
    }
  }

  /**
   * Simulate network delay
   */
  private async simulateDelay(): Promise<void> {
    const delay = Math.random() * 100 + 50; // 50-150ms
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}

/**
 * Create mock Supabase client
 */
export function createMockSupabaseClient(): MockSupabaseClient {
  // Initialize mock data on first use
  if (typeof window !== "undefined") {
    mockDataService.initialize().catch((error) => {
      console.error("[Mock Client] Failed to initialize:", error);
    });
  }

  return {
    /**
     * Query table
     */
    from: <T = any>(table: string): MockQueryBuilder<T> => {
      return new MockQueryBuilderImpl<T>(table as MockTable);
    },

    /**
     * Auth client
     */
    auth: mockAuthService,

    /**
     * Storage client
     */
    storage: mockStorageService,

    /**
     * Realtime channel
     */
    channel: (name: string) => {
      return mockRealtimeService.channel(name);
    },

    /**
     * Remove realtime channel
     */
    removeChannel: async (channel: any): Promise<void> => {
      try {
        if (channel && typeof channel.unsubscribe === "function") {
          await channel.unsubscribe();
        }
        console.log("[Mock Realtime] Channel removed");
      } catch (error) {
        console.error("[Mock Realtime] Error removing channel:", error);
      }
    },

    /**
     * RPC function calls
     */
    rpc: async (
      functionName: string,
      params?: any
    ): Promise<MockResponse<any>> => {
      try {
        const data = await mockDataService.rpc(functionName, params);
        return {
          data,
          error: null,
        };
      } catch (error: any) {
        return {
          data: null,
          error: {
            message: error.message || "RPC call failed",
            code: "rpc_error",
          },
        };
      }
    },
  };
}
