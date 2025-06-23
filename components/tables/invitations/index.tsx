"use client";

import React from "react";
import { DataTable } from "@/components/ui/data-table";
import { createInvitationColumns } from "./columns";
import { EventInvitation } from "@/lib/types";

interface InvitationsTableProps {
  data: EventInvitation[];
  type: "received" | "sent";
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
  onCancel?: (id: string) => void;
}

export const InvitationsTable: React.FC<InvitationsTableProps> = ({
  data,
  type,
  onAccept,
  onDecline,
  onCancel,
}) => {
  const columns = createInvitationColumns(type, onAccept, onDecline, onCancel);

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={data}
        searchKey="event.name"
        searchPlaceholder={`Search ${type} invitations...`}
      />
    </div>
  );
};
