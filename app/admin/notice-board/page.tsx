"use client";
import NewNoticeCard from "@/components/cards/new-notice-card";
import NoticeBoardCard from "@/components/cards/notice-board-card";
import { Button } from "@/components/ui/button";
import { dummyNoticeBoard } from "@/lib/constants/dashbaord";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import React, { useState } from "react";

const Page = () => {
  const [newNotice, setNewNotice] = useState(false);

  const toggleNewNotice = () => {
    setNewNotice(!newNotice);
  };

  return (
    <div className="flex flex-col gap-y-8 lg:gap-y-12">
      {/* HEADER SECTION */}
      <div className="flex md:items-center md:flex-row flex-col md: justify-between gap-y-4">
        <h1 className="text-2xl font-semibold">Family Notice Board</h1>

        <div className="flex items-center gap-4">
          <Button
            className="bg-foreground text-background rounded-full hover:bg-foreground/80"
            onClick={toggleNewNotice}
          >
            <Plus className="size-5" />
            New Notice
          </Button>
        </div>
      </div>

      {/* GRID SECTION */}
      <div className={cn("", newNotice && "flex items-start gap-4 w-full")}>
        <div
          className={cn(
            "grid grid-cols-1  lg:grid-cols-2 gap-4",
            newNotice && "lg:grid-cols-1 w-1/2"
          )}
        >
          {dummyNoticeBoard.map((noticeBoard) => (
            <NoticeBoardCard key={noticeBoard.id} noticeBoard={noticeBoard} />
          ))}
        </div>
        {newNotice && (
          <div className="w-1/2">
            <NewNoticeCard onClose={toggleNewNotice} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
