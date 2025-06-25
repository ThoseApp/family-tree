"use client";

import { FamilyMember } from "@/lib/types";
import React, { useState, useMemo } from "react";
import { createColumns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";

interface FamilyMembersTableProps {
  data: FamilyMember[];
  onUserClick?: (user: FamilyMember) => void;
  onEdit?: (member: FamilyMember) => void;
  onDelete?: (member: FamilyMember) => void;
}

const FamilyMembersTable = ({
  data,
  onUserClick,
  onEdit = () => {},
  onDelete = () => {},
}: FamilyMembersTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const columns = createColumns(onEdit, onDelete);

  // Filter data based on search term across multiple fields
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;

    const searchLower = searchTerm.toLowerCase();
    return data.filter((member) => {
      return (
        member.name?.toLowerCase().includes(searchLower) ||
        member.gender?.toLowerCase().includes(searchLower) ||
        member.description?.toLowerCase().includes(searchLower) ||
        member.fatherName?.toLowerCase().includes(searchLower) ||
        member.motherName?.toLowerCase().includes(searchLower) ||
        member.spouseName?.toLowerCase().includes(searchLower) ||
        member.birthDate?.includes(searchTerm)
      );
    });
  }, [data, searchTerm]);

  return (
    <div className="space-y-4">
      {/* Custom Search Input */}
      <div className="flex flex-1 items-center justify-between">
        <Input
          placeholder="Search family members by name, gender, relations, or birth date..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className=""
        />

        {/* Search Results Indicator */}
        {searchTerm.trim() && (
          <div className="text-sm text-muted-foreground">
            {filteredData.length} of {data.length} members found
          </div>
        )}
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredData}
        onRowClick={onUserClick}
        showSearchInput={false} // We're using our custom search above
        // exportData
        // statusFilter
        // dateFilter
      />
    </div>
  );
};

export default FamilyMembersTable;
