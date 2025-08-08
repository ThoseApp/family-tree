import { FamilyMemberRequest } from "@/lib/types";
import React from "react";
import { createColumns } from "./columns";
import { DataTable } from "@/components/ui/data-table";

interface FamilyMemberRequestsTableProps {
  data: FamilyMemberRequest[];
  onRefresh?: () => void;
}

const FamilyMemberRequestsTable = ({
  data,
  onRefresh,
}: FamilyMemberRequestsTableProps) => {
  const columns = createColumns(onRefresh);

  return <DataTable columns={columns} data={data} />;
};

export default FamilyMemberRequestsTable;
