"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Mail, Users, Check, X, Trash2 } from "lucide-react";
import { useEventInvitationsStore } from "@/stores/event-invitations-store";
import { useUserStore } from "@/stores/user-store";
import { LoadingIcon } from "@/components/loading-icon";
import { format } from "date-fns";
import { toast } from "sonner";
import { EventInvitation } from "@/lib/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { dummyProfileImage } from "@/lib/constants";

const InvitationsComponent = () => {
  const {
    invitations,
    sentInvitations,
    loading,
    fetchReceivedInvitations,
    fetchSentInvitations,
    respondToInvitation,
    cancelInvitation,
  } = useEventInvitationsStore();

  const { user } = useUserStore();
  const [activeTab, setActiveTab] = useState("received");

  useEffect(() => {
    if (user) {
      fetchReceivedInvitations(user.id);
      fetchSentInvitations(user.id);
    }
  }, [user, fetchReceivedInvitations, fetchSentInvitations]);

  const handleAcceptInvitation = async (invitationId: string) => {
    const success = await respondToInvitation(invitationId, "accepted");
    if (success && user) {
      // Refresh the data
      fetchReceivedInvitations(user.id);
    }
  };

  const handleDeclineInvitation = async (invitationId: string) => {
    const success = await respondToInvitation(invitationId, "declined");
    if (success && user) {
      // Refresh the data
      fetchReceivedInvitations(user.id);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    const success = await cancelInvitation(invitationId);
    if (success && user) {
      // Refresh the data
      fetchSentInvitations(user.id);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "accepted":
        return "default";
      case "declined":
        return "destructive";
      case "pending":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getStatusBadgeText = (status: string) => {
    switch (status) {
      case "accepted":
        return "Accepted";
      case "declined":
        return "Declined";
      case "pending":
        return "Pending";
      default:
        return status;
    }
  };

  const formatEventDate = (
    dateValue: string | { month: string; day: string }
  ) => {
    try {
      if (typeof dateValue === "string") {
        const date = new Date(dateValue);
        return format(date, "MMM dd, yyyy");
      } else if (
        dateValue &&
        typeof dateValue === "object" &&
        "month" in dateValue &&
        "day" in dateValue
      ) {
        return `${dateValue.month} ${dateValue.day}`;
      }
      return "Invalid date";
    } catch {
      return typeof dateValue === "string" ? dateValue : "Invalid date";
    }
  };

  if (loading && invitations.length === 0 && sentInvitations.length === 0) {
    return (
      <div className="flex items-center justify-center h-40">
        <LoadingIcon className="size-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">Event Invitations</h1>
        <p className="text-muted-foreground">
          Manage your event invitations and track responses from family members.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="received" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Received ({invitations.length})
          </TabsTrigger>
          <TabsTrigger value="sent" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Sent ({sentInvitations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="mt-6">
          {invitations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Mail className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No invitations yet
                </h3>
                <p className="text-muted-foreground text-center">
                  You haven't received any event invitations from family
                  members.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {invitations.map((invitation) => (
                <InvitationCard
                  key={invitation.id}
                  invitation={invitation}
                  type="received"
                  onAccept={() => handleAcceptInvitation(invitation.id)}
                  onDecline={() => handleDeclineInvitation(invitation.id)}
                  formatEventDate={formatEventDate}
                  getStatusBadgeVariant={getStatusBadgeVariant}
                  getStatusBadgeText={getStatusBadgeText}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sent" className="mt-6">
          {sentInvitations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No sent invitations
                </h3>
                <p className="text-muted-foreground text-center">
                  You haven't sent any event invitations to family members yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {sentInvitations.map((invitation) => (
                <InvitationCard
                  key={invitation.id}
                  invitation={invitation}
                  type="sent"
                  onCancel={() => handleCancelInvitation(invitation.id)}
                  formatEventDate={formatEventDate}
                  getStatusBadgeVariant={getStatusBadgeVariant}
                  getStatusBadgeText={getStatusBadgeText}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface InvitationCardProps {
  invitation: EventInvitation;
  type: "received" | "sent";
  onAccept?: () => void;
  onDecline?: () => void;
  onCancel?: () => void;
  formatEventDate: (date: string | { month: string; day: string }) => string;
  getStatusBadgeVariant: (
    status: string
  ) => "default" | "destructive" | "secondary";
  getStatusBadgeText: (status: string) => string;
}

const InvitationCard: React.FC<InvitationCardProps> = ({
  invitation,
  type,
  onAccept,
  onDecline,
  onCancel,
  formatEventDate,
  getStatusBadgeVariant,
  getStatusBadgeText,
}) => {
  const isReceived = type === "received";
  const otherUser = isReceived ? invitation.inviter : invitation.invitee;
  const userName = otherUser
    ? `${otherUser.first_name} ${otherUser.last_name}`
    : "Unknown User";

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={otherUser?.image || dummyProfileImage}
                alt={userName}
              />
              <AvatarFallback>
                {userName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-lg">
                  {invitation.event?.name || "Unknown Event"}
                </h3>
                <Badge variant={getStatusBadgeVariant(invitation.status)}>
                  {getStatusBadgeText(invitation.status)}
                </Badge>
              </div>

              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>
                    {isReceived
                      ? `Invited by ${userName}`
                      : `Invited ${userName}`}
                  </span>
                </div>

                {invitation.event?.date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatEventDate(invitation.event.date!)}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>
                    Invited{" "}
                    {format(new Date(invitation.created_at), "MMM dd, yyyy")}
                  </span>
                </div>

                {invitation.responded_at && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>
                      Responded{" "}
                      {format(
                        new Date(invitation.responded_at),
                        "MMM dd, yyyy"
                      )}
                    </span>
                  </div>
                )}
              </div>

              {invitation.message && (
                <div className="bg-muted p-3 rounded-md mt-3">
                  <p className="text-sm italic">"{invitation.message}"</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {isReceived && invitation.status === "pending" && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="default"
                  onClick={onAccept}
                  className="flex items-center gap-1"
                >
                  <Check className="h-4 w-4" />
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onDecline}
                  className="flex items-center gap-1"
                >
                  <X className="h-4 w-4" />
                  Decline
                </Button>
              </div>
            )}

            {!isReceived && invitation.status === "pending" && onCancel && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-1"
                  >
                    <Trash2 className="h-4 w-4" />
                    Cancel
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Invitation</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to cancel this invitation? This
                      action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Invitation</AlertDialogCancel>
                    <AlertDialogAction onClick={onCancel}>
                      Cancel Invitation
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvitationsComponent;
