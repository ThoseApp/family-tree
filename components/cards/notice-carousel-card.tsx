"use client";

import React, { useState } from "react";
import Image from "next/image";
import { NoticeBoard } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { ImageIcon, Pin } from "lucide-react";
import { NoticeDetailsModal } from "@/components/modals/notice-details-modal";
import { motion } from "framer-motion";

interface NoticeCarouselCardProps {
  noticeBoard: NoticeBoard;
}

const NoticeCarouselCard = ({ noticeBoard }: NoticeCarouselCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isValidImageUrl = (url: string) => {
    return (
      url.startsWith("http://") ||
      url.startsWith("https://") ||
      url.startsWith("/")
    );
  };

  const DESCRIPTION_LIMIT = 100;
  const truncatedDescription =
    noticeBoard.description.length > DESCRIPTION_LIMIT
      ? noticeBoard.description.substring(0, DESCRIPTION_LIMIT) + "..."
      : noticeBoard.description;

  const displayTags = noticeBoard.tags?.slice(0, 3) || [];

  return (
    <>
      <motion.div
        className="cursor-pointer rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden h-full flex flex-col"
        whileHover={{ scale: 1.02, boxShadow: "0 10px 40px rgba(0,0,0,0.12)" }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        onClick={() => setIsModalOpen(true)}
      >
        {/* Image */}
        <div className="relative w-full aspect-video overflow-hidden rounded-t-xl">
          {noticeBoard.image && isValidImageUrl(noticeBoard.image) ? (
            <Image
              src={noticeBoard.image}
              alt={noticeBoard.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <ImageIcon className="h-10 w-10 text-muted-foreground" />
            </div>
          )}
          {noticeBoard.pinned && (
            <div className="absolute top-3 left-3">
              <Badge
                variant="default"
                className="bg-blue-100 text-blue-800 flex items-center gap-1"
              >
                <Pin className="h-3 w-3" />
                Pinned
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1 gap-3">
          <h3 className="font-semibold text-lg line-clamp-2 leading-tight">
            {noticeBoard.title}
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed flex-1">
            {truncatedDescription}
          </p>

          {/* Tags */}
          {displayTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {displayTags.map((tag: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Meta */}
          <div className="text-xs text-muted-foreground pt-1 border-t">
            By: {noticeBoard.editor} &middot; {noticeBoard.posteddate}
          </div>
        </div>
      </motion.div>

      <NoticeDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        noticeBoard={noticeBoard}
      />
    </>
  );
};

export default NoticeCarouselCard;
