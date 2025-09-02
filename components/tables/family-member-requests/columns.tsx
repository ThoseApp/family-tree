"use client";

import { FamilyMemberRequest } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Loader2, Eye, CheckCircle, XCircle } from "lucide-react";
import { useFamilyMemberRequestsStore } from "@/stores/family-member-requests-store";
import { DataTableColumnHeader } from "@/components/ui/table-reusuable/data-table-column-header";

const ActionButtons = ({
  request,
  onRefresh,
  onViewDetails,
}: {
  request: FamilyMemberRequest;
  onRefresh?: () => void;
  onViewDetails?: (request: FamilyMemberRequest) => void;
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
        variant="outline"
        size="sm"
        onClick={() => onViewDetails?.(request)}
        className="flex items-center gap-1"
      >
        <Eye className="h-4 w-4" />
        View Details
      </Button>

      {request.status === "pending" && (
        <>
          <Button
            variant="destructive"
            size="sm"
            disabled={loading}
            onClick={() => handleAction("rejected")}
            className="flex items-center gap-1"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            Reject
          </Button>
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700 flex items-center gap-1"
            disabled={loading}
            onClick={() => handleAction("approved")}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            Approve
          </Button>
        </>
      )}
    </div>
  );
};

export const createColumns = (
  onRefresh?: () => void,
  onViewDetails?: (request: FamilyMemberRequest) => void
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
    cell: ({ row }) => {
      const status = row.original.status;
      const getStatusColor = () => {
        switch (status) {
          case "pending":
            return "bg-orange-100 text-orange-800 border-orange-200";
          case "approved":
            return "bg-green-100 text-green-800 border-green-200";
          case "rejected":
            return "bg-red-100 text-red-800 border-red-200";
          default:
            return "bg-gray-100 text-gray-800 border-gray-200";
        }
      };

      return (
        <Badge className={getStatusColor()}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "life_status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Life Status" />
    ),
    cell: ({ row }) => {
      const lifeStatus = row.original.life_status;
      if (!lifeStatus)
        return <span className="text-muted-foreground">N/A</span>;

      const getLifeStatusColor = () => {
        switch (lifeStatus) {
          case "Alive":
            return "bg-green-100 text-green-800 border-green-200";
          case "Deceased":
            return "bg-gray-100 text-gray-800 border-gray-200";
          default:
            return "bg-blue-100 text-blue-800 border-blue-200";
        }
      };

      return (
        <Badge variant="outline" className={getLifeStatusColor()}>
          {lifeStatus}
        </Badge>
      );
    },
  },
  {
    accessorKey: "email_address",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => {
      const email = row.original.email_address;
      return email ? (
        <span className="text-sm">{email}</span>
      ) : (
        <span className="text-muted-foreground text-sm">No email</span>
      );
    },
  },
  {
    id: "action",
    header: "Actions",
    cell: ({ row }) => (
      <ActionButtons
        request={row.original}
        onRefresh={onRefresh}
        onViewDetails={onViewDetails}
      />
    ),
  },
];
