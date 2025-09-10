import {
  Event,
  FamilyMember,
  GalleryType,
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
  Mail,
  Clipboard,
  Shield,
  UserCheck,
  HomeIcon,
  UserPlus,
  Contact,
  ClipboardPenLine,
  ClipboardPlus,
  HelpCircle,
} from "lucide-react";
import { dummyProfileImage } from "..";

export const navLinksTopSection: NavLink[] = [
  {
    label: "Home",
    href: "/",
    icon: HomeIcon,
  },
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
    icon: UserPlus,
  },
  {
    label: "Publisher Management",
    href: "/admin/publisher-management",
    icon: Shield,
  },
  {
    label: "User Accounts",
    href: "/admin/user-accounts",
    icon: UserCheck,
  },

  {
    label: "Gallery Requests",
    href: "/admin/gallery-requests",
    icon: ClipboardList,
  },
  {
    label: "Notice Board Requests",
    href: "/admin/notice-board-requests",
    icon: ClipboardPlus,
  },
  {
    label: "Notice Board",
    href: "/admin/notice-board",
    icon: ClipboardPenLine,
  },
  // {
  //   label: "Timeline",
  //   href: "/admin/timeline",
  //   icon: ClipboardList,
  // },
  // {
  //   label: "History",
  //   href: "/admin/history",
  //   icon: Hourglass,
  // },
  {
    label: "Family Tree Upload",
    href: "/admin/family-tree",
    icon: TreesIcon,
  },
  {
    label: "Family Members",
    href: "/admin/family-members",
    icon: UsersIcon,
  },
  {
    label: "Family Member Requests",
    href: "/admin/family-member-requests",
    icon: Contact,
  },
  {
    label: "Gallery",
    href: "/admin/gallery",
    icon: ImageIcon,
  },
  {
    label: "Events",
    href: "/admin/events",
    icon: CalendarIcon,
  },
  {
    label: "Help Center",
    href: "/admin/help",
    icon: HelpCircle,
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: SettingsIcon,
  },
];
