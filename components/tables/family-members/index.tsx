import { FamilyMember } from "@/lib/types";
import React from "react";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";

interface UserMerchantTableProps {
  data: FamilyMember[];
  onUserClick?: (user: FamilyMember) => void;
}

const FamilyMembersTable = ({ data, onUserClick }: UserMerchantTableProps) => {
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
