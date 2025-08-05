"use client";

import { FamilyMemberRequest } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useFamilyMemberRequestsStore } from "@/stores/family-member-requests-store";
import { DataTableColumnHeader } from "@/components/ui/table-reusuable/data-table-column-header";

const ActionButtons = ({
  request,
  onRefresh,
}: {
  request: FamilyMemberRequest;
  onRefresh?: () => void;
}) => {
  const [loading, setLoading] = useState(false);
  const { approveRequest, rejectRequest } = useFamilyMemberRequestsStore();

  const handleAction = async (status: "approved" | "rejected") => {
    setLoading(true);
    try {
      if (status === "approved") {
        await approveRequest(request.id);
      } else {
        await rejectRequest(request.id);
      }
      onRefresh?.();
    } catch (error) {
      console.error("Error handling family member request:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="destructive"
        disabled={loading}
        onClick={() => handleAction("rejected")}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reject"}
      </Button>
      <Button
        className="bg-green-500 hover:bg-green-500/80 text-background"
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
): ColumnDef<FamilyMemberRequest>[] => [
  {
    id: "s/n",
    header: "S/N",
    cell: ({ row }) => <div>{row.index + 1}</div>,
  },
  {
    accessorKey: "first_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => (
      <div>{`${row.original.first_name} ${row.original.last_name}`}</div>
    ),
  },
  {
    accessorKey: "gender",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Gender" />
    ),
  },
  {
    accessorKey: "date_of_birth",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Birth Date" />
    ),
    cell: ({ row }) => (
      <div>
        {row.original.date_of_birth
          ? new Date(row.original.date_of_birth).toLocaleDateString()
          : "N/A"}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
  },
  {
    id: "action",
    header: "Action",
    cell: ({ row }) => (
      <ActionButtons request={row.original} onRefresh={onRefresh} />
    ),
  },
];
