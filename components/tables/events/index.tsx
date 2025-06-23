"use client";

import { Event } from "@/lib/types";
import React from "react";
import { createColumns } from "./columns";
import { DataTable } from "@/components/ui/data-table";

interface EventsTableProps {
  data: Event[];
  onEditClick?: (event: Event) => void;
  onDeleteClick?: (id: string) => void;
  onInviteClick?: (event: Event) => void;
}

const EventsTable = ({
  data,
  onEditClick,
  onDeleteClick,
  onInviteClick,
}: EventsTableProps) => {
  const columns = createColumns(onEditClick, onDeleteClick, onInviteClick);

  return (
    <DataTable
      columns={columns}
      data={data}
      // showSearchInput
      // exportData
      // statusFilter
      // dateFilter
    />
  );
};

export default EventsTable;
