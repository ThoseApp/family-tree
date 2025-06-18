import { MemberRequest } from "@/lib/types";
import React from "react";
import { createColumns } from "./columns";
import { DataTable } from "@/components/ui/data-table";

interface MemberRequestsTableProps {
  data: MemberRequest[];
  onUserClick?: (user: MemberRequest) => void;
  onRefresh?: () => void;
}

const MemberRequestsTable = ({
  data,
  onUserClick,
  onRefresh,
}: MemberRequestsTableProps) => {
  const columns = createColumns(onRefresh);

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

export default MemberRequestsTable;
