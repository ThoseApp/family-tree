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
  onClick?: () => void;
}

const EventCard: React.FC<EventCardProps> = ({
  image,
  name = "Event image",
  description = "Event description",
  className = "",
  date,
  onClick,
}) => {
  return (
    <div className="relative w-full h-72 cursor-pointer" onClick={onClick}>
      {/* Main card container */}
      <div
        className={`relative w-[90%] h-[90%] rounded-2xl overflow-hidden shadow-lg transition-transform ease-in duration-300 hover:scale-105 z-20 ${className}`}
      >
        <div className="w-full h-full relative">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Date badge */}
          {date && (
            <div className="absolute top-4 right-4 bg-white rounded-lg overflow-hidden shadow-md z-30">
              <div className="bg-primary px-3 py-1">
                <p className="text-xs font-bold text-center text-primary-foreground">
                  {date.month.substring(0, 3).toUpperCase()}
                </p>
              </div>
              <div className="px-3 py-1">
                <p className="text-sm font-bold text-center text-foreground">
                  {date.day}
                </p>
              </div>
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/20 transition-opacity hover:opacity-0" />

          {/* Event title overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <h3 className="text-white font-semibold text-lg leading-tight">
              {name}
            </h3>
            {description && (
              <p className="text-white/90 text-sm mt-1 line-clamp-2">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Brown shadow background */}
      <div className="absolute right-0 bottom-0 w-[90%] h-[90%] rounded-2xl bg-[#49382A] z-10" />
    </div>
  );
};

export default EventCard;
