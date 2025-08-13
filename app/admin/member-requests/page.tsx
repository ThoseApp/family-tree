"use client";

import MemberRequestsTable from "@/components/tables/member-requests";
import { useMemberRequestsStore } from "@/stores/member-requests-store";
import { LoadingIcon } from "@/components/loading-icon";
import React, { useEffect } from "react";

const Page = () => {
  const {
    memberRequests,
    loading,
    error,
    fetchMemberRequests,
    refreshRequests,
    clearError,
  } = useMemberRequestsStore();

  useEffect(() => {
    fetchMemberRequests();
  }, [fetchMemberRequests]);

  return (
    <div className="flex flex-col gap-y-8 lg:gap-y-12 ">
      {/* HEADER SECTION */}
      <div className="flex md:items-center md:flex-row flex-col md:justify-between gap-y-4">
        <div>
          <h1 className="text-2xl font-semibold">Member Requests</h1>
          <p className="text-gray-600 text-sm">
            Approve or reject new member registration requests
          </p>
        </div>
        {memberRequests.length > 0 && (
          <div className="text-sm text-gray-500">
            {memberRequests.length} pending request
            {memberRequests.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingIcon />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
          <button
            onClick={refreshRequests}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      ) : memberRequests.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No pending member requests</p>
        </div>
      ) : (
        <MemberRequestsTable
          data={memberRequests}
          onRefresh={refreshRequests}
        />
      )}
    </div>
  );
};

export default Page;
