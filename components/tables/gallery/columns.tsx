"use client";

import { GalleryType } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";

import Image from "next/image";
import { cn, formatFileSize } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Eye } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTableColumnHeader } from "@/components/ui/table-reusuable/data-table-column-header";

export const columns: ColumnDef<GalleryType>[] = [
  {
    id: "s/n",
    header: "S/N",
    cell: ({ row }) => {
      return <div className=" text-left">{row.index + 1}</div>;
    },
    enableSorting: false,
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
    enableSorting: false,
  },

  {
    id: "caption",
    accessorKey: "caption",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell({ row }) {
      const gallery = row.original;

      return <p className="text-sm text-left ">{gallery.caption}</p>;
    },
    sortingFn: "alphanumeric",
  },

  {
    id: "fileSize",
    accessorKey: "file_size",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="File Size" />
    ),
    cell(props) {
      const { row } = props;
      const gallery = row.original;

      return (
        <p className="text-sm text-left ">
          {formatFileSize(gallery.file_size)}
        </p>
      );
    },
    sortingFn: (rowA, rowB, columnId) => {
      const sizeA = rowA.getValue(columnId) as number;
      const sizeB = rowB.getValue(columnId) as number;

      return (sizeA || 0) - (sizeB || 0);
    },
  },

  {
    id: "uploadedDate",
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Uploaded Date" />
    ),
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
    sortingFn: (rowA, rowB, columnId) => {
      const dateA = rowA.original.uploaded_at || rowA.original.created_at;
      const dateB = rowB.original.uploaded_at || rowB.original.created_at;

      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;

      return new Date(dateA).getTime() - new Date(dateB).getTime();
    },
  },

  {
    id: "uploadedTime",
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Uploaded Time" />
    ),
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
    sortingFn: (rowA, rowB, columnId) => {
      const dateA = rowA.original.uploaded_at || rowA.original.created_at;
      const dateB = rowB.original.uploaded_at || rowB.original.created_at;

      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;

      return new Date(dateA).getTime() - new Date(dateB).getTime();
    },
  },

  {
    id: "uploader",
    accessorKey: "user_id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Uploader" />
    ),
    cell: ({ row }) => {
      const gallery = row.original;
      // For now, show "You" since this is typically the user's own gallery
      // In the future, this could be enhanced to show actual user names
      return <p className="text-sm text-left ">You</p>;
    },
    sortingFn: "alphanumeric",
  },

  {
    id: "status",
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const gallery = row.original;
      const status = gallery.status as "pending" | "approved" | "rejected";
      return (
        <div className="flex justify-start">
          <StatusBadge status={status || "pending"} />
        </div>
      );
    },
    sortingFn: (rowA, rowB, columnId) => {
      const statusA = rowA.getValue(columnId) as string;
      const statusB = rowB.getValue(columnId) as string;

      // Define status priority for sorting
      const statusPriority = { pending: 0, approved: 1, rejected: 2 };
      const priorityA =
        statusPriority[statusA as keyof typeof statusPriority] ?? 999;
      const priorityB =
        statusPriority[statusB as keyof typeof statusPriority] ?? 999;

      return priorityA - priorityB;
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
    enableSorting: false,
  },
];
