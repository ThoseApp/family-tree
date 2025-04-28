import PageHeader from "@/components/page-header";
import FamilyMemberCard from "@/components/cards/family-member-card";
import { dummyFamilyMembers } from "@/lib/constants/landing";
import React from "react";

const FamilyMembersPage = () => {
  return (
    <div className="pb-20">
      <PageHeader
        title="The Mosuro Family"
        description="Get to know the amazing individuals that make up our "
        searchBar
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-8">
        {dummyFamilyMembers.map((member) => (
          <FamilyMemberCard key={member.id} {...member} />
        ))}
      </div>
    </div>
  );
};

export default FamilyMembersPage;
