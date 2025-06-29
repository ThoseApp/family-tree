"use client";

import { GalleryType } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";

import Image from "next/image";
import { cn, formatFileSize } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { getUserProfile } from "@/lib/user";
import { useEffect, useState } from "react";
import { UserProfile } from "@/lib/types";
import { DataTableColumnHeader } from "@/components/ui/table-reusuable/data-table-column-header";

// Component to handle async user profile fetching
const UploaderCell = ({ userId }: { userId: string }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getUserProfile(userId);
        setUserProfile(profile);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [userId]);

  if (loading) {
    return (
      <p className="text-sm text-left text-muted-foreground">Loading...</p>
    );
  }

  if (!userProfile) {
    return <p className="text-sm text-left text-muted-foreground">Unknown</p>;
  }

  return (
    <p className="text-sm text-left">
      {userProfile.first_name} {userProfile.last_name}
    </p>
  );
};

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
    header: "Thumbnail",
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
      <DataTableColumnHeader column={column} title="Caption" />
    ),
    cell({ row }) {
      const gallery = row.original;

      return (
        <p className="text-sm text-left ">
          {gallery.caption || gallery.file_name || "Untitled"}
        </p>
      );
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
      return <UploaderCell userId={gallery.user_id} />;
    },
    sortingFn: "alphanumeric",
  },

  {
    id: "action",
    header: "Action",
    cell: ({ row, table }) => {
      const gallery = row.original;

      // Access custom props from table.options
      const { onApprove, onDecline, processingItems } = table.options as any;
      const isProcessing = processingItems?.has(gallery.id) || false;

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
    enableSorting: false,
  },
];
