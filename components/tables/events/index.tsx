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
  showSearchInput?: boolean;
}

const EventsTable = ({
  data,
  onEditClick,
  onDeleteClick,
  onInviteClick,
  showSearchInput = true,
}: EventsTableProps) => {
  const columns = createColumns(onEditClick, onDeleteClick, onInviteClick);

  return (
    <DataTable
      columns={columns}
      data={data}
      showSearchInput={showSearchInput}
      searchKey="name"
      placeholder="Search events by name..."
      // exportData
      // statusFilter
      // dateFilter
    />
  );
};

export default EventsTable;
