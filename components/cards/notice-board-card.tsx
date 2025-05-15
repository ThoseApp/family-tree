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
import { ImageIcon } from "lucide-react";

interface NoticeBoardCardProps {
  noticeBoard: NoticeBoard;
}

const NoticeBoardCard = ({ noticeBoard }: NoticeBoardCardProps) => {
  const formattedDate =
    typeof noticeBoard.posteddate === "string"
      ? noticeBoard.posteddate
      : new Date(noticeBoard.posteddate).toLocaleString();

  // Check if the image is a valid URL
  const isValidImageUrl = (url: string) => {
    try {
      return (
        url.startsWith("http://") ||
        url.startsWith("https://") ||
        url.startsWith("/")
      );
    } catch {
      return false;
    }
  };

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
        {noticeBoard.image && isValidImageUrl(noticeBoard.image) ? (
          <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
            <Image
              src={noticeBoard.image}
              alt={noticeBoard.title}
              fill
              className="object-cover"
            />
          </div>
        ) : noticeBoard.image ? (
          <div className="w-full h-48 mb-4 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
            <ImageIcon className="h-12 w-12 text-gray-400" />
          </div>
        ) : null}
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
