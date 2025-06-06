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

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.ceil(
      (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Format the date in a readable format
    const formattedDate = date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Add relative time context for better UX
    if (diffInDays === 0) {
      return `Today • ${formattedDate}`;
    } else if (diffInDays === 1) {
      return `Tomorrow • ${formattedDate}`;
    } else if (diffInDays > 0 && diffInDays <= 7) {
      return `In ${diffInDays} days • ${formattedDate}`;
    } else if (diffInDays < 0 && diffInDays >= -7) {
      return `${Math.abs(diffInDays)} days ago • ${formattedDate}`;
    } else {
      return formattedDate;
    }
  } catch (error) {
    // Fallback to original string if parsing fails
    return dateString;
  }
};

const DashboardOverviewCard = ({
  imageSrc,
  title,
  date,
  description,
  routePath,
}: DashboardOverviewCardProps) => {
  const formattedDate = formatDate(date);

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
          <div className="text-center">
            <p className="lg:text-lg text-base text-background/90 font-medium">
              {formattedDate}
            </p>
          </div>
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
