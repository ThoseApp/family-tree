import { FamilyMemberRequest } from "@/lib/types";
import React from "react";
import { createColumns } from "./columns";
import { DataTable } from "@/components/ui/data-table";

interface FamilyMemberRequestsTableProps {
  data: FamilyMemberRequest[];
  onRefresh?: () => void;
  onViewDetails?: (request: FamilyMemberRequest) => void;
}

const FamilyMemberRequestsTable = ({
  data,
  onRefresh,
  onViewDetails,
}: FamilyMemberRequestsTableProps) => {
  const columns = createColumns(onRefresh, onViewDetails);

  return <DataTable columns={columns} data={data} />;
};

export default FamilyMemberRequestsTable;
