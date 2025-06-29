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
import { DataTableColumnHeader } from "@/components/ui/table-reusuable/data-table-column-header";

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
    enableSorting: false,
  },

  {
    id: "name",
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
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
    sortingFn: "alphanumeric",
  },

  {
    id: "gender",
    accessorKey: "gender",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Gender" />
    ),
    cell(props) {
      const { row } = props;
      const user = row.original;

      return <p className="text-sm text-left">{user.gender || "N/A"}</p>;
    },
    sortingFn: "alphanumeric",
  },

  {
    id: "birthDate",
    accessorKey: "birthDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Birth Date" />
    ),
    cell: ({ row }) => {
      const user = row.original;
      const birthDate = user.birthDate;

      return (
        <div className="text-left text-xs md:text-sm">
          {birthDate ? new Date(birthDate).toLocaleDateString() : "N/A"}
        </div>
      );
    },
    sortingFn: (rowA, rowB, columnId) => {
      const dateA = rowA.getValue(columnId) as string;
      const dateB = rowB.getValue(columnId) as string;

      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;

      return new Date(dateA).getTime() - new Date(dateB).getTime();
    },
  },

  {
    id: "fatherName",
    accessorKey: "fatherName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Father Name" />
    ),
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className={cn("text-left text-xs md:text-sm")}>
          {user.fatherName || "N/A"}
        </div>
      );
    },
    sortingFn: "alphanumeric",
  },

  {
    id: "motherName",
    accessorKey: "motherName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mother Name" />
    ),
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className={cn("text-left text-xs md:text-sm")}>
          {user.motherName || "N/A"}
        </div>
      );
    },
    sortingFn: "alphanumeric",
  },

  {
    id: "orderOfBirth",
    accessorKey: "orderOfBirth",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Order of Birth" />
    ),
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="text-left text-xs md:text-sm">
          {user.orderOfBirth || "N/A"}
        </div>
      );
    },
    sortingFn: (rowA, rowB, columnId) => {
      const orderA = rowA.getValue(columnId) as number;
      const orderB = rowB.getValue(columnId) as number;

      if (!orderA && !orderB) return 0;
      if (!orderA) return 1;
      if (!orderB) return -1;

      return orderA - orderB;
    },
  },

  {
    id: "spouseName",
    accessorKey: "spouseName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Spouse Name" />
    ),
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="text-left text-xs md:text-sm">
          {user.spouseName || "N/A"}
        </div>
      );
    },
    sortingFn: "alphanumeric",
  },

  {
    id: "orderOfMarriage",
    accessorKey: "orderOfMarriage",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Order of Marriage" />
    ),
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="text-left text-xs md:text-sm">
          {user.orderOfMarriage || "N/A"}
        </div>
      );
    },
    sortingFn: (rowA, rowB, columnId) => {
      const orderA = rowA.getValue(columnId) as number;
      const orderB = rowB.getValue(columnId) as number;

      if (!orderA && !orderB) return 0;
      if (!orderA) return 1;
      if (!orderB) return -1;

      return orderA - orderB;
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
    enableSorting: false,
  },
];

// Default columns for backwards compatibility
export const columns: ColumnDef<FamilyMember>[] = createColumns(
  () => {},
  () => {}
);
