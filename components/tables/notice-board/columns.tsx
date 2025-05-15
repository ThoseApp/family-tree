import { NoticeBoard } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Edit, Trash, Pin, PinOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export const createColumns = (
  onEditClick: (noticeBoard: NoticeBoard) => void,
  onDeleteClick: (id: string) => void,
  onTogglePinClick: (id: string, pinned: boolean) => void
): ColumnDef<NoticeBoard>[] => [
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
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
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const description: string = row.getValue("description") as string;
      return (
        <div className="max-w-[300px] truncate" title={description}>
          {description}
        </div>
      );
    },
  },
  {
    accessorKey: "editor",
    header: "Posted By",
  },
  {
    accessorKey: "posteddate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Posted Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue("posteddate") as string;
      const formattedDate =
        typeof date === "string"
          ? new Date(date).toLocaleDateString()
          : format(new Date(date), "MMM dd, yyyy");
      return formattedDate;
    },
  },
  {
    accessorKey: "tags",
    header: "Tags",
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
  },
  {
    accessorKey: "pinned",
    header: "Pinned",
    cell: ({ row }) => {
      const pinned = row.getValue("pinned") as boolean;
      return pinned ? "Yes" : "No";
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const noticeBoard = row.original;
      const isPinned = noticeBoard.pinned;

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
            title="Edit"
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
  },
];
