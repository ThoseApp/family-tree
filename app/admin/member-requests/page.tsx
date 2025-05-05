import MemberRequestsTable from "@/components/tables/member-requests";
import { dummyFamilyMembers } from "@/lib/constants/dashbaord";
import React from "react";

const Page = () => {
  return (
    <div className="flex flex-col gap-y-8 lg:gap-y-12 ">
      {/* HEADER SECTION */}
      <div className="flex md:items-center md:flex-row flex-col md:justify-between gap-y-4">
        <h1 className="text-2xl font-semibold">Member Requests</h1>
      </div>

      <MemberRequestsTable data={dummyFamilyMembers} />
    </div>
  );
};

export default Page;
