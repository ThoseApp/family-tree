"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useFamilyMemberRequestsStore } from "@/stores/family-member-requests-store";
import FamilyMemberRequestsTable from "@/components/tables/family-member-requests";
import { FamilyMemberRequestDetailsModal } from "@/components/modals/family-member-request-details-modal";
import { LoadingIcon } from "@/components/loading-icon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  Download,
  Eye,
} from "lucide-react";
import { FamilyMemberRequest } from "@/lib/types";
import { format } from "date-fns";
import { LifeStatusEnum } from "@/lib/constants/enums";

const MemberRequestsPage = () => {
  const { requests, isLoading, fetchRequests, approveRequest, rejectRequest } =
    useFamilyMemberRequestsStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [lifeStatusFilter, setLifeStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  // Modal state
  const [selectedRequest, setSelectedRequest] =
    useState<FamilyMemberRequest | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Statistics calculations
  const statistics = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter((r) => r.status === "pending").length;
    const approved = requests.filter((r) => r.status === "approved").length;
    const rejected = requests.filter((r) => r.status === "rejected").length;
    const accountEligible = requests.filter(
      (r) => r.life_status === LifeStatusEnum.accountEligible
    ).length;
    const deceased = requests.filter(
      (r) => r.life_status === LifeStatusEnum.deceased
    ).length;
    const children = requests.filter(
      (r) => r.life_status === LifeStatusEnum.child
    ).length;
    const withEmail = requests.filter(
      (r) => r.email_address && r.email_address.trim() !== ""
    ).length;

    // Recent requests (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentRequests = requests.filter(
      (r) => new Date(r.created_at) > sevenDaysAgo
    ).length;

    return {
      total,
      pending,
      approved,
      rejected,
      accountEligible,
      deceased,
      children,
      withEmail,
      recentRequests,
      pendingPercentage: total > 0 ? Math.round((pending / total) * 100) : 0,
      approvalRate:
        approved + rejected > 0
          ? Math.round((approved / (approved + rejected)) * 100)
          : 0,
    };
  }, [requests]);

  // Filtered and sorted requests
  const filteredRequests = useMemo(() => {
    let filtered = requests;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (request) =>
          `${request.first_name} ${request.last_name}`
            .toLowerCase()
            .includes(term) ||
          request.email_address?.toLowerCase().includes(term) ||
          request.fathers_first_name?.toLowerCase().includes(term) ||
          request.mothers_first_name?.toLowerCase().includes(term) ||
          request.spouses_first_name?.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((request) => request.status === statusFilter);
    }

    // Life status filter
    if (lifeStatusFilter !== "all") {
      filtered = filtered.filter(
        (request) => request.life_status === lifeStatusFilter
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        case "oldest":
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        case "name":
          return `${a.first_name} ${a.last_name}`.localeCompare(
            `${b.first_name} ${b.last_name}`
          );
        case "status":
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    return filtered;
  }, [requests, searchTerm, statusFilter, lifeStatusFilter, sortBy]);

  const handleRefresh = () => {
    fetchRequests();
  };

  const handleViewDetails = (request: FamilyMemberRequest) => {
    setSelectedRequest(request);
    setIsDetailsModalOpen(true);
  };

  const handleApprove = async (requestId: string) => {
    setModalLoading(true);
    try {
      await approveRequest(requestId);
      setIsDetailsModalOpen(false);
      handleRefresh();
    } catch (error) {
      console.error("Error approving request:", error);
    } finally {
      setModalLoading(false);
    }
  };

  const handleReject = async (requestId: string) => {
    setModalLoading(true);
    try {
      await rejectRequest(requestId);
      setIsDetailsModalOpen(false);
      handleRefresh();
    } catch (error) {
      console.error("Error rejecting request:", error);
    } finally {
      setModalLoading(false);
    }
  };

  const exportData = () => {
    const csvContent = [
      [
        "Name",
        "Gender",
        "Life Status",
        "Email",
        "Father",
        "Mother",
        "Spouse",
        "Status",
        "Created Date",
      ].join(","),
      ...filteredRequests.map((request) =>
        [
          `"${request.first_name} ${request.last_name}"`,
          request.gender || "",
          request.life_status || "",
          request.email_address || "",
          request.fathers_first_name
            ? `"${request.fathers_first_name} ${
                request.fathers_last_name || ""
              }"`
            : "",
          request.mothers_first_name
            ? `"${request.mothers_first_name} ${
                request.mothers_last_name || ""
              }"`
            : "",
          request.spouses_first_name
            ? `"${request.spouses_first_name} ${
                request.spouses_last_name || ""
              }"`
            : "",
          request.status,
          format(new Date(request.created_at), "yyyy-MM-dd HH:mm"),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `family-member-requests-${format(
      new Date(),
      "yyyy-MM-dd"
    )}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Family Member Requests
          </h1>
          <p className="text-muted-foreground">
            Manage and review family member addition requests from users
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportData}
            disabled={filteredRequests.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Requests
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.total}</div>
            <p className="text-xs text-muted-foreground">
              {statistics.recentRequests} in last 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Review
            </CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {statistics.pending}
            </div>
            <p className="text-xs text-muted-foreground">
              Requires immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {statistics.approved}
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully processed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {statistics.rejected}
            </div>
            <p className="text-xs text-muted-foreground">Declined requests</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or family..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Life Status</label>
              <Select
                value={lifeStatusFilter}
                onValueChange={setLifeStatusFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All life statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Life Statuses</SelectItem>
                  <SelectItem value={LifeStatusEnum.accountEligible}>
                    Account Eligible
                  </SelectItem>
                  <SelectItem value={LifeStatusEnum.deceased}>
                    Deceased
                  </SelectItem>
                  <SelectItem value={LifeStatusEnum.child}>Child</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {(searchTerm ||
            statusFilter !== "all" ||
            lifeStatusFilter !== "all") && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Eye className="h-4 w-4" />
                Showing {filteredRequests.length} of {statistics.total} requests
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setLifeStatusFilter("all");
                  setSortBy("newest");
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Family Member Requests</span>
            {statistics.pending > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                {statistics.pending} Pending Review
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <LoadingIcon className="h-8 w-8" />
              <div className="text-center">
                <p className="text-lg font-medium">Loading requests...</p>
                <p className="text-sm text-muted-foreground">
                  Fetching family member requests from the database
                </p>
              </div>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="rounded-full bg-muted p-4">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-lg font-medium">No requests found</p>
                <p className="text-sm text-muted-foreground">
                  {searchTerm ||
                  statusFilter !== "all" ||
                  lifeStatusFilter !== "all"
                    ? "Try adjusting your filters to see more results"
                    : "No family member requests have been submitted yet"}
                </p>
              </div>
            </div>
          ) : (
            <FamilyMemberRequestsTable
              data={filteredRequests}
              onRefresh={fetchRequests}
              onViewDetails={handleViewDetails}
            />
          )}
        </CardContent>
      </Card>

      {/* Alert for pending requests */}
      {statistics.pending > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="font-medium text-orange-800">
                  {statistics.pending} request
                  {statistics.pending > 1 ? "s" : ""} awaiting your review
                </p>
                <p className="text-sm text-orange-700">
                  Click &quot;View Details&quot; on any request to see complete
                  information and take action.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Details Modal */}
      <FamilyMemberRequestDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        request={selectedRequest}
        onApprove={handleApprove}
        onReject={handleReject}
        isLoading={modalLoading}
      />
    </div>
  );
};

export default MemberRequestsPage;
