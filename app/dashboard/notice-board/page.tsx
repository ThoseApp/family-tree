import NoticeBoardCard from "@/components/cards/notice-board-card";
import { dummyNoticeBoard } from "@/lib/constants/dashbaord";
import React from "react";

const Page = () => {
  return (
    <div className="flex flex-col gap-y-8 lg:gap-y-12">
      {/* HEADER SECTION */}
      <div className="flex md:items-center md:flex-row flex-col md: justify-between gap-y-4">
        <h1 className="text-2xl font-semibold">Family Notice Board</h1>
      </div>

      {/* GRID SECTION */}
      <div className="grid grid-cols-1  lg:grid-cols-2 gap-4">
        {dummyNoticeBoard.map((noticeBoard) => (
          <NoticeBoardCard key={noticeBoard.id} noticeBoard={noticeBoard} />
        ))}
      </div>
    </div>
  );
};

export default Page;
