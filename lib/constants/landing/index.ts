import {
  HomeIcon,
  HistoryIcon,
  UsersIcon,
  CalendarIcon,
  ImageIcon,
  TreesIcon,
} from "lucide-react";

import { NavLink } from "@/lib/types";
import { dummyProfileImage } from "../index";

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

export const historyCards = [
  {
    imageSrc: dummyProfileImage,
    name: "Name Surname",
    description: "Lorem ipsum dotle lorem ipsum dotle lorem ipsum dot",
  },
  {
    imageSrc: dummyProfileImage,
    name: "Name Surname",
    description: "Lorem ipsum dotle lorem ipsum dotle lorem ipsum dot",
  },
  {
    imageSrc: dummyProfileImage,
    name: "Name Surname",
    description: "Lorem ipsum dotle lorem ipsum dotle lorem ipsum dot",
  },
  {
    imageSrc: dummyProfileImage,
    name: "Name Surname",
    description: "Lorem ipsum dotle lorem ipsum dotle lorem ipsum dot",
  },
];

export const familyMembers = [
  {
    imageSrc: dummyProfileImage,
    alt: "Family Member 1",
    width: "300px",
    height: "563px",
  },
  {
    imageSrc: dummyProfileImage,
    alt: "Family Member 2",
    width: "300px",
    height: "369px",
  },
  {
    imageSrc: dummyProfileImage,
    alt: "Family Member 3",
    width: "300px",
    height: "269px",
  },
  {
    imageSrc: dummyProfileImage,
    alt: "Family Member 4",
    width: "300px",
    height: "464px",
  },
  {
    imageSrc: dummyProfileImage,
    alt: "Family Member 5",
    width: "300px",
    height: "563px",
  },
];

export const eventCategories = [
  {
    title: "Birthdays",
    items: [
      {
        imageUrl: dummyProfileImage,
        date: {
          month: "January",
          day: "1",
        },
      },
      {
        imageUrl: dummyProfileImage,
        date: {
          month: "January",
          day: "1",
        },
      },
    ],
  },
  {
    title: "Anniversaries",
    items: [
      {
        imageUrl: dummyProfileImage,
        date: {
          month: "January",
          day: "1",
        },
      },
      {
        imageUrl: dummyProfileImage,
      },
    ],
  },
  {
    title: "Dedications",
    items: [
      {
        imageUrl: dummyProfileImage,
      },
      {
        imageUrl: dummyProfileImage,
      },
    ],
  },
  {
    title: "Other Events",
    items: [
      {
        imageUrl: dummyProfileImage,
      },
      {
        imageUrl: dummyProfileImage,
      },
    ],
  },
];
