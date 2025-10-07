"use client";

import ClientMetadata from "@/components/seo/client-metadata";
import React, { useEffect, useState } from "react";
import { useNoticeBoardStore } from "@/stores/notice-board-store";
import NoticeBoardCard from "@/components/cards/notice-board-card";
import NoticeBoardSearchFilters, {
  SearchFilters,
} from "@/components/search/notice-board-search-filters";
import { LoadingIcon } from "@/components/loading-icon";
import { Button } from "@/components/ui/button";
import { getFilteredAndSortedNoticeBoards } from "@/lib/utils/notice-board-filters";
import FrameWrapper from "@/components/wrappers/frame-wrapper";

const NoticeBoardPage = () => {
  const { noticeBoards, loading, fetchApprovedNoticeBoards } =
    useNoticeBoardStore();

  // Search and filter state
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: "",
    selectedTags: [],
    pinnedFilter: "all",
    editorFilter: "",
    dateFrom: undefined,
    dateTo: undefined,
  });

  useEffect(() => {
    // Fetch only approved notice boards for public viewing
    fetchApprovedNoticeBoards();
  }, [fetchApprovedNoticeBoards]);

  // Get filtered and sorted notices (pinned first, then by date)
  const filteredNotices = getFilteredAndSortedNoticeBoards(
    noticeBoards,
    filters
  );

  return (
    <>
      <ClientMetadata
        title="Notice Board - Mosuro Family Announcements"
        description="Stay informed with the latest Mosuro family announcements, news, and important updates. Your central hub for family communications."
        keywords={["announcements", "family news", "updates", "communications"]}
      />
      <FrameWrapper>
        <div className="flex flex-col gap-y-8 lg:gap-y-12">
          {/* HEADER SECTION */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl lg:text-4xl font-bold">
              Family Notice Board
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Stay updated with the latest family announcements, events, and
              important information shared by our family members.
            </p>
          </div>

          {/* SEARCH AND FILTERS SECTION */}
          <NoticeBoardSearchFilters
            noticeBoards={noticeBoards}
            filters={filters}
            onFiltersChange={setFilters}
          />

          {/* CONTENT SECTION */}
          {loading && noticeBoards.length === 0 ? (
            <div className="flex justify-center items-center h-40">
              <LoadingIcon className="h-8 w-8" />
            </div>
          ) : filteredNotices.length === 0 && noticeBoards.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <h3 className="text-xl font-medium text-muted-foreground mb-2">
                No notices yet
              </h3>
              <p className="text-muted-foreground mb-4">
                Check back later for family announcements and updates
              </p>
            </div>
          ) : filteredNotices.length === 0 && noticeBoards.length > 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <h3 className="text-xl font-medium text-muted-foreground mb-2">
                No notices match your search
              </h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or clear all filters
              </p>
              <Button
                variant="outline"
                onClick={() =>
                  setFilters({
                    searchTerm: "",
                    selectedTags: [],
                    pinnedFilter: "all",
                    editorFilter: "",
                    dateFrom: undefined,
                    dateTo: undefined,
                  })
                }
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredNotices.map((noticeBoard) => (
                <NoticeBoardCard
                  key={noticeBoard.id}
                  noticeBoard={noticeBoard}
                  showActions={false}
                  showStatus={false}
                  canEdit={false}
                />
              ))}
            </div>
          )}
        </div>
      </FrameWrapper>
    </>
  );
};

export default NoticeBoardPage;
