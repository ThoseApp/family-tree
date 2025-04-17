import { LucideIcon } from "lucide-react";

export type NavLink = {
  label: string;
  href: string;
  icon?: LucideIcon;
};

export interface UserProfile {
  id: string;
  user_id: string;
  email: string;

  // TODO: Add more fields

  created_at: string;
  updated_at: string;
}
