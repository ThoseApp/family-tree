"use client";

import { Event } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

export const columns: ColumnDef<Event>[] = [
  {
    id: "s/n",
    header: "S/N",
    cell: ({ row }) => {
      return <div className=" text-left">{row.index + 1}</div>;
    },
  },

  {
    id: "name",
    header: "Name",
    cell({ row }) {
      const event = row.original;

      return <p className="text-sm text-left ">{event.name}</p>;
    },
  },

  {
    id: "date",
    header: "Date",

    accessorKey: "date",
    cell(props) {
      const { row } = props;
      const event = row.original;

      return <p className="text-sm text-left ">{event.date}</p>;
    },
  },

  {
    id: "category",
    header: "Category",
    accessorKey: "category",
    cell: ({ row }) => {
      const event = row.original;
      return (
        <div className={cn("text-left text-xs md:text-sm ")}>
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
        <Button variant="outline" size="icon">
          <Pencil />
        </Button>

        <Button variant="outline" size="icon">
          <Trash2 />
        </Button>
      </div>
    ),
  },

  {
    id: "invite",
    header: "",
    cell: ({ row }) => (
      <Button className="flex justify-end" variant="outline">
        Invite
      </Button>
    ),
  },
];
