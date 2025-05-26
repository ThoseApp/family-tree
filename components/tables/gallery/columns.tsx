"use client";

import { GalleryType } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";

import Image from "next/image";
import { cn, formatFileSize } from "@/lib/utils";
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
      const gallery = row.original;

      return (
        <div className="relative w-[100px] h-[100px] overflow-hidden rounded-md cursor-pointer">
          <Image
            src={gallery.url}
            alt={gallery.caption || "Gallery Image"}
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
    id: "caption",
    header: "Name",
    cell({ row }) {
      const gallery = row.original;

      return <p className="text-sm text-left ">{gallery.caption}</p>;
    },
  },

  {
    id: "fileSize",
    header: "File Size",
    accessorKey: "file_size",
    cell(props) {
      const { row } = props;
      const gallery = row.original;

      return (
        <p className="text-sm text-left ">
          {formatFileSize(gallery.file_size)}
        </p>
      );
    },
  },

  {
    id: "uploadedDate",
    header: "Uploaded Date",
    accessorKey: "uploaded_at",
    cell: ({ row }) => {
      const gallery = row.original;
      const dateString = gallery.uploaded_at || gallery.created_at;
      try {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString();
      } catch {
        return "Invalid date";
      }
    },
  },

  {
    id: "uploadedTime",
    header: "Uploaded Time",
    accessorKey: "uploaded_at",
    cell: ({ row }) => {
      const gallery = row.original;
      const dateString = gallery.uploaded_at || gallery.created_at;
      try {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleTimeString();
      } catch {
        return "Invalid time";
      }
    },
  },

  {
    id: "uploader",
    header: "Uploader",
    accessorKey: "user_id",
    cell: ({ row }) => {
      const gallery = row.original;
      // For now, show "You" since this is typically the user's own gallery
      // In the future, this could be enhanced to show actual user names
      return <p className="text-sm text-left ">You</p>;
    },
  },

  {
    id: "action",
    header: "Action",
    cell: ({ row, table }) => {
      const gallery = row.original;

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
              if (deleteImage) deleteImage(gallery.id);
            }}
          >
            <Trash2 className="size-4" />
          </Button>

          <Button
            variant="outline"
            className="rounded-full flex justify-end"
            onClick={(e) => {
              e.stopPropagation();
              if (previewImage) previewImage(gallery);
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
