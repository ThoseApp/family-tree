"use client";

import React from "react";
import Image from "next/image";
import { NoticeBoard } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { X, ImageIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NoticeDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  noticeBoard: NoticeBoard | null;
  showStatus?: boolean;
}

export const NoticeDetailsModal: React.FC<NoticeDetailsModalProps> = ({
  isOpen,
  onClose,
  noticeBoard,
  showStatus = false,
}) => {
  if (!noticeBoard) return null;

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {noticeBoard.pinned && (
                  <Badge
                    variant="default"
                    className="bg-blue-100 text-blue-800"
                  >
                    Pinned
                  </Badge>
                )}
                {showStatus && noticeBoard.status && (
                  <StatusBadge status={noticeBoard.status} />
                )}
              </div>
              <DialogTitle className="text-2xl font-bold leading-tight">
                {noticeBoard.title}
              </DialogTitle>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span>Published by: {noticeBoard.editor}</span>
                <span>Posted {formattedDate}</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Image Section */}
            {noticeBoard.image && (
              <div className="w-full">
                {isValidImageUrl(noticeBoard.image) ? (
                  <div className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden">
                    <Image
                      src={noticeBoard.image}
                      alt={noticeBoard.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-64 md:h-80 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>
            )}

            {/* Description Section */}
            <div className="space-y-4">
              <DialogDescription className="text-base leading-relaxed text-gray-700 whitespace-pre-wrap">
                {noticeBoard.description}
              </DialogDescription>

              {/* Status Messages */}
              {showStatus && noticeBoard.status === "rejected" && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-700 font-medium">
                    This notice was declined. Contact an admin or editor to make
                    changes and resubmit.
                  </p>
                </div>
              )}
              {showStatus && noticeBoard.status === "pending" && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700 font-medium">
                    This notice is awaiting admin approval.
                  </p>
                </div>
              )}
            </div>

            {/* Tags Section */}
            {noticeBoard.tags && noticeBoard.tags.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-900">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {noticeBoard.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
