"use client";

import { NoticeBoard } from "@/lib/types";
import React from "react";
import { createColumns } from "./columns";
import { DataTable } from "@/components/ui/data-table";

interface NoticeBoardTableProps {
  data: NoticeBoard[];
  onEditClick: (noticeBoard: NoticeBoard) => void;
  onDeleteClick: (id: string) => void;
  onTogglePinClick: (id: string, pinned: boolean) => void;
}

const NoticeBoardTable = ({
  data,
  onEditClick,
  onDeleteClick,
  onTogglePinClick,
}: NoticeBoardTableProps) => {
  const columns = createColumns(onEditClick, onDeleteClick, onTogglePinClick);

  return (
    <DataTable
      columns={columns}
      data={data}
      showSearchInput={true}
      searchKey="title"
      placeholder="Search notices by title..."
    />
  );
};

export default NoticeBoardTable;
