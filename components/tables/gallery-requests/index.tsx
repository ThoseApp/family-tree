import { GalleryType } from "@/lib/types";
import React from "react";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";

interface GalleryRequestsTableProps {
  data: GalleryType[];
  onUserClick?: (gallery: GalleryType) => void;
  onApprove?: (galleryId: string) => Promise<void>;
  onDecline?: (galleryId: string) => Promise<void>;
  isProcessing?: boolean;
}

const GalleryRequestsTable = ({
  data,
  onUserClick,
  onApprove,
  onDecline,
  isProcessing,
}: GalleryRequestsTableProps) => {
  return (
    <DataTable
      columns={columns}
      data={data}
      onRowClick={onUserClick}
      onApprove={onApprove}
      onDecline={onDecline}
      isProcessing={isProcessing}
      showSearchInput
      // exportData
      // statusFilter
      // dateFilter
    />
  );
};

export default GalleryRequestsTable;
