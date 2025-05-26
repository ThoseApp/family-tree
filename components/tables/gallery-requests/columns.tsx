"use client";

import { GalleryType } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

export const columns: ColumnDef<GalleryType>[] = [
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
          src={event.url}
          alt={event.caption || "Gallery Image"}
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

      return <p className="text-sm text-left ">{event.caption}</p>;
    },
  },

  {
    id: "fileSize",
    header: "File Size",

    accessorKey: "fileSize",
    cell(props) {
      const { row } = props;
      const event = row.original;

      return <p className="text-sm text-left ">{event.file_size}</p>;
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
          {event.uploaded_at}
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
      return <p className="text-sm text-left ">{event.uploaded_at}</p>;
    },
  },

  {
    id: "uploader",
    header: "Uploader",
    accessorKey: "uploader",
    cell: ({ row }) => {
      const event = row.original;
      return <p className="text-sm text-left ">{event.user_id}</p>;
    },
  },

  {
    id: "action",
    header: "Action",
    cell: ({ row, table }) => {
      const gallery = row.original;

      // Access custom props from table.options
      const { onApprove, onDecline, isProcessing } = table.options as any;

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="destructive"
            onClick={(e) => {
              e.stopPropagation();
              if (onDecline && gallery.id) {
                onDecline(gallery.id);
              }
            }}
            disabled={isProcessing}
            className="flex justify-end"
          >
            {isProcessing ? "Processing..." : "Decline"}
          </Button>

          <Button
            className="flex justify-end bg-green-500 hover:bg-green-500/80 text-background"
            onClick={(e) => {
              e.stopPropagation();
              if (onApprove && gallery.id) {
                onApprove(gallery.id);
              }
            }}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Approve"}
          </Button>
        </div>
      );
    },
  },
];
