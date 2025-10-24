// Mock data types matching Supabase schema and query builder interface

export type MockFilterOperator =
  | "eq"
  | "neq"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "in"
  | "is"
  | "like"
  | "ilike"
  | "contains";

export interface MockFilter {
  column: string;
  operator: MockFilterOperator;
  value: any;
}

export interface MockOrder {
  column: string;
  ascending: boolean;
}

export interface MockQuery {
  table: string;
  select?: string;
  filters: MockFilter[];
  orders: MockOrder[];
  limit?: number;
  offset?: number;
  single?: boolean;
}

export interface MockResponse<T = any> {
  data: T | null;
  error: MockError | null;
}

export interface MockError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

export interface MockAuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number;
  token_type: string;
  user: MockUser;
}

export interface MockUser {
  id: string;
  email: string;
  user_metadata: Record<string, any>;
  app_metadata: Record<string, any>;
  created_at: string;
  email_confirmed_at?: string;
}

export interface MockAuthResponse {
  data: {
    user: MockUser | null;
    session: MockAuthSession | null;
  };
  error: MockError | null;
}

export interface MockStorageUploadResponse {
  data: {
    path: string;
    id: string;
    fullPath: string;
  } | null;
  error: MockError | null;
}

export interface MockRealtimeChannel {
  subscribe: (callback?: () => void) => MockRealtimeChannel;
  on: (
    event: string,
    filter: any,
    callback: (payload: any) => void
  ) => MockRealtimeChannel;
  unsubscribe: () => Promise<void>;
}

// Database table types
export type MockTable =
  | "profiles"
  | "family-tree"
  | "events"
  | "notice_boards"
  | "galleries"
  | "albums"
  | "history"
  | "notifications"
  | "event_invitations"
  | "family_member_requests"
  | "landing_page_sections"
  | "life_events";

export interface MockDatabase {
  profiles: any[];
  "family-tree": any[];
  events: any[];
  notice_boards: any[];
  galleries: any[];
  albums: any[];
  history: any[];
  notifications: any[];
  event_invitations: any[];
  family_member_requests: any[];
  landing_page_sections: any[];
  life_events: any[];
}

export interface MockAuthClient {
  signInWithPassword: (credentials: {
    email: string;
    password: string;
  }) => Promise<MockAuthResponse>;
  signInWithOAuth: (
    options: any
  ) => Promise<{ data: any; error: MockError | null }>;
  signUp: (credentials: any) => Promise<MockAuthResponse>;
  signOut: () => Promise<{ error: MockError | null }>;
  getSession: () => Promise<{
    data: { session: MockAuthSession | null };
    error: MockError | null;
  }>;
  getUser: () => Promise<{
    data: { user: MockUser | null };
    error: MockError | null;
  }>;
  updateUser: (
    attributes: any
  ) => Promise<{ data: { user: MockUser | null }; error: MockError | null }>;
  resetPasswordForEmail: (
    email: string,
    options?: any
  ) => Promise<{ data: any; error: MockError | null }>;
  resend: (params: any) => Promise<{ data: any; error: MockError | null }>;
  verifyOtp: (params: any) => Promise<MockAuthResponse>;
  onAuthStateChange: (
    callback: (event: string, session: MockAuthSession | null) => void
  ) => { data: { subscription: { unsubscribe: () => void } } };
}

export interface MockStorageClient {
  from: (bucket: string) => {
    upload: (
      path: string,
      file: File | Blob,
      options?: any
    ) => Promise<MockStorageUploadResponse>;
    download: (
      path: string
    ) => Promise<{ data: Blob | null; error: MockError | null }>;
    remove: (
      paths: string[]
    ) => Promise<{ data: any; error: MockError | null }>;
    getPublicUrl: (path: string) => { data: { publicUrl: string } };
  };
}

export interface MockQueryBuilder<T = any> {
  select: (columns?: string) => MockQueryBuilder<T>;
  insert: (data: any | any[]) => MockQueryBuilder<T>;
  update: (data: any) => MockQueryBuilder<T>;
  delete: () => MockQueryBuilder<T>;
  eq: (column: string, value: any) => MockQueryBuilder<T>;
  neq: (column: string, value: any) => MockQueryBuilder<T>;
  gt: (column: string, value: any) => MockQueryBuilder<T>;
  gte: (column: string, value: any) => MockQueryBuilder<T>;
  lt: (column: string, value: any) => MockQueryBuilder<T>;
  lte: (column: string, value: any) => MockQueryBuilder<T>;
  in: (column: string, values: any[]) => MockQueryBuilder<T>;
  is: (column: string, value: any) => MockQueryBuilder<T>;
  like: (column: string, pattern: string) => MockQueryBuilder<T>;
  ilike: (column: string, pattern: string) => MockQueryBuilder<T>;
  contains: (column: string, value: any) => MockQueryBuilder<T>;
  order: (
    column: string,
    options?: { ascending?: boolean }
  ) => MockQueryBuilder<T>;
  limit: (count: number) => MockQueryBuilder<T>;
  single: () => MockQueryBuilder<T>;
  maybeSingle: () => MockQueryBuilder<T>;
  then: (
    resolve: (value: MockResponse<T>) => void,
    reject?: (reason: any) => void
  ) => Promise<MockResponse<T>>;
}

export interface MockSupabaseClient {
  from: <T = any>(table: string) => MockQueryBuilder<T>;
  auth: MockAuthClient;
  storage: MockStorageClient;
  channel: (name: string) => MockRealtimeChannel;
  removeChannel: (channel: MockRealtimeChannel) => Promise<void>;
  rpc: (functionName: string, params?: any) => Promise<MockResponse<any>>;
}
