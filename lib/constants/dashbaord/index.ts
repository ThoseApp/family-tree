import { NavLink } from "@/lib/types";
import {
  SettingsIcon,
  Hourglass,
  Grid2x2,
  TreesIcon,
  UsersIcon,
  ClipboardList,
  ImageIcon,
  CalendarIcon,
  LogOutIcon,
} from "lucide-react";

export const navLinksTopSection: NavLink[] = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: Grid2x2,
  },
  {
    label: "History",
    href: "/dashboard/history",
    icon: Hourglass,
  },
  {
    label: "Family Tree",
    href: "/dashboard/family-tree",
    icon: TreesIcon,
  },
  {
    label: "Notice Board",
    href: "/dashboard/notice-board",
    icon: ClipboardList,
  },
  {
    label: "Family Members",
    href: "/dashboard/family-members",
    icon: UsersIcon,
  },
  {
    label: "Events",
    href: "/dashboard/events",
    icon: CalendarIcon,
  },
  {
    label: "Gallery",
    href: "/dashboard/gallery",
    icon: ImageIcon,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: SettingsIcon,
  },
];

export const navLinksBottomSection: NavLink[] = [
  {
    label: "Logout",
    href: "/dashboard/logout",
    icon: LogOutIcon,
  },
];
