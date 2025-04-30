import { Gallery } from "@/lib/types";
import React from "react";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";

interface GalleryTableProps {
  data: Gallery[];
  onUserClick?: (user: Gallery) => void;
}

const GalleryTable = ({ data, onUserClick }: GalleryTableProps) => {
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

export default GalleryTable;
