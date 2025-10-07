import { NavLink } from "@/lib/types";
import {
  Grid2x2,
  FileText,
  Clock,
  Calendar,
  Settings,
  HomeIcon,
  ImageIcon,
  HelpCircle,
  ClipboardList,
} from "lucide-react";

export const navLinksTopSection: NavLink[] = [
  {
    label: "Home",
    href: "/",
    icon: HomeIcon,
  },
  {
    label: "Overview",
    href: "/publisher",
    icon: Grid2x2,
  },
  {
    label: "Notice Board",
    href: "/publisher/notice-board",
    icon: FileText,
  },
  {
    label: "Notice Requests",
    href: "/publisher/notice-board-requests",
    icon: Clock,
  },
  {
    label: "Events",
    href: "/publisher/events",
    icon: Calendar,
  },

  {
    label: "Gallery",
    href: "/publisher/gallery",
    icon: ImageIcon,
  },
  {
    label: "Gallery Requests",
    href: "/publisher/gallery-requests",
    icon: ClipboardList,
  },
  {
    label: "Help Center",
    href: "/publisher/help",
    icon: HelpCircle,
  },
  {
    label: "Settings",
    href: "/publisher/settings",
    icon: Settings,
  },
];
