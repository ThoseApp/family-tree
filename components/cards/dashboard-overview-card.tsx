import Image from "next/image";
import React from "react";
import { Button } from "../ui/button";
import { Link, ArrowRight } from "lucide-react";

interface DashboardOverviewCardProps {
  imageSrc: string;
  title: string;
  date: string;
  description: string;
  routePath: string;
}

const DashboardOverviewCard = ({
  imageSrc,
  title,
  date,
  description,
  routePath,
}: DashboardOverviewCardProps) => {
  return (
    <div className=" relative h-[390px] w-full rounded-lg bg-background shadow-md">
      <Image
        src="/images/dashboard/confetti.webp"
        alt={title}
        fill
        className="h-full w-full object-cover object-center rounded-lg"
      />

      <div className="absolute inset-0 bg-foreground/30 rounded-lg" />

      <div className="z-10 absolute inset-0 h-full w-full flex flex-col items-center justify-between p-8 lg:p-12">
        <div className="flex flex-col items-center justify-center gap-y-2 text-background font-semibold">
          <h3 className="lg:text-4xl text-2xl ">{title}</h3>
          <p className="lg:text-xl text-lg ">{date}</p>
          <p className="lg:text-xl text-lg ">{description}</p>
        </div>

        <Button
          className=" bg-background hover:bg-background/80 rounded-full text-[#016B81] font-semibold"
          size={"lg"}
          //   asChild
        >
          {/* <Link
            href={routePath}
            className="flex items-center text-black gap-x-2"
          > */}
          Click to RSVP
          <ArrowRight className="size-4 text-[#016B81]" />
          {/* </Link> */}
        </Button>
      </div>
    </div>
  );
};

export default DashboardOverviewCard;
