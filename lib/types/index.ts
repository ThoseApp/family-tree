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
  mothers_first_name: string;
  mothers_last_name: string;
  order_of_birth: number | null;
  order_of_marriage: number | null;
  marital_status: string;
  spouses_first_name: string;
  spouses_last_name: string;
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
