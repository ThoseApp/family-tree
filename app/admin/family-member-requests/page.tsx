"use client";

import React, { useEffect } from "react";
import { useFamilyMemberRequestsStore } from "@/stores/family-member-requests-store";
import FamilyMemberRequestsTable from "@/components/tables/family-member-requests";
import { LoadingIcon } from "@/components/loading-icon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MemberRequestsPage = () => {
  const { requests, isLoading, fetchRequests } = useFamilyMemberRequestsStore();

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return (
    <div className="flex flex-col gap-y-8">
      <h1 className="text-2xl font-semibold">Family Member Requests</h1>
      <Card>
        <CardHeader>
          <CardTitle>Pending Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingIcon className="mr-2" />
              Loading requests...
            </div>
          ) : (
            <FamilyMemberRequestsTable
              data={requests}
              onRefresh={fetchRequests}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MemberRequestsPage;
