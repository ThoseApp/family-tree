import { FamilyMember } from "@/lib/types";
import React from "react";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";

interface FamilyMembersTableProps {
  data: FamilyMember[];
  onUserClick?: (user: FamilyMember) => void;
}

const FamilyMembersTable = ({ data, onUserClick }: FamilyMembersTableProps) => {
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

export default FamilyMembersTable;
