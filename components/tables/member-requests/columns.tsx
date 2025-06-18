"use client";

import { MemberRequest } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useMemberRequestsStore } from "@/stores/member-requests-store";

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
  },

  {
    id: "name",
    header: "Name",
    cell({ row }) {
      const user = row.original;

      return (
        <div className="flex items-center gap-2">
          <div className="size-8 relative rounded-full overflow-hidden bg-gray-200">
            {user.image ? (
              <Image
                src={user.image}
                alt={`${user.first_name} ${user.last_name}`}
                fill
                className="rounded-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-gray-500 text-xs">
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
  },

  {
    id: "email",
    header: "Email",
    accessorKey: "email",
    cell: ({ row }) => {
      const user = row.original;
      return <p className="text-sm text-left">{user.email}</p>;
    },
  },

  {
    id: "phone_number",
    header: "Phone",
    accessorKey: "phone_number",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="text-left text-xs md:text-sm">
          {user.phone_number || "N/A"}
        </div>
      );
    },
  },

  {
    id: "date_of_birth",
    header: "Birth Date",
    accessorKey: "date_of_birth",
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
  },

  {
    id: "relative",
    header: "Relative",
    accessorKey: "relative",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className={cn("text-left text-xs md:text-sm")}>
          {user.relative || "N/A"}
        </div>
      );
    },
  },

  {
    id: "relationship_to_relative",
    header: "Relationship",
    accessorKey: "relationship_to_relative",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className={cn("text-left text-xs md:text-sm")}>
          {user.relationship_to_relative || "N/A"}
        </div>
      );
    },
  },

  {
    id: "created_at",
    header: "Request Date",
    accessorKey: "created_at",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="text-left text-xs md:text-sm">
          {new Date(user.created_at).toLocaleDateString()}
        </div>
      );
    },
  },

  {
    id: "action",
    header: "Action",
    cell: ({ row }) => {
      const request = row.original;
      return <ActionButtons request={request} onRefresh={onRefresh} />;
    },
  },
];
