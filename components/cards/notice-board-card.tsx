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
import { Button } from "../ui/button";
import {
  ImageIcon,
  Edit,
  Trash2,
  Pin,
  PinOff,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface NoticeBoardCardProps {
  noticeBoard: NoticeBoard;
  onEdit?: (noticeBoard: NoticeBoard) => void;
  onDelete?: (id: string) => void;
  onTogglePin?: (id: string, pinned: boolean) => void;
  showActions?: boolean;
}

const NoticeBoardCard = ({
  noticeBoard,
  onEdit,
  onDelete,
  onTogglePin,
  showActions = false,
}: NoticeBoardCardProps) => {
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
          <div className="flex items-center gap-2">
            {noticeBoard.pinned && (
              <Badge variant="default" className="bg-blue-100 text-blue-800">
                Pinned
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(noticeBoard)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onTogglePin && (
                    <DropdownMenuItem
                      onClick={() =>
                        onTogglePin(noticeBoard.id, noticeBoard.pinned)
                      }
                    >
                      {noticeBoard.pinned ? (
                        <>
                          <PinOff className="mr-2 h-4 w-4" />
                          Unpin
                        </>
                      ) : (
                        <>
                          <Pin className="mr-2 h-4 w-4" />
                          Pin
                        </>
                      )}
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem
                      onClick={() => onDelete(noticeBoard.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
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
