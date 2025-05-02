import React from "react";
import Image from "next/image";
import { NoticeBoard } from "@/lib/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../ui/card";
import { Badge } from "../ui/badge";

interface NoticeBoardCardProps {
  noticeBoard: NoticeBoard;
}

const NoticeBoardCard = ({ noticeBoard }: NoticeBoardCardProps) => {
  const formattedDate =
    typeof noticeBoard.postedDate === "string"
      ? noticeBoard.postedDate
      : new Date(noticeBoard.postedDate).toLocaleString();

  return (
    <Card className="w-full rounded-xl shadow-md overflow-hidden">
      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-start">
          {noticeBoard.pinned && (
            <Badge variant="default" className="bg-blue-100 text-blue-800">
              Pinned
            </Badge>
          )}
          <div className="w-3 h-3 bg-green-500 rounded-full ml-auto"></div>
        </div>
        <CardTitle className="text-xl font-bold mt-2">
          {noticeBoard.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        {noticeBoard.image && (
          <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
            <Image
              src={noticeBoard.image}
              alt={noticeBoard.title}
              layout="fill"
              objectFit="cover"
            />
          </div>
        )}
        <p className="text-gray-700 mb-3">{noticeBoard.description}</p>
        <p className="text-sm text-gray-500">
          Editorial Admin: {noticeBoard.editor}
        </p>
        <p className="text-sm text-gray-500">Posted {formattedDate}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="flex flex-wrap gap-2">
          {noticeBoard.tags &&
            noticeBoard.tags.map((tag: string, index: number) => (
              <Badge key={index} variant="tag">
                {tag}
              </Badge>
            ))}
        </div>
      </CardFooter>
    </Card>
  );
};

export default NoticeBoardCard;
