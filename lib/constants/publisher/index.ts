import { NavLink } from "@/lib/types";
import {
  Grid2x2,
  FileText,
  Clock,
  Calendar,
  CheckCircle,
  Settings,
  HomeIcon,
  ImageIcon,
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
    label: "Event Requests",
    href: "/publisher/event-requests",
    icon: CheckCircle,
  },
  {
    label: "Gallery",
    href: "/publisher/gallery",
    icon: ImageIcon,
  },
  {
    label: "Settings",
    href: "/publisher/settings",
    icon: Settings,
  },
];
