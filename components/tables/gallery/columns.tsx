"use client";

import { GalleryType } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Eye } from "lucide-react";

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
    header: "Image",
    cell({ row }) {
      const event = row.original;

      return (
        <div className="relative w-[100px] h-[100px] overflow-hidden rounded-md cursor-pointer">
          <Image
            src={event.url}
            alt={event.caption || "Gallery Image"}
            width={100}
            height={100}
            className="rounded-md object-cover"
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      );
    },
  },

  {
    id: "name",
    header: "Name",
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

      // Format file size to KB or MB
      const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
      };

      return (
        <p className="text-sm text-left ">{formatFileSize(event.file_size)}</p>
      );
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
      const event = row.original;

      // Access custom props from table.options
      const { deleteImage, previewImage } = table.options as any;

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              if (deleteImage) deleteImage(event.id);
            }}
          >
            <Trash2 className="size-4" />
          </Button>

          <Button
            variant="outline"
            className="rounded-full flex justify-end"
            onClick={(e) => {
              e.stopPropagation();
              if (previewImage) previewImage(event);
            }}
          >
            <Eye className="size-4 mr-2" />
            Preview
          </Button>
        </div>
      );
    },
  },
];
