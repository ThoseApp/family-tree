"use client";

import { Event } from "@/lib/types";
import React from "react";
import { createColumns } from "./columns";
import { DataTable } from "@/components/ui/data-table";

interface EventsTableProps {
  data: Event[];
  onEditClick?: (event: Event) => void;
  onDeleteClick?: (id: string) => void;
}

const EventsTable = ({
  data,
  onEditClick,
  onDeleteClick,
}: EventsTableProps) => {
  const columns = createColumns(onEditClick, onDeleteClick);

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
