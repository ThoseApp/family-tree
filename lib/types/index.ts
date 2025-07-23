import { LucideIcon } from "lucide-react";
import {
  NotificationTypeEnum,
  GalleryStatusEnum,
  UserStatusEnum,
} from "../constants/enums";

export type NavLink = {
  label: string;
  href: string;
  icon?: LucideIcon;
};

export interface LifeEvent {
  id: string;
  year: string;
  title: string;
  description?: string;
  date?: string; // Optional specific date if more precise than year
  created_at?: string;
  updated_at?: string;
}

export interface EventInvitation {
  id: string;
  event_id: string;
  inviter_id: string; // User who sent the invitation
  invitee_id: string; // User who received the invitation
  status: "pending" | "accepted" | "declined";
  message?: string; // Optional message from inviter
  responded_at?: string;
  created_at: string;
  updated_at: string;
  // Populated fields for easier display
  event?: Event;
  inviter?: {
    first_name: string;
    last_name: string;
    image?: string;
  };
  invitee?: {
    first_name: string;
    last_name: string;
    image?: string;
  };
}

export interface UserProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  relative: string;
  relationship_to_relative: string;
  date_of_birth: string;
  image: string;
  bio: string;
  email: string;
  status?: keyof typeof UserStatusEnum;
  role?: "admin" | "publisher" | "user";
  family_tree_uid?: string; // Link to family-tree table unique_id

  gender?: string;
  timeline?: any; // JSONB type
  marital_status?: string;
  occupation?: string;

  created_at: string;
  updated_at: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  gender?: string;
  description: string;
  imageSrc: string;
  birthDate: string;
  fatherName?: string;
  motherName?: string;
  orderOfBirth?: number;
  spouseName?: string;
  orderOfMarriage?: number;
}

// Database family member structure from family-tree table
export interface ProcessedMember {
  id?: number;
  picture_link: string;
  unique_id: string;
  gender: string;
  first_name: string;
  last_name: string;
  fathers_first_name: string;
  fathers_last_name: string;
  fathers_uid?: string;
  mothers_first_name: string;
  mothers_last_name: string;
  mothers_uid?: string;
  order_of_birth: number | null;
  order_of_marriage: number | null;
  marital_status: string;
  spouses_first_name: string;
  spouses_last_name: string;
  spouse_uid?: string;
  date_of_birth: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Event {
  id: string;
  name: string;
  user_id: string;
  date: string | { month: string; day: string };
  category: string;
  description?: string;
  image?: string;
  status?: "pending" | "approved" | "rejected";
  is_public?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Notification {
  id: string;
  title: string;
  resource_id?: string;
  type?: keyof typeof NotificationTypeEnum;
  body: string;
  read: boolean;
  image?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface GalleryType {
  id?: string;
  url: string;
  caption?: string;
  album?: string;
  album_id?: string;
  uploaded_at?: string;
  user_id: string;
  file_name: string;
  file_size: number;
  folder?: string;
  status?: keyof typeof GalleryStatusEnum;
  created_at: string;
  updated_at?: string;
}

export interface NoticeBoard {
  id: string;
  title: string;
  description: string;
  image: string;
  pinned: boolean;
  editor: string;
  posteddate: string;
  postedtime: string;
  tags: string[];
  status?: "pending" | "approved" | "rejected";
  user_id?: string;
}

export interface HistoryItem {
  id: string;
  year: string;
  title: string;
  description: string;
  created_at?: string;
  updated_at?: string;
}

// API Response
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  errors: string[];
  message: string;
}

export interface MediaItem {
  id: string;
  type: "image" | "video";
  url: string;
  thumbnailUrl?: string;
  caption?: string;
  uploadedBy: string;
  uploadedAt: string;
  albumId?: string;
  tags?: string[];
}

export interface Album {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  coverImageUrl?: string;
  mediaItems: MediaItem[];
}

export interface LandingPageSection {
  id?: string;
  section_type:
    | "hero"
    | "gallery_preview"
    | "upcoming_events"
    | "history"
    | "family_members"
    | "family_tree";
  title: string;
  subtitle?: string;
  description?: string;
  image_url?: string;
  content?: any; // JSON content for flexible data
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface LandingPageContent {
  hero: LandingPageSection;
  gallery_preview: LandingPageSection;
  upcoming_events: LandingPageSection;
  history: LandingPageSection;
  family_members: LandingPageSection;
  family_tree: LandingPageSection;
}

export interface MemberRequest {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  date_of_birth?: string;
  relative?: string;
  relationship_to_relative?: string;
  status: keyof typeof UserStatusEnum;
  image?: string;
  created_at: string;
  updated_at?: string;
}

// User role utility types and functions
export type UserRole = "admin" | "publisher" | "user";

export interface UserRolePermissions {
  canManageUsers: boolean;
  canManageSettings: boolean;
  canApproveContent: boolean;
  canCreatePublicContent: boolean;
  canAccessAdminPanel: boolean;
  canAccessPublisherPanel: boolean;
}

// Role permission helpers
export const getUserRoleFromMetadata = (user: any): UserRole => {
  if (user?.user_metadata?.is_admin === true) return "admin";
  if (user?.user_metadata?.is_publisher === true) return "publisher";
  return "user";
};

export const getRolePermissions = (role: UserRole): UserRolePermissions => {
  switch (role) {
    case "admin":
      return {
        canManageUsers: true,
        canManageSettings: true,
        canApproveContent: true,
        canCreatePublicContent: true,
        canAccessAdminPanel: true,
        canAccessPublisherPanel: false,
      };
    case "publisher":
      return {
        canManageUsers: false,
        canManageSettings: false,
        canApproveContent: true,
        canCreatePublicContent: true,
        canAccessAdminPanel: false,
        canAccessPublisherPanel: true,
      };
    case "user":
      return {
        canManageUsers: false,
        canManageSettings: false,
        canApproveContent: false,
        canCreatePublicContent: false,
        canAccessAdminPanel: false,
        canAccessPublisherPanel: false,
      };
  }
};

// Family Member Account Creation Types
export interface FamilyMemberAccountCreation {
  familyMemberId: string; // unique_id from family-tree table
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  dateOfBirth?: string;
}

export interface AccountCreationResult {
  success: boolean;
  userId?: string;
  email?: string;
  password?: string;
  error?: string;
}

export interface BulkAccountCreationRequest {
  accounts: FamilyMemberAccountCreation[];
}

export interface BulkAccountCreationResult {
  totalRequested: number;
  successCount: number;
  failureCount: number;
  results: AccountCreationResult[];
  errors: string[];
}

export interface EmailCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  familyMemberId: string;
}
