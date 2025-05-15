import { LucideIcon } from "lucide-react";

export type NavLink = {
  label: string;
  href: string;
  icon?: LucideIcon;
};

export interface UserProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  relative: string;
  relationship_to_relative: string;
  date_of_birth: string;

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

export interface Event {
  id: string;
  name: string;
  date: string;
  category: string;
  description?: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  read: boolean;
  image: string;
}

export interface Gallery {
  id: string;
  name: string;
  image: string;
  fileSize: number;
  uploadDate: string;
  uploadTime: string;
  uploader: string;
}

export interface NoticeBoard {
  id: string;
  title: string;
  description: string;
  image: string;
  pinned: boolean;
  editor: string;
  postedDate: string;
  postedTime: string;
  tags: string[];
}

// API Response
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  errors: string[];
  message: string;
}
