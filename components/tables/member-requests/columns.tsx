"use client";

import { MemberRequest } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useMemberRequestsStore } from "@/stores/member-requests-store";
import { DataTableColumnHeader } from "@/components/ui/table-reusuable/data-table-column-header";

// Action buttons component to handle loading states
const ActionButtons = ({
  request,
  onRefresh,
}: {
  request: MemberRequest;
  onRefresh?: () => void;
}) => {
  const [loading, setLoading] = useState(false);
  const { approveMemberRequest, rejectMemberRequest } =
    useMemberRequestsStore();

  const handleAction = async (status: "approved" | "rejected") => {
    setLoading(true);

    try {
      let success = false;
      if (status === "approved") {
        success = await approveMemberRequest(request.user_id);
      } else {
        success = await rejectMemberRequest(request.user_id);
      }

      if (success) {
        onRefresh?.();
      }
    } catch (error) {
      console.error("Error handling member action:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        className="flex justify-end"
        variant="destructive"
        disabled={loading}
        onClick={() => handleAction("rejected")}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reject"}
      </Button>
      <Button
        className="flex justify-end bg-green-500 hover:bg-green-500/80 text-background"
        disabled={loading}
        onClick={() => handleAction("approved")}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Approve"}
      </Button>
    </div>
  );
};

export const createColumns = (
  onRefresh?: () => void
): ColumnDef<MemberRequest>[] => [
  {
    id: "s/n",
    header: "S/N",
    cell: ({ row }) => {
      return <div className=" text-left">{row.index + 1}</div>;
    },
    enableSorting: false,
  },

  {
    id: "name",
    accessorKey: "first_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell({ row }) {
      const user = row.original;

      return (
        <div className="flex items-center gap-2">
          <div className="size-8 flex-shrink-0 relative rounded-full overflow-hidden bg-gray-200">
            {user.image ? (
              <Image
                src={user.image}
                alt={`${user.first_name} ${user.last_name}`}
                fill
                className="rounded-full object-cover"
              />
            ) : (
              <div className="flex  items-center justify-center w-full h-full text-gray-500 text-xs">
                {user.first_name.charAt(0)}
                {user.last_name.charAt(0)}
              </div>
            )}
          </div>
          <p className="text-sm text-left">
            {user.first_name} {user.last_name}
          </p>
        </div>
      );
    },
    sortingFn: (rowA, rowB, columnId) => {
      const nameA = `${rowA.original.first_name} ${rowA.original.last_name}`;
      const nameB = `${rowB.original.first_name} ${rowB.original.last_name}`;
      return nameA.localeCompare(nameB);
    },
  },

  {
    id: "email",
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => {
      const user = row.original;
      return <p className="text-sm text-left">{user.email}</p>;
    },
    sortingFn: "alphanumeric",
  },

  {
    id: "phone_number",
    accessorKey: "phone_number",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phone" />
    ),
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="text-left text-xs md:text-sm">
          {user.phone_number || "N/A"}
        </div>
      );
    },
    sortingFn: "alphanumeric",
  },

  {
    id: "date_of_birth",
    accessorKey: "date_of_birth",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Birth Date" />
    ),
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="text-left text-xs md:text-sm">
          {user.date_of_birth
            ? new Date(user.date_of_birth).toLocaleDateString()
            : "N/A"}
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
    id: "relative",
    accessorKey: "relative",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Relative" />
    ),
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className={cn("text-left text-xs md:text-sm")}>
          {user.relative || "N/A"}
        </div>
      );
    },
    sortingFn: "alphanumeric",
  },

  {
    id: "relationship_to_relative",
    accessorKey: "relationship_to_relative",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Relationship" />
    ),
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className={cn("text-left text-xs md:text-sm")}>
          {user.relationship_to_relative || "N/A"}
        </div>
      );
    },
    sortingFn: "alphanumeric",
  },

  {
    id: "created_at",
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Request Date" />
    ),
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="text-left text-xs md:text-sm">
          {new Date(user.created_at).toLocaleDateString()}
        </div>
      );
    },
    sortingFn: (rowA, rowB, columnId) => {
      const dateA = rowA.getValue(columnId) as string;
      const dateB = rowB.getValue(columnId) as string;

      return new Date(dateA).getTime() - new Date(dateB).getTime();
    },
  },

  {
    id: "action",
    header: "Action",
    cell: ({ row }) => {
      const request = row.original;
      return <ActionButtons request={request} onRefresh={onRefresh} />;
    },
    enableSorting: false,
  },
];
