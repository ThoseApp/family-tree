import { NoticeBoard } from "@/lib/types";
import { SearchFilters } from "@/components/search/notice-board-search-filters";

export const filterNoticeBoards = (
  noticeBoards: NoticeBoard[],
  filters: SearchFilters
): NoticeBoard[] => {
  return noticeBoards.filter((notice) => {
    // Search term filter (search in title and description)
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      const titleMatch = notice.title.toLowerCase().includes(searchTerm);
      const descriptionMatch = notice.description
        .toLowerCase()
        .includes(searchTerm);
      if (!titleMatch && !descriptionMatch) {
        return false;
      }
    }

    // Pinned filter
    if (filters.pinnedFilter !== "all") {
      if (filters.pinnedFilter === "pinned" && !notice.pinned) {
        return false;
      }
      if (filters.pinnedFilter === "unpinned" && notice.pinned) {
        return false;
      }
    }

    // Editor filter
    if (filters.editorFilter && notice.editor !== filters.editorFilter) {
      return false;
    }

    // Tags filter
    if (filters.selectedTags.length > 0) {
      const noticeTags = notice.tags || [];
      const hasMatchingTag = filters.selectedTags.some((tag) =>
        noticeTags.includes(tag)
      );
      if (!hasMatchingTag) {
        return false;
      }
    }

    // Date range filter
    if (filters.dateFrom || filters.dateTo) {
      const noticeDate = new Date(notice.posteddate);

      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        if (noticeDate < fromDate) {
          return false;
        }
      }

      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        if (noticeDate > toDate) {
          return false;
        }
      }
    }

    return true;
  });
};

export const getFilteredAndSortedNoticeBoards = (
  noticeBoards: NoticeBoard[],
  filters: SearchFilters
): NoticeBoard[] => {
  const filtered = filterNoticeBoards(noticeBoards, filters);

  // Sort: pinned first, then by date (newest first)
  const pinnedNotices = filtered.filter((notice) => notice.pinned);
  const unpinnedNotices = filtered.filter((notice) => !notice.pinned);

  // Sort each group by date (newest first)
  pinnedNotices.sort(
    (a, b) =>
      new Date(b.posteddate).getTime() - new Date(a.posteddate).getTime()
  );
  unpinnedNotices.sort(
    (a, b) =>
      new Date(b.posteddate).getTime() - new Date(a.posteddate).getTime()
  );

  return [...pinnedNotices, ...unpinnedNotices];
};
