import {
  Event,
  FamilyMember,
  Gallery,
  NavLink,
  NoticeBoard,
  Notification,
} from "@/lib/types";
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
import { dummyProfileImage } from "..";

export const navLinksTopSection: NavLink[] = [
  {
    label: "Overview",
    href: "/admin",
    icon: Grid2x2,
  },
  {
    label: "Manage Landing Page",
    href: "/admin/manage-landing-page",
    icon: Hourglass,
  },
  {
    label: "Member Requests",
    href: "/admin/member-requests",
    icon: TreesIcon,
  },
  {
    label: "Gallery Requests",
    href: "/admin/gallery-requests",
    icon: ClipboardList,
  },
  {
    label: "Notice Board",
    href: "/admin/notice-board",
    icon: UsersIcon,
  },
  {
    label: "History",
    href: "/admin/history",
    icon: Hourglass,
  },
  {
    label: "Family Tree",
    href: "/admin/family-tree",
    icon: TreesIcon,
  },
  {
    label: "Family Members",
    href: "/admin/family-members",
    icon: UsersIcon,
  },
  {
    label: "Events",
    href: "/admin/events",
    icon: CalendarIcon,
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: SettingsIcon,
  },
];
