import { GalleryImage } from "@/lib/types";
import React from "react";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";

interface GalleryRequestsTableProps {
  data: GalleryImage[];
  onUserClick?: (user: GalleryImage) => void;
}

const GalleryRequestsTable = ({
  data,
  onUserClick,
}: GalleryRequestsTableProps) => {
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

export default GalleryRequestsTable;
