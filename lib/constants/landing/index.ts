import {
  HomeIcon,
  HistoryIcon,
  UsersIcon,
  CalendarIcon,
  ImageIcon,
  TreesIcon,
  Clipboard,
} from "lucide-react";

import { FamilyMember, NavLink } from "@/lib/types";
import { dummyProfileImage } from "../index";
import { GalleryProps } from "@/components/gallery";

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
  {
    label: "Notice Board",
    href: "/notice-board",
    icon: Clipboard,
  },
];

export const historyCards = [
  {
    imageSrc: dummyProfileImage,
    name: "Egundebi Atotileto Mosuro",
    description: "",
  },
  {
    imageSrc: dummyProfileImage,
    name: "Abdul-Kareem Gbokoyi Mosuro",
    description: "",
  },
  {
    imageSrc: dummyProfileImage,
    name: "Rufai Banjoko Mosuro",
    description: "",
  },
  {
    imageSrc: dummyProfileImage,
    name: "Olufowoke Jeminatu Mosuro",
    description: "",
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
        name: "John's Birthday",
        date: {
          month: "January",
          day: "15",
        },
      },
      {
        imageUrl: dummyProfileImage,
        name: "Sarah's Birthday",
        date: {
          month: "February",
          day: "22",
        },
      },
    ],
  },
  {
    title: "Anniversaries",
    items: [
      {
        imageUrl: dummyProfileImage,
        name: "Wedding Anniversary",
        date: {
          month: "March",
          day: "10",
        },
      },
      {
        imageUrl: dummyProfileImage,
        name: "First Date Anniversary",
        date: {
          month: "April",
          day: "5",
        },
      },
    ],
  },
  {
    title: "Dedications",
    items: [
      {
        imageUrl: dummyProfileImage,
        name: "Memorial Service",
        date: {
          month: "May",
          day: "18",
        },
      },
      {
        imageUrl: dummyProfileImage,
        name: "Dedication Ceremony",
        date: {
          month: "June",
          day: "12",
        },
      },
    ],
  },
  {
    title: "Other Events",
    items: [
      {
        imageUrl: dummyProfileImage,
        name: "Family Reunion",
        date: {
          month: "July",
          day: "4",
        },
      },
      {
        imageUrl: dummyProfileImage,
        name: "Holiday Gathering",
        date: {
          month: "December",
          day: "25",
        },
      },
    ],
  },
];

export const galleryImages: any = [
  {
    url: dummyProfileImage,
    date: "2023-01-01",
    title: "Family Reunion 2023",
  },
  {
    url: dummyProfileImage,
    date: "2023-02-14",
    title: "Valentine's Day Celebration",
  },
  {
    url: dummyProfileImage,
    date: "2023-03-17",
    title: "St. Patrick's Day Party",
  },
  {
    url: dummyProfileImage,
    date: "2023-04-01",
    title: "April Fool's Day Prank",
  },
  {
    url: dummyProfileImage,
    date: "2023-05-05",
    title: "Cinco de Mayo Fiesta",
  },
  {
    url: dummyProfileImage,
    date: "2023-06-21",
    title: "Summer Solstice Celebration",
  },
  {
    url: dummyProfileImage,
    date: "2023-07-04",
    title: "Independence Day BBQ",
  },
  {
    url: dummyProfileImage,
    date: "2023-08-31",
    title: "End of Summer Bash",
  },
  {
    url: dummyProfileImage,
    date: "2023-09-22",
    title: "Fall Equinox Gathering",
  },
  {
    url: dummyProfileImage,
    date: "2023-10-31",
    title: "Halloween Costume Party",
  },
  {
    url: dummyProfileImage,
    date: "2023-11-25",
    title: "Thanksgiving Dinner",
  },
  {
    url: dummyProfileImage,
    date: "2023-12-25",
    title: "Christmas Family Gathering",
  },
];

export const dummyFamilyMembers: FamilyMember[] = [
  {
    id: "1",
    name: "John Doe",
    description: "John Doe is a software engineer at Google",
    imageSrc: dummyProfileImage,
    birthDate: "2023-01-01",
  },
  {
    id: "2",
    name: "Jane Doe",
    description: "Jane Doe is a software engineer at Google",
    imageSrc: dummyProfileImage,
    birthDate: "2023-01-01",
  },
  {
    id: "3",
    name: "John Doe",
    description: "John Doe is a software engineer at Google",
    imageSrc: dummyProfileImage,
    birthDate: "2023-01-01",
  },
  {
    id: "4",
    name: "John Doe",
    description: "John Doe is a software engineer at Google",
    imageSrc: dummyProfileImage,
    birthDate: "2023-01-01",
  },
  {
    id: "5",
    name: "John Doe",
    description: "John Doe is a software engineer at Google",
    imageSrc: dummyProfileImage,
    birthDate: "2023-01-01",
  },
  {
    id: "6",
    name: "John Doe",
    description: "John Doe is a software engineer at Google",
    imageSrc: dummyProfileImage,
    birthDate: "2023-01-01",
  },
  {
    id: "7",
    name: "John Doe",
    description: "John Doe is a software engineer at Google",
    imageSrc: dummyProfileImage,
    birthDate: "2023-01-01",
  },
];

export const dummyEvents = {
  birthdays: [
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
    {
      imageUrl: dummyProfileImage,
      date: {
        month: "January",
        day: "1",
      },
    },
  ],
  anniversary: [
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
  reunions: [
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
};
