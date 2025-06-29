"use client";

import { ColumnDef } from "@tanstack/react-table";
import { EventInvitation } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import {
  Check,
  X,
  Trash2,
  MoreHorizontal,
  Calendar,
  User,
  Mail,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/components/ui/table-reusuable/data-table-column-header";
import { dummyProfileImage } from "@/lib/constants";

interface InvitationActionsProps {
  invitation: EventInvitation;
  type: "received" | "sent";
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
  onCancel?: (id: string) => void;
}

const InvitationActions: React.FC<InvitationActionsProps> = ({
  invitation,
  type,
  onAccept,
  onDecline,
  onCancel,
}) => {
  const isReceived = type === "received";
  const isPending = invitation.status === "pending";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>

        {isReceived && isPending && (
          <>
            <DropdownMenuItem
              onClick={() => onAccept?.(invitation.id)}
              className="text-green-600"
            >
              <Check className="mr-2 h-4 w-4" />
              Accept Invitation
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDecline?.(invitation.id)}
              className="text-red-600"
            >
              <X className="mr-2 h-4 w-4" />
              Decline Invitation
            </DropdownMenuItem>
          </>
        )}

        {!isReceived && isPending && (
          <DropdownMenuItem
            onClick={() => onCancel?.(invitation.id)}
            className="text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Cancel Invitation
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Calendar className="mr-2 h-4 w-4" />
          View Event Details
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const createInvitationColumns = (
  type: "received" | "sent",
  onAccept?: (id: string) => void,
  onDecline?: (id: string) => void,
  onCancel?: (id: string) => void
): ColumnDef<EventInvitation>[] => {
  const isReceived = type === "received";

  return [
    {
      accessorKey: "event",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Event" />
      ),
      cell: ({ row }) => {
        const event = row.original.event;
        return (
          <div className="space-y-1">
            <div className="font-medium">{event?.name || "Unknown Event"}</div>
            {event?.date && (
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {typeof event.date === "string"
                  ? format(new Date(event.date), "MMM dd, yyyy")
                  : `${event.date.month} ${event.date.day}`}
              </div>
            )}
            {event?.category && (
              <Badge variant="outline" className="text-xs">
                {event.category}
              </Badge>
            )}
          </div>
        );
      },
      sortingFn: (rowA, rowB, columnId) => {
        const eventA = rowA.original.event;
        const eventB = rowB.original.event;

        const nameA = eventA?.name || "Unknown Event";
        const nameB = eventB?.name || "Unknown Event";

        return nameA.localeCompare(nameB);
      },
    },
    {
      accessorKey: isReceived ? "inviter" : "invitee",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={isReceived ? "Invited By" : "Invited"}
        />
      ),
      cell: ({ row }) => {
        const user = isReceived ? row.original.inviter : row.original.invitee;
        const userName = user
          ? `${user.first_name} ${user.last_name}`
          : "Unknown User";

        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={user?.image || dummyProfileImage}
                alt={userName}
              />
              <AvatarFallback className="text-xs">
                {userName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{userName}</div>
            </div>
          </div>
        );
      },
      sortingFn: (rowA, rowB, columnId) => {
        const userA = isReceived
          ? rowA.original.inviter
          : rowA.original.invitee;
        const userB = isReceived
          ? rowB.original.inviter
          : rowB.original.invitee;

        const nameA = userA
          ? `${userA.first_name} ${userA.last_name}`
          : "Unknown User";
        const nameB = userB
          ? `${userB.first_name} ${userB.last_name}`
          : "Unknown User";

        return nameA.localeCompare(nameB);
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        let variant: "default" | "destructive" | "secondary" = "secondary";

        switch (status) {
          case "accepted":
            variant = "default";
            break;
          case "declined":
            variant = "destructive";
            break;
          case "pending":
            variant = "secondary";
            break;
        }

        return (
          <Badge variant={variant} className="capitalize">
            {status}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
      sortingFn: (rowA, rowB, columnId) => {
        const statusA = rowA.getValue(columnId) as string;
        const statusB = rowB.getValue(columnId) as string;

        // Define status priority for sorting
        const statusPriority = { pending: 0, accepted: 1, declined: 2 };
        const priorityA =
          statusPriority[statusA as keyof typeof statusPriority] ?? 999;
        const priorityB =
          statusPriority[statusB as keyof typeof statusPriority] ?? 999;

        return priorityA - priorityB;
      },
    },
    {
      accessorKey: "message",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Message" />
      ),
      cell: ({ row }) => {
        const message = row.getValue("message") as string;
        return message ? (
          <div className="max-w-[200px]">
            <div className="truncate text-sm">&quot;{message}&quot;</div>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">No message</span>
        );
      },
      sortingFn: "alphanumeric",
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Invited On" />
      ),
      cell: ({ row }) => {
        const date = row.getValue("created_at") as string;
        return (
          <div className="text-sm">
            {format(new Date(date), "MMM dd, yyyy")}
          </div>
        );
      },
      sortingFn: (rowA, rowB, columnId) => {
        const dateA = rowA.getValue(columnId) as string;
        const dateB = rowB.getValue(columnId) as string;

        return new Date(dateA).getTime() - new Date(dateB).getTime();
      },
    },
    {
      accessorKey: "responded_at",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Responded On" />
      ),
      cell: ({ row }) => {
        const date = row.getValue("responded_at") as string;
        return date ? (
          <div className="text-sm">
            {format(new Date(date), "MMM dd, yyyy")}
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        );
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
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        return (
          <InvitationActions
            invitation={row.original}
            type={type}
            onAccept={onAccept}
            onDecline={onDecline}
            onCancel={onCancel}
          />
        );
      },
      enableSorting: false,
    },
  ];
};
