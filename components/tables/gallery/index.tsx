"use client";

import { GalleryType } from "@/lib/types";
import React from "react";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";

interface GalleryTableProps {
  data: GalleryType[];
  onUserClick?: (user: GalleryType) => void;
  deleteImage?: (id: string) => Promise<void>;
  previewImage?: (image: GalleryType) => void;
}

const GalleryTable = ({
  data,
  onUserClick,
  deleteImage,
  previewImage,
}: GalleryTableProps) => {
  return (
    <DataTable
      columns={columns}
      data={data}
      onRowClick={onUserClick}
      deleteImage={deleteImage}
      previewImage={previewImage}
      // showSearchInput
      // exportData
      // statusFilter
      // dateFilter
    />
  );
};

export default GalleryTable;
