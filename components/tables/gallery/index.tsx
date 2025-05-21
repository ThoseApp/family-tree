"use client";

import { GalleryImage } from "@/lib/types";
import React from "react";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";

interface GalleryTableProps {
  data: GalleryImage[];
  onUserClick?: (user: GalleryImage) => void;
  deleteImage?: (id: string) => Promise<void>;
  previewImage?: (image: GalleryImage) => void;
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
