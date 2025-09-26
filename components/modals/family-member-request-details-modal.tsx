"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Calendar,
  Mail,
  Users,
  Heart,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { FamilyMemberRequest } from "@/lib/types";
import { format } from "date-fns";
import { LifeStatusEnum } from "@/lib/constants/enums";
import Image from "next/image";

interface FamilyMemberRequestDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: FamilyMemberRequest | null;
  onApprove?: (requestId: string) => void;
  onReject?: (requestId: string) => void;
  isLoading?: boolean;
}

export const FamilyMemberRequestDetailsModal: React.FC<
  FamilyMemberRequestDetailsModalProps
> = ({ isOpen, onClose, request, onApprove, onReject, isLoading = false }) => {
  if (!request) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getLifeStatusColor = (status?: string) => {
    switch (status) {
      case LifeStatusEnum.accountEligible:
        return "bg-green-100 text-green-800 border-green-200";
      case LifeStatusEnum.deceased:
        return "bg-gray-100 text-gray-800 border-gray-200";
      case LifeStatusEnum.child:
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Family Member Request Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {request.picture_link && (
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200">
                  <Image
                    src={request.picture_link}
                    alt={`${request.first_name} ${request.last_name}`}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold">
                  {request.first_name} {request.last_name}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={getStatusColor(request.status)}>
                    {request.status.charAt(0).toUpperCase() +
                      request.status.slice(1)}
                  </Badge>
                  {request.life_status && (
                    <Badge className={getLifeStatusColor(request.life_status)}>
                      {request.life_status}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Submitted {format(new Date(request.created_at), "PPp")}
              </div>
            </div>
          </div>

          <Separator />

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Gender
                </label>
                <p className="text-sm">{request.gender || "Not specified"}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Life Status
                </label>
                <p className="text-sm">
                  {request.life_status || "Not specified"}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Date of Birth
                </label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">
                    {request.date_of_birth
                      ? format(new Date(request.date_of_birth), "PPP")
                      : "Not specified"}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Email Address
                </label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">
                    {request.email_address || "Not provided"}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Order of Birth
                </label>
                <p className="text-sm">
                  {request.order_of_birth || "Not specified"}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Order of Marriage
                </label>
                <p className="text-sm">
                  {request.order_of_marriage || "Not specified"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Family Relationships */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Family Relationships
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Father
                  </label>
                  <p className="text-sm">
                    {request.fathers_first_name && request.fathers_last_name
                      ? `${request.fathers_first_name} ${request.fathers_last_name}`
                      : request.fathers_first_name || "Not specified"}
                  </p>
                  {request.fathers_uid && (
                    <p className="text-xs text-muted-foreground">
                      ID: {request.fathers_uid}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Mother
                  </label>
                  <p className="text-sm">
                    {request.mothers_first_name && request.mothers_last_name
                      ? `${request.mothers_first_name} ${request.mothers_last_name}`
                      : request.mothers_first_name || "Not specified"}
                  </p>
                  {request.mothers_uid && (
                    <p className="text-xs text-muted-foreground">
                      ID: {request.mothers_uid}
                    </p>
                  )}
                </div>
              </div>

              {(request.spouses_first_name || request.spouses_last_name) && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Spouse
                  </label>
                  <p className="text-sm">
                    {request.spouses_first_name && request.spouses_last_name
                      ? `${request.spouses_first_name} ${request.spouses_last_name}`
                      : request.spouses_first_name || "Not specified"}
                  </p>
                  {request.spouse_uid && (
                    <p className="text-xs text-muted-foreground">
                      ID: {request.spouse_uid}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Information */}
          {request.marital_status && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Description/Notes
                  </label>
                  <p className="text-sm whitespace-pre-wrap">
                    {request.marital_status ||
                      "No additional information provided"}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Account Creation Status */}
          {request.email_address && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-800">
                      Account Creation Ready
                    </p>
                    <p className="text-sm text-blue-700">
                      This member has an email address and can have an account
                      created upon approval.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          {request.status === "pending" && (
            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={onClose} disabled={isLoading}>
                Close
              </Button>
              <Button
                variant="destructive"
                onClick={() => onReject?.(request.id)}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <XCircle className="h-4 w-4" />
                Reject Request
              </Button>
              <Button
                onClick={() => onApprove?.(request.id)}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Approve Request
              </Button>
            </div>
          )}

          {request.status !== "pending" && (
            <div className="flex items-center justify-end pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
