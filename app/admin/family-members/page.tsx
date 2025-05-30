import FamilyMembersTable from "@/components/tables/family-members";
import { Button } from "@/components/ui/button";
import { dummyFamilyMembers } from "@/lib/constants/dashbaord";
import { Plus } from "lucide-react";
import React from "react";

const Page = () => {
  return (
    <div className="flex flex-col gap-y-8 lg:gap-y-12">
      {/* HEADER SECTION */}
      <div className="flex md:items-center md:flex-row flex-col md: justify-between gap-y-4">
        <h1 className="text-2xl font-semibold">Family Members</h1>

        <div className="flex items-center gap-4">
          <Button variant="outline" className="rounded-full">
            Add Family Members Form
          </Button>

          <Button className="bg-foreground text-background rounded-full hover:bg-foreground/80">
            <Plus className="size-5" />
            Add Family Member
          </Button>
        </div>
      </div>

      <FamilyMembersTable data={dummyFamilyMembers} />
    </div>
  );
};

export default Page;
