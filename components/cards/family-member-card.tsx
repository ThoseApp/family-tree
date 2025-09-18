"use client";

import Image from "next/image";
import React from "react";
import { Card, CardContent } from "../ui/card";
import { useRouter } from "next/navigation";
import { dummyProfileImage } from "@/lib/constants";
import { FamilyMember } from "@/lib/types";

interface FamilyMemberCardProps {
  member: FamilyMember;
}

const FamilyMemberCard = ({ member }: FamilyMemberCardProps) => {
  const router = useRouter();

  const routeUser = () => {
    router.push(`/profile/${member.unique_id}`);
  };

  return (
    <Card
      className="w-full rounded-xl hover:scale-105 hover:shadow-lg border relative shadow-md group cursor-pointer transition-all duration-200 ease-in-out group-hover:cursor-pointer"
      onClick={routeUser}
    >
      {/* TOP IMAGE */}
      <div className="relative group-hover:cursor-pointer h-[30vh] bg-border w-full">
        <Image
          src={member.imageSrc || dummyProfileImage}
          fill
          alt={member.name}
          className=" w-full h-full object-cover rounded-t-xl  transition-all duration-200 ease-in-out"
        />
      </div>

      <CardContent className="pt-6 space-y-5 p-0">
        <div className=" text-xs font-normal  ">
          <div className="text-sm inline-block border-b border-foreground py-2 pl-6 pr-2 font-semibold ">
            {member.name}
          </div>
          <div className="pl-6 py-2 space-y-2">
            {/* <div className="font-semibold">Born on dd-mm-yyyy</div> */}

            {/* <h3 className="pb-5">{description}</h3> */}
            <div className="flex items-center gap-3 text-muted-foreground">
              <span className="text-xs">ID: {member.unique_id}</span>
              {member.lifeStatus &&
                member.lifeStatus.toLowerCase() !== "alive" && (
                  <span className="text-xs">Status: {member.lifeStatus}</span>
                )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FamilyMemberCard;
