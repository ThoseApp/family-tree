"use client";

import { GalleryType } from "@/lib/types";
import React from "react";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";

interface GalleryTableProps {
  data: GalleryType[];
  onUserClick?: (gallery: GalleryType) => void;
  deleteImage?: (id: string) => Promise<void>;
  previewImage?: (gallery: GalleryType) => void;
  showSearchInput?: boolean;
}

const GalleryTable = ({
  data,
  onUserClick,
  deleteImage,
  previewImage,
  showSearchInput,
}: GalleryTableProps) => {
  return (
    <DataTable
      columns={columns}
      data={data}
      onRowClick={onUserClick}
      deleteImage={deleteImage}
      previewImage={previewImage}
      showSearchInput={showSearchInput}
      // exportData
      // statusFilter
      // dateFilter
    />
  );
};

export default GalleryTable;
