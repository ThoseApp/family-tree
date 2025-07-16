"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LoadingIcon } from "@/components/loading-icon";
import { toast } from "sonner";
import { useEventsStore } from "@/stores/events-store";
import { useUserStore } from "@/stores/user-store";
import { Event } from "@/lib/types";
import {
  CheckCircle,
  XCircle,
  Calendar,
  User,
  Clock,
  Globe,
  Users,
} from "lucide-react";
import { dummyProfileImage } from "@/lib/constants";
import { EventStatusEnum } from "@/lib/constants/enums";

const PublisherEventRequestsPage = () => {
  const { user } = useUserStore();
  const {
    pendingEvents,
    loading,
    fetchPendingEvents,
    approveEvent,
    rejectEvent,
  } = useEventsStore();

  const [processingEvents, setProcessingEvents] = useState<Set<string>>(
    new Set()
  );
  const [actionDialog, setActionDialog] = useState<{
    isOpen: boolean;
    event: Event | null;
    action: "approve" | "reject" | null;
  }>({
    isOpen: false,
    event: null,
    action: null,
  });

  useEffect(() => {
    fetchPendingEvents();

    // Set up real-time subscription for pending events
    // Note: This would require setting up Supabase realtime subscriptions
    // For now, we'll refresh manually
  }, [fetchPendingEvents]);

  // Handle approve event request
  const handleApprove = (event: Event) => {
    setActionDialog({
      isOpen: true,
      event,
      action: "approve",
    });
  };

  // Handle reject event request
  const handleReject = (event: Event) => {
    setActionDialog({
      isOpen: true,
      event,
      action: "reject",
    });
  };

  // Execute the approval/rejection
  const executeAction = async () => {
    const { event, action } = actionDialog;
    if (!event || !action) return;

    setProcessingEvents((prev) => new Set(prev).add(event.id));

    try {
      if (action === "approve") {
        await approveEvent(event.id);
      } else {
        await rejectEvent(event.id);
      }

      // Refresh the pending events list
      fetchPendingEvents();
    } catch (error: any) {
      console.error(`Error ${action}ing event:`, error);
      toast.error(`Failed to ${action} event`);
    } finally {
      setProcessingEvents((prev) => {
        const newSet = new Set(prev);
        newSet.delete(event.id);
        return newSet;
      });
      setActionDialog({ isOpen: false, event: null, action: null });
    }
  };

  const formatDate = (date: string | { month: string; day: string }) => {
    if (typeof date === "string") {
      return new Date(date).toLocaleDateString();
    }
    return `${date.month} ${date.day}`;
  };

  const getEventTypeBadge = (isPublic?: boolean) => {
    return isPublic ? (
      <Badge variant="secondary" className="flex items-center gap-1">
        <Globe className="h-3 w-3" />
        Public
      </Badge>
    ) : (
      <Badge variant="outline" className="flex items-center gap-1">
        <Users className="h-3 w-3" />
        Private
      </Badge>
    );
  };

  return (
    <div className="flex flex-col gap-y-8 lg:gap-y-12">
      {/* HEADER SECTION */}
      <div>
        <h1 className="text-2xl font-semibold">Event Requests</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review and approve event submissions from family members.
        </p>
      </div>

      {/* STATS CARDS */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Events
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingEvents.length}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting your review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <LoadingIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{processingEvents.size}</div>
            <p className="text-xs text-muted-foreground">
              Currently being processed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Role</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Publisher</div>
            <p className="text-xs text-muted-foreground">Event manager</p>
          </CardContent>
        </Card>
      </div>

      {/* EVENTS TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Event Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && pendingEvents.length === 0 ? (
            <div className="flex items-center justify-center h-40">
              <LoadingIcon className="size-8" />
            </div>
          ) : pendingEvents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No pending event requests at this time.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Submitted By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {event.image && (
                          <div className="h-10 w-10 rounded-md overflow-hidden bg-muted">
                            <img
                              src={event.image}
                              alt={event.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{event.name}</div>
                          {event.description && (
                            <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                              {event.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={dummyProfileImage} />
                          <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">User</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {formatDate(event.date)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{event.category}</Badge>
                    </TableCell>
                    <TableCell>{getEventTypeBadge(event.is_public)}</TableCell>
                    <TableCell>
                      {event.created_at &&
                        new Date(event.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApprove(event)}
                          disabled={processingEvents.has(event.id)}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          {processingEvents.has(event.id) ? (
                            <LoadingIcon className="h-3 w-3" />
                          ) : (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Approve
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(event)}
                          disabled={processingEvents.has(event.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          {processingEvents.has(event.id) ? (
                            <LoadingIcon className="h-3 w-3" />
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              Reject
                            </>
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* CONFIRMATION DIALOG */}
      <AlertDialog
        open={actionDialog.isOpen}
        onOpenChange={(open) =>
          !open && setActionDialog({ isOpen: false, event: null, action: null })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionDialog.action === "approve"
                ? "Approve Event"
                : "Reject Event"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionDialog.action === "approve" ? (
                <>
                  Are you sure you want to approve the event{" "}
                  <strong>&quot;{actionDialog.event?.name}&quot;</strong>? It
                  will become visible to all family members.
                </>
              ) : (
                <>
                  Are you sure you want to reject the event{" "}
                  <strong>&quot;{actionDialog.event?.name}&quot;</strong>? The
                  submitter will be notified of the rejection.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeAction}
              className={
                actionDialog.action === "approve"
                  ? ""
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {actionDialog.action === "approve" ? "Approve" : "Reject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PublisherEventRequestsPage;
