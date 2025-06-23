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
} from "lucide-react";
import { dummyProfileImage } from "..";

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
    label: "Events",
    href: "/dashboard/events",
    icon: CalendarIcon,
  },
  {
    label: "Invitations",
    href: "/dashboard/invitations",
    icon: Mail,
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

export const dummyUpcomingEvents = [
  {
    imageUrl: dummyProfileImage,
    name: "Family Reunion",
    description: "Hosted by Segun Demola",
    date: {
      month: "May",
      day: "12",
    },
  },
  {
    imageUrl: dummyProfileImage,
    name: "Marriage Anniversary",
    description: "Hosted by Segun Demola",
    date: {
      month: "May",
      day: "12",
    },
  },
  {
    imageUrl: dummyProfileImage,
    name: "Baby Shower",
    description: "Hosted by Segun Demola",
    date: {
      month: "May",
      day: "12",
    },
  },
  {
    imageUrl: dummyProfileImage,
    name: "Wedding Ceremony",
    description: "Hosted by Segun Demola",
    date: {
      month: "May",
      day: "12",
    },
  },

  {
    imageUrl: dummyProfileImage,
    name: "Baby Shower",
    description: "Hosted by Segun Demola",
    date: {
      month: "May",
      day: "12",
    },
  },
];

export const dummyNewAlbumCreation = [
  {
    imageUrl: dummyProfileImage,
    name: "Album 1",
  },
  {
    imageUrl: dummyProfileImage,
    name: "Album 2",
  },
  {
    imageUrl: dummyProfileImage,
    name: "Album 3",
  },
  {
    imageUrl: dummyProfileImage,
    name: "Album 4",
  },
  {
    imageUrl: dummyProfileImage,
    name: "Album 5",
  },
  {
    imageUrl: dummyProfileImage,
    name: "Album 6",
  },
];

export const dummyFamilyMembers: FamilyMember[] = [
  {
    id: "1",
    name: "string",
    gender: "string",
    description: "string",
    imageSrc: dummyProfileImage,
    birthDate: "string",
    fatherName: "string",
    motherName: "string",
    orderOfBirth: 1,
    spouseName: "string",
    orderOfMarriage: 1,
  },
  {
    id: "7",
    name: "string",
    gender: "string",
    description: "string",
    imageSrc: dummyProfileImage,
    birthDate: "string",
    fatherName: "string",
    motherName: "string",
    orderOfBirth: 7,
    spouseName: "string",
    orderOfMarriage: 7,
  },
  {
    id: "2",
    name: "string",
    gender: "string",
    description: "string",
    imageSrc: dummyProfileImage,
    birthDate: "string",
    fatherName: "string",
    motherName: "string",
    orderOfBirth: 2,
    spouseName: "string",
    orderOfMarriage: 2,
  },
  {
    id: "3",
    name: "string",
    gender: "string",
    description: "string",
    imageSrc: dummyProfileImage,
    birthDate: "string",
    fatherName: "string",
    motherName: "string",
    orderOfBirth: 3,
    spouseName: "string",
    orderOfMarriage: 3,
  },
  {
    id: "4",
    name: "string",
    gender: "string",
    description: "string",
    imageSrc: dummyProfileImage,
    birthDate: "string",
    fatherName: "string",
    motherName: "string",
    orderOfBirth: 4,
    spouseName: "string",
    orderOfMarriage: 4,
  },
  {
    id: "5",
    name: "string",
    gender: "string",
    description: "string",
    imageSrc: dummyProfileImage,
    birthDate: "string",
    fatherName: "string",
    motherName: "string",
    orderOfBirth: 5,
    spouseName: "string",
    orderOfMarriage: 5,
  },
];

export const dummyNotifications: Notification[] = [
  {
    id: "1",
    title: "Notification 1",
    body: "Notification body",
    read: false,
    image: dummyProfileImage,
  },
  {
    id: "2",
    title: "Notification 2",
    body: "Notification body",
    read: false,
    image: dummyProfileImage,
  },
  {
    id: "3",
    title: "Notification 3",
    body: "Notification body",
    read: true,
    image: dummyProfileImage,
  },
  {
    id: "4",
    title: "Notification 4",
    body: "Notification body",
    read: false,
    image: dummyProfileImage,
  },
  {
    id: "5",
    title: "Notification 5",
    body: "Notification body",
    read: false,
    image: dummyProfileImage,
  },
  {
    id: "6",
    title: "Notification 6",
    body: "Notification body",
    read: true,
    image: dummyProfileImage,
  },
  {
    id: "7",
    title: "Notification 7",
    body: "Notification body",
    read: false,
    image: dummyProfileImage,
  },
];

export const dummyEvents: Event[] = [
  {
    id: "1",
    name: "Ev ent 1",
    date: "2021-01-01",
    category: "string",
    user_id: "string",
  },
  {
    id: "2",
    name: "Event 2",
    date: "2021-01-01",
    category: "string",
    user_id: "string",
  },
  {
    id: "3",
    name: "Event 3",
    date: "2021-01-01",
    category: "string",
    user_id: "string",
  },

  {
    id: "4",
    name: "Event 4",
    date: "2021-01-01",
    category: "string",
    user_id: "string",
  },
];

export const dummyGallery: GalleryType[] = [
  {
    id: "1",
    caption: "Gallery 1",
    url: dummyProfileImage,
    file_size: 100,
    uploaded_at: "2021-01-01",
    user_id: "string",
    file_name: "string",
    created_at: "2021-01-01",
    updated_at: "2021-01-01",
  },
  {
    id: "2",
    caption: "Gallery 2",
    url: dummyProfileImage,
    file_size: 100,
    uploaded_at: "2021-01-01",
    user_id: "string",
    file_name: "string",
    created_at: "2021-01-01",
    updated_at: "2021-01-01",
  },
  {
    id: "3",
    caption: "Gallery 3",
    url: dummyProfileImage,
    file_size: 100,
    uploaded_at: "2021-01-01",
    user_id: "string",
    file_name: "string",
    created_at: "2021-01-01",
    updated_at: "2021-01-01",
  },
  {
    id: "4",
    caption: "Gallery 4",
    url: dummyProfileImage,
    file_size: 100,
    uploaded_at: "2021-01-01",
    user_id: "string",
    file_name: "string",
    created_at: "2021-01-01",
    updated_at: "2021-01-01",
  },
  {
    id: "5",
    caption: "Gallery 5",
    url: dummyProfileImage,
    file_size: 100,
    uploaded_at: "2021-01-01",
    user_id: "string",
    file_name: "string",
    created_at: "2021-01-01",
    updated_at: "2021-01-01",
  },
];

export const dummyNoticeBoard: NoticeBoard[] = [
  {
    id: "1",
    title: "Notice Board 1",
    description: "Notice Board description",
    image: dummyProfileImage,
    pinned: true,
    editor: "string",
    posteddate: "2021-01-01",
    postedtime: "10:00",
    tags: ["string", "string", "string"],
  },
  {
    id: "2",
    title: "Notice Board 2",
    description: "Notice Board description",
    image: dummyProfileImage,
    pinned: false,
    editor: "string",
    posteddate: "2021-01-01",
    postedtime: "10:00",
    tags: ["string", "string", "string"],
  },
  {
    id: "3",
    title: "Notice Board 3",
    description: "Notice Board description",
    image: dummyProfileImage,
    pinned: false,
    editor: "string",
    posteddate: "2021-01-01",
    postedtime: "10:00",
    tags: ["string", "string", "string"],
  },
  {
    id: "4",
    title: "Notice Board 4",
    description: "Notice Board description",
    image: dummyProfileImage,
    pinned: false,
    editor: "string",
    posteddate: "2021-01-01",
    postedtime: "10:00",
    tags: ["string", "string", "string"],
  },
  {
    id: "5",
    title: "Notice Board 5",
    description: "Notice Board description",
    image: dummyProfileImage,
    pinned: false,
    editor: "string",
    posteddate: "2021-01-01",
    postedtime: "10:00",
    tags: ["string", "string", "string"],
  },
  {
    id: "6",
    title: "Notice Board 6",
    description: "Notice Board description",
    image: dummyProfileImage,
    pinned: false,
    editor: "string",
    posteddate: "2021-01-01",
    postedtime: "10:00",
    tags: ["string", "string", "string"],
  },
];
