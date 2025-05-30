import React from "react";
import Image from "next/image";
import Link from "next/link";

interface EventCardProps {
  image: string;
  name?: string;
  description?: string;
  className?: string;
  date?: {
    month: string;
    day: string;
  };
}

const EventCard: React.FC<EventCardProps> = ({
  image,
  name = "Event image",
  description = "Event description",
  className = "",
  date,
}) => {
  return (
    <Link href={`/profile/user`} className="relative aspect-[1/1]">
      <div
        className={`absolute top-0 left-0 z-10 w-[90%] h-[90%] rounded-2xl overflow-hidden shadow-lg transition-transform ease-in duration-300 hover:scale-105 ${className}`}
      >
        <div className="aspect-square w-full relative">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover bg-background"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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

          <div className="absolute inset-0 bg-foreground/20 transition-opacity hover:opacity-0" />
        </div>
      </div>

      {/* BROWN BG */}
      <div className="absolute right-0 bottom-0 w-[90%] h-[90%] rounded-2xl bg-[#49382A]" />
    </Link>
  );
};

export default EventCard;
