import Image from "next/image";
import React from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ProfileHistoryCardProps {
  imageSrc: string;
  name: string;
  description: string;
}

const ProfileHistoryCard = ({
  imageSrc,
  name,
  description,
}: ProfileHistoryCardProps) => {
  return (
    <Card className="shadow-xl z-10">
      <CardContent className="p-6">
        <div className="relative w-full aspect-square mb-4">
          <Image
            src={imageSrc}
            alt={name}
            fill
            className="object-cover rounded-lg"
          />
        </div>
        <CardTitle className="text-xl mb-2">{name}</CardTitle>
        <CardDescription className="text-gray-600 mb-4 text-sm">
          {description}
        </CardDescription>
        <button className="flex items-center text-gray-800 hover:text-gray-600 transition-colors">
          Read More
          <svg
            className="w-4 h-4 ml-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </CardContent>
    </Card>
  );
};

export default ProfileHistoryCard;
