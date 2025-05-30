"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { DataTablePagination } from "@/components/ui/table-reusuable/data-table-pagination";
import { DataTableViewOptions } from "@/components/ui/table-reusuable/data-table-view-options";
import {
  Boxes,
  Calendar,
  BarChart,
  ChevronDown,
  Download,
  Eye,
} from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  showSearchInput?: boolean;
  exportData?: boolean;
  categoryFilter?: boolean;
  visibilityFilter?: boolean;
  statusFilter?: boolean;
  dateFilter?: boolean;
  onRowClick?: (row: TData) => void;
  [key: string]: any; // Allow for additional custom props
}

export function DataTable<TData, TValue>({
  columns,
  data,
  showSearchInput,
  exportData,
  categoryFilter,
  visibilityFilter,
  statusFilter,
  dateFilter,
  onRowClick,
  ...customProps // Spread the rest of the props
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    // Pass all custom props to the table options so they can be accessed in column definitions
    ...customProps,
  });

  return (
    <div>
      <div className="flex items-center gap-6">
        {showSearchInput && (
          <div className="flex flex-1 items-center py-4 ">
            <Input
              placeholder="Search by caption..."
              value={
                (table.getColumn("caption")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("caption")?.setFilterValue(event.target.value)
              }
            />
          </div>
        )}

        {/* // TODO */}
        {categoryFilter && (
          <Button variant="outline" className="text-muted-foreground">
            <Boxes className="mr-2 size-5" /> Category
            <ChevronDown className="ml-2 size-5" />
          </Button>
        )}

        {/* // TODO */}
        {visibilityFilter && (
          <Button variant="outline" className="text-muted-foreground">
            <Eye className="mr-2 size-5" /> Visibility
            <ChevronDown className="ml-2 size-5" />
          </Button>
        )}

        {/* // TODO */}
        {statusFilter && (
          <Button variant="outline" className="text-muted-foreground">
            <BarChart className="mr-2 size-5" /> Status
            <ChevronDown className="ml-2 size-5" />
          </Button>
        )}

        {/* // TODO */}
        {dateFilter && (
          <Button variant="outline" className="text-muted-foreground">
            <Calendar className="mr-2 size-5" /> Date
            <ChevronDown className="ml-2 size-5" />
          </Button>
        )}

        {/* // TODO */}
        {exportData && data.length > 0 && (
          <div className="flex justify-end py-4">
            <Button className="rounded-lg">
              <Download className="size-5 mr-2" />
              Export{" "}
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-md ">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => onRowClick && onRowClick(row.original)}
                  className={onRowClick ? "cursor-pointer" : ""}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {data.length > 10 && <DataTablePagination table={table} />}
      </div>
    </div>
  );
}
