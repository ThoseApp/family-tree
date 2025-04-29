import Image from "next/image";
import React from "react";
import { Card, CardContent } from "../ui/card";

interface UpcomingEventCardProps {
  imageSrc: string;
  name: string;
  description: string;
  date?: {
    month: string;
    day: string;
  };
}

const UpcomingEventCard = ({
  imageSrc,
  name,
  description,
  date,
}: UpcomingEventCardProps) => {
  return (
    <Card
      className="w-full rounded-xl shadow-none border-none relative overflow-hidden group cursor-pointer transition-all duration-200 ease-in-out"
      // onClick={routeUser}
    >
      {/* TOP IMAGE */}
      <div className="relative h-[30vh] bg-border w-full  rounded-xl">
        <Image
          src={imageSrc}
          fill
          alt={name}
          className=" w-full h-full object-cover rounded-xl  transition-all duration-200 ease-in-out"
        />

        {date && (
          <div className="absolute top-4 right-4 bg-background rounded-lg overflow-hidden shadow-md z-10">
            <div className="bg-primary px-3 py-1">
              <p className="text-xs font-bold text-center text-foreground">
                {date.month}
              </p>
            </div>
            <div className="px-3 py-1">
              <p className="text-sm font-bold text-center text-foreground">
                {date.day}
              </p>
            </div>
          </div>
        )}
      </div>

      <CardContent className="pt-6 space-y-5 p-0">
        <div className=" text-xs font-normal  ">
          <div className="text-sm  py-2  pr-2 font-semibold ">{name}</div>
          <h3 className="pb-5">{description}</h3>
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingEventCard;
