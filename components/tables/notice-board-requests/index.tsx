import { NoticeBoard } from "@/lib/types";
import React from "react";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";

interface NoticeBoardRequestsTableProps {
  data: NoticeBoard[];
  onUserClick?: (noticeBoard: NoticeBoard) => void;
  onApprove?: (noticeBoardId: string) => Promise<void>;
  onDecline?: (noticeBoardId: string) => Promise<void>;
  processingItems?: Set<string>;
}

const NoticeBoardRequestsTable = ({
  data,
  onUserClick,
  onApprove,
  onDecline,
  processingItems,
}: NoticeBoardRequestsTableProps) => {
  return (
    <DataTable
      columns={columns}
      data={data}
      onRowClick={onUserClick}
      onApprove={onApprove}
      onDecline={onDecline}
      processingItems={processingItems}
      showSearchInput
      // exportData
      // statusFilter
      // dateFilter
    />
  );
};

export default NoticeBoardRequestsTable;
