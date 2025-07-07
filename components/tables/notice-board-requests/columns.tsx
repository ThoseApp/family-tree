import { NoticeBoard } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { format } from "date-fns";
import { DataTableColumnHeader } from "@/components/ui/table-reusuable/data-table-column-header";
import { Trash2, Eye } from "lucide-react";

export const columns: ColumnDef<NoticeBoard>[] = [
  {
    id: "s/n",
    header: "S/N",
    cell: ({ row }) => {
      return <div className="text-left">{row.index + 1}</div>;
    },
    enableSorting: false,
  },

  {
    id: "title",
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => {
      const noticeBoard = row.original;
      return (
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium">{noticeBoard.title}</p>
          {noticeBoard.pinned && (
            <Badge
              variant="default"
              className="bg-blue-100 text-blue-800 w-fit"
            >
              Pinned
            </Badge>
          )}
        </div>
      );
    },
    sortingFn: "alphanumeric",
  },

  {
    id: "description",
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Description" />
    ),
    cell: ({ row }) => {
      const description = row.original.description;
      return (
        <div className="max-w-[300px]">
          <p className="text-sm line-clamp-3" title={description}>
            {description}
          </p>
        </div>
      );
    },
    sortingFn: "alphanumeric",
  },

  {
    id: "editor",
    accessorKey: "editor",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Posted By" />
    ),
    cell: ({ row }) => {
      const editor = row.original.editor;
      return <p className="text-sm">{editor}</p>;
    },
    sortingFn: "alphanumeric",
  },

  {
    id: "tags",
    accessorKey: "tags",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tags" />
    ),
    cell: ({ row }) => {
      const tags = row.original.tags;
      return (
        <div className="flex flex-wrap gap-1">
          {tags &&
            tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          {tags && tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{tags.length - 3}
            </Badge>
          )}
        </div>
      );
    },
    sortingFn: (rowA, rowB, columnId) => {
      const tagsA = rowA.getValue(columnId) as string[];
      const tagsB = rowB.getValue(columnId) as string[];

      const tagsStringA = tagsA ? tagsA.join(", ") : "";
      const tagsStringB = tagsB ? tagsB.join(", ") : "";

      return tagsStringA.localeCompare(tagsStringB);
    },
  },

  {
    id: "posteddate",
    accessorKey: "posteddate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Submitted On" />
    ),
    cell: ({ row }) => {
      const date = row.original.posteddate;
      const formattedDate = date
        ? format(new Date(date), "MMM dd, yyyy")
        : "Unknown";
      return <p className="text-sm">{formattedDate}</p>;
    },
    sortingFn: (rowA, rowB, columnId) => {
      const dateA = rowA.getValue(columnId) as string;
      const dateB = rowB.getValue(columnId) as string;

      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;

      return new Date(dateA).getTime() - new Date(dateB).getTime();
    },
  },

  {
    id: "status",
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const noticeBoard = row.original;
      const status = noticeBoard.status as "pending" | "approved" | "rejected";
      return (
        <div className="flex justify-start">
          <StatusBadge status={status || "pending"} />
        </div>
      );
    },
    sortingFn: (rowA, rowB, columnId) => {
      const statusA = rowA.getValue(columnId) as string;
      const statusB = rowB.getValue(columnId) as string;

      // Define status priority for sorting
      const statusPriority = { pending: 0, approved: 1, rejected: 2 };
      const priorityA =
        statusPriority[statusA as keyof typeof statusPriority] ?? 999;
      const priorityB =
        statusPriority[statusB as keyof typeof statusPriority] ?? 999;

      return priorityA - priorityB;
    },
  },

  {
    id: "action",
    header: "Action",
    cell: ({ row, table }) => {
      const noticeBoard = row.original;

      // Access custom props from table.options
      const { onApprove, onDecline, processingItems } = table.options as any;
      const isProcessing = processingItems?.has(noticeBoard.id) || false;

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="destructive"
            onClick={(e) => {
              e.stopPropagation();
              if (onDecline && noticeBoard.id) {
                onDecline(noticeBoard.id);
              }
            }}
            disabled={isProcessing}
            className="flex justify-end"
          >
            {isProcessing ? "Processing..." : "Decline"}
          </Button>

          <Button
            className="flex justify-end bg-green-500 hover:bg-green-500/80 text-background"
            onClick={(e) => {
              e.stopPropagation();
              if (onApprove && noticeBoard.id) {
                onApprove(noticeBoard.id);
              }
            }}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Approve"}
          </Button>
        </div>
      );
    },
    enableSorting: false,
  },
];
