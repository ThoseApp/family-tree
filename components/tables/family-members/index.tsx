"use client";

import { FamilyMember } from "@/lib/types";
import React from "react";
import { createColumns } from "./columns";
import { DataTable } from "@/components/ui/data-table";

interface FamilyMembersTableProps {
  data: FamilyMember[];
  onUserClick?: (user: FamilyMember) => void;
  onEdit?: (member: FamilyMember) => void;
  onDelete?: (member: FamilyMember) => void;
  onCreateAccount?: (member: FamilyMember) => void;
  showSearchInput?: boolean;
}

const FamilyMembersTable = ({
  data,
  onUserClick,
  onEdit = () => {},
  onDelete = () => {},
  onCreateAccount,
  showSearchInput = true,
}: FamilyMembersTableProps) => {
  const columns = createColumns(onEdit, onDelete, onCreateAccount);

  return (
    <div className="space-y-4">
      {/* Data Table */}
      <DataTable
        columns={columns}
        data={data}
        onRowClick={onUserClick}
        showSearchInput={showSearchInput}
      />
    </div>
  );
};

export default FamilyMembersTable;
