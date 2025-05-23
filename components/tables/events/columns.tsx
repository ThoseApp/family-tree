"use client";

import { Event } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { format, parseISO } from "date-fns";

// Helper function to format date strings
const formatDate = (dateStr: string) => {
  try {
    return format(parseISO(dateStr), "PPP"); // e.g., April 12, 2023
  } catch (e) {
    return dateStr; // Fallback to original string if parsing fails
  }
};

export const createColumns = (
  onEditClick?: (event: Event) => void,
  onDeleteClick?: (id: string) => void
): ColumnDef<Event>[] => [
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
      const event = row.original;
      return <p className="text-sm text-left font-medium">{event.name}</p>;
    },
  },

  {
    id: "date",
    header: "Date",
    accessorKey: "date",
    cell(props) {
      const { row } = props;
      const event = row.original;
      return (
        <p className="text-sm text-left">
          {typeof event.date === "string"
            ? formatDate(event.date)
            : formatDate(event.date.month + " " + event.date.day)}
        </p>
      );
    },
  },

  {
    id: "category",
    header: "Category",
    accessorKey: "category",
    cell: ({ row }) => {
      const event = row.original;
      return (
        <div
          className={cn(
            "text-left text-xs md:text-sm px-2 py-1 rounded-full w-fit",
            event.category === "Birthday" && "bg-blue-100 text-blue-800",
            event.category === "Wedding" && "bg-pink-100 text-pink-800",
            event.category === "Anniversary" && "bg-purple-100 text-purple-800",
            event.category === "Reunion" && "bg-green-100 text-green-800",
            event.category === "Memorial" && "bg-gray-100 text-gray-800",
            event.category === "Holiday" && "bg-yellow-100 text-yellow-800",
            event.category === "Other" && "bg-orange-100 text-orange-800"
          )}
        >
          {event.category}
        </div>
      );
    },
  },

  {
    id: "action",
    header: "Action",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {onEditClick && (
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEditClick(row.original)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}

        {onDeleteClick && (
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => onDeleteClick(row.original.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    ),
  },

  {
    id: "invite",
    header: "",
    cell: ({ row }) => (
      <Button className="flex justify-end rounded-full" variant="outline">
        Invite
      </Button>
    ),
  },
];
