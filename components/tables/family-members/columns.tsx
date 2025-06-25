"use client";

import { FamilyMember } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Edit, Trash2, MoreHorizontal, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const createColumns = (
  onEdit: (member: FamilyMember) => void,
  onDelete: (member: FamilyMember) => void
): ColumnDef<FamilyMember>[] => [
  {
    id: "s/n",
    header: "S/N",
    cell: ({ row }) => {
      return <div className="text-left">{row.index + 1}</div>;
    },
  },

  {
    id: "name",
    header: "Name",
    accessorKey: "name",
    cell({ row }) {
      const user = row.original;
      const initials = user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={user.imageSrc}
              alt={user.name}
              className="object-cover"
            />
            <AvatarFallback className="text-xs">
              {initials || <User className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
          <p className="text-sm text-left">{user.name}</p>
        </div>
      );
    },
  },

  {
    id: "gender",
    header: "Gender",
    accessorKey: "gender",
    cell(props) {
      const { row } = props;
      const user = row.original;

      return <p className="text-sm text-left">{user.gender || "N/A"}</p>;
    },
  },

  {
    id: "birthDate",
    header: "Birth Date",
    accessorKey: "birthDate",
    cell: ({ row }) => {
      const user = row.original;
      const birthDate = user.birthDate;

      return (
        <div className="text-left text-xs md:text-sm">
          {birthDate ? new Date(birthDate).toLocaleDateString() : "N/A"}
        </div>
      );
    },
  },

  {
    id: "fatherName",
    header: "Father Name",
    accessorKey: "fatherName",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className={cn("text-left text-xs md:text-sm")}>
          {user.fatherName || "N/A"}
        </div>
      );
    },
  },

  {
    id: "motherName",
    header: "Mother Name",
    accessorKey: "motherName",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className={cn("text-left text-xs md:text-sm")}>
          {user.motherName || "N/A"}
        </div>
      );
    },
  },

  {
    id: "orderOfBirth",
    header: "Order of Birth",
    accessorKey: "orderOfBirth",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="text-left text-xs md:text-sm">
          {user.orderOfBirth || "N/A"}
        </div>
      );
    },
  },

  {
    id: "spouseName",
    header: "Spouse Name",
    accessorKey: "spouseName",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="text-left text-xs md:text-sm">
          {user.spouseName || "N/A"}
        </div>
      );
    },
  },

  {
    id: "orderOfMarriage",
    header: "Order of Marriage",
    accessorKey: "orderOfMarriage",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="text-left text-xs md:text-sm">
          {user.orderOfMarriage || "N/A"}
        </div>
      );
    },
  },

  {
    id: "action",
    header: "Action",
    cell: ({ row }) => {
      const member = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(member)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(member)}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

// Default columns for backwards compatibility
export const columns: ColumnDef<FamilyMember>[] = createColumns(
  () => {},
  () => {}
);
