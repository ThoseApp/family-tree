import {
  HomeIcon,
  HistoryIcon,
  UsersIcon,
  CalendarIcon,
  ImageIcon,
  TreesIcon,
} from "lucide-react";

import { NavLink } from "@/lib/types";

export const navLinks: NavLink[] = [
  {
    label: "Home",
    href: "/",
    icon: HomeIcon,
  },
  {
    label: "History",
    href: "/history",
    icon: HistoryIcon,
  },
  {
    label: "Family Tree",
    href: "/family-tree",
    icon: TreesIcon,
  },
  {
    label: "Family Members",
    href: "/family-members",
    icon: UsersIcon,
  },
  {
    label: "Events",
    href: "/events",
    icon: CalendarIcon,
  },
  {
    label: "Gallery",
    href: "/gallery",
    icon: ImageIcon,
  },
];
