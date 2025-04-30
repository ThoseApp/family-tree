import { Event } from "@/lib/types";
import React from "react";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";

interface EventsTableProps {
  data: Event[];
  onUserClick?: (user: Event) => void;
}

const EventsTable = ({ data, onUserClick }: EventsTableProps) => {
  return (
    <DataTable
      columns={columns}
      data={data}
      onRowClick={onUserClick}
      // showSearchInput
      // exportData
      // statusFilter
      // dateFilter
    />
  );
};

export default EventsTable;
