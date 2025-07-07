import { NoticeBoard } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Edit, Trash, Pin, PinOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { format } from "date-fns";
import { DataTableColumnHeader } from "@/components/ui/table-reusuable/data-table-column-header";

export const createColumns = (
  onEditClick: (noticeBoard: NoticeBoard) => void,
  onDeleteClick: (id: string) => void,
  onTogglePinClick: (id: string, pinned: boolean) => void,
  showStatus = false,
  canEdit?: (noticeBoard: NoticeBoard) => boolean
): ColumnDef<NoticeBoard>[] => {
  const baseColumns: ColumnDef<NoticeBoard>[] = [
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Title" />
      ),
      cell: ({ row }) => {
        const isPinned = row.getValue("pinned") as boolean;
        return (
          <div className="flex items-center gap-2">
            {isPinned && (
              <Badge variant="default" className="bg-blue-100 text-blue-800">
                Pinned
              </Badge>
            )}
            <span>{row.getValue("title") as string}</span>
          </div>
        );
      },
      sortingFn: "alphanumeric",
    },
    {
      accessorKey: "description",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Description" />
      ),
      cell: ({ row }) => {
        const description: string = row.getValue("description") as string;
        return (
          <div className="max-w-[300px] truncate" title={description}>
            {description}
          </div>
        );
      },
      sortingFn: "alphanumeric",
    },
    {
      accessorKey: "editor",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Posted By" />
      ),
      sortingFn: "alphanumeric",
    },
  ];

  // Add status column if showStatus is true
  if (showStatus) {
    baseColumns.push({
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const noticeBoard = row.original;
        const status = noticeBoard.status as
          | "pending"
          | "approved"
          | "rejected";
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
    });
  }

  // Add remaining columns
  baseColumns.push(
    {
      accessorKey: "posteddate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Posted Date" />
      ),
      cell: ({ row }) => {
        const date = row.getValue("posteddate") as string;
        const formattedDate =
          typeof date === "string"
            ? new Date(date).toLocaleDateString()
            : format(new Date(date), "MMM dd, yyyy");
        return formattedDate;
      },
      sortingFn: (rowA, rowB, columnId) => {
        const dateA = rowA.getValue(columnId) as string;
        const dateB = rowB.getValue(columnId) as string;

        return new Date(dateA).getTime() - new Date(dateB).getTime();
      },
    },
    {
      accessorKey: "tags",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tags" />
      ),
      cell: ({ row }) => {
        const tags = row.getValue("tags") as string[];
        return (
          <div className="flex flex-wrap gap-1">
            {tags &&
              tags.map((tag, index) => (
                <Badge key={index} variant="outline">
                  {tag}
                </Badge>
              ))}
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
      accessorKey: "pinned",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Pinned" />
      ),
      cell: ({ row }) => {
        const pinned = row.getValue("pinned") as boolean;
        return pinned ? "Yes" : "No";
      },
      sortingFn: (rowA, rowB, columnId) => {
        const pinnedA = rowA.getValue(columnId) as boolean;
        const pinnedB = rowB.getValue(columnId) as boolean;

        // Sort pinned items first
        if (pinnedA && !pinnedB) return -1;
        if (!pinnedA && pinnedB) return 1;
        return 0;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const noticeBoard = row.original;
        const isPinned = noticeBoard.pinned;
        const canEditNotice = canEdit ? canEdit(noticeBoard) : true;

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onTogglePinClick(noticeBoard.id, !isPinned)}
              title={isPinned ? "Unpin" : "Pin"}
            >
              {isPinned ? (
                <PinOff className="h-4 w-4" />
              ) : (
                <Pin className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEditClick(noticeBoard)}
              title={
                canEditNotice
                  ? noticeBoard.status === "rejected"
                    ? "Edit & Resubmit"
                    : "Edit"
                  : "Cannot edit approved notices"
              }
              disabled={!canEditNotice}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDeleteClick(noticeBoard.id)}
              title="Delete"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        );
      },
      enableSorting: false,
    }
  );

  return baseColumns;
};
