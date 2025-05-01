"use client";

import { Gallery } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

export const columns: ColumnDef<Gallery>[] = [
  {
    id: "s/n",
    header: "S/N",
    cell: ({ row }) => {
      return <div className=" text-left">{row.index + 1}</div>;
    },
  },

  {
    id: "image",
    header: "Thumbnail",
    cell({ row }) {
      const event = row.original;

      return (
        <Image
          src={event.image}
          alt={event.name}
          width={100}
          height={100}
          className="rounded-md"
        />
      );
    },
  },

  {
    id: "name",
    header: "Caption",
    cell({ row }) {
      const event = row.original;

      return <p className="text-sm text-left ">{event.name}</p>;
    },
  },

  {
    id: "fileSize",
    header: "File Size",

    accessorKey: "fileSize",
    cell(props) {
      const { row } = props;
      const event = row.original;

      return <p className="text-sm text-left ">{event.fileSize}</p>;
    },
  },

  {
    id: "uploadedDate",
    header: "Uploaded Date",
    accessorKey: "uploadDate",
    cell: ({ row }) => {
      const event = row.original;
      return (
        <div className={cn("text-left text-xs md:text-sm ")}>
          {event.uploadDate}
        </div>
      );
    },
  },

  {
    id: "uploadedTime",
    header: "Uploaded Time",
    accessorKey: "uploadTime",
    cell: ({ row }) => {
      const event = row.original;
      return <p className="text-sm text-left ">{event.uploadTime}</p>;
    },
  },

  {
    id: "uploader",
    header: "Uploader",
    accessorKey: "uploader",
    cell: ({ row }) => {
      const event = row.original;
      return <p className="text-sm text-left ">{event.uploader}</p>;
    },
  },

  {
    id: "action",
    header: "Action",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Button className="flex justify-end" variant="destructive">
          Decline
        </Button>

        <Button className="flex justify-end bg-green-500 hover:bg-green-500/80 text-background">
          Approve
        </Button>
      </div>
    ),
  },
];
