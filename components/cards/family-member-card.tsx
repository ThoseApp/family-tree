"use client";

import Image from "next/image";
import React from "react";
import { Card, CardContent } from "../ui/card";
import { useRouter } from "next/navigation";

interface FamilyMemberCardProps {
  imageSrc: string;
  name: string;
  description: string;
}

const FamilyMemberCard = ({
  imageSrc,
  name,
  description,
}: FamilyMemberCardProps) => {
  const router = useRouter();

  const routeUser = () => {
    router.push(`/profile/${name}`);
  };
  return (
    <Card
      className="w-full rounded-xl border relative shadow-md overflow-hidden group cursor-pointer transition-all duration-200 ease-in-out"
      onClick={routeUser}
    >
      {/* TOP IMAGE */}
      <div className="relative h-[30vh] bg-border w-full">
        <Image
          src={imageSrc}
          fill
          alt={name}
          className=" w-full h-full object-cover rounded-t-xl  transition-all duration-200 ease-in-out"
        />
      </div>

      <CardContent className="pt-6 space-y-5 p-0">
        <div className=" text-xs font-normal  ">
          <div className="text-sm inline-block border-b border-foreground py-2 pl-6 pr-2 font-semibold ">
            {name}
          </div>
          <div className="pl-6 py-2 space-y-2">
            <div className="font-semibold">Born on dd-mm-yyyy</div>

            <h3 className="pb-5">{description}</h3>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FamilyMemberCard;
