"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Search,
  Filter,
  X,
  Calendar as CalendarIcon,
  Tag,
  User,
  Pin,
} from "lucide-react";
import { NoticeBoard } from "@/lib/types";

export interface SearchFilters {
  searchTerm: string;
  selectedTags: string[];
  pinnedFilter: "all" | "pinned" | "unpinned";
  editorFilter: string;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
}

interface NoticeBoardSearchFiltersProps {
  noticeBoards: NoticeBoard[];
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  className?: string;
}

const NoticeBoardSearchFilters: React.FC<NoticeBoardSearchFiltersProps> = ({
  noticeBoards,
  filters,
  onFiltersChange,
  className = "",
}) => {
  // Get unique tags and editors from all notice boards
  const allTags = Array.from(
    new Set(noticeBoards.flatMap((notice) => notice.tags || []))
  ).sort();

  const allEditors = Array.from(
    new Set(noticeBoards.map((notice) => notice.editor).filter(Boolean))
  ).sort();

  const handleSearchChange = (searchTerm: string) => {
    onFiltersChange({ ...filters, searchTerm });
  };

  const handleTagToggle = (tag: string) => {
    const updatedTags = filters.selectedTags.includes(tag)
      ? filters.selectedTags.filter((t) => t !== tag)
      : [...filters.selectedTags, tag];
    onFiltersChange({ ...filters, selectedTags: updatedTags });
  };

  const handlePinnedFilterChange = (
    pinnedFilter: "all" | "pinned" | "unpinned"
  ) => {
    onFiltersChange({ ...filters, pinnedFilter });
  };

  const handleEditorFilterChange = (editorFilter: string) => {
    onFiltersChange({ ...filters, editorFilter });
  };

  const handleDateFromChange = (dateFrom: Date | undefined) => {
    onFiltersChange({ ...filters, dateFrom });
  };

  const handleDateToChange = (dateTo: Date | undefined) => {
    onFiltersChange({ ...filters, dateTo });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      searchTerm: "",
      selectedTags: [],
      pinnedFilter: "all",
      editorFilter: "",
      dateFrom: undefined,
      dateTo: undefined,
    });
  };

  const hasActiveFilters =
    filters.searchTerm ||
    filters.selectedTags.length > 0 ||
    filters.pinnedFilter !== "all" ||
    (filters.editorFilter && filters.editorFilter !== "") ||
    filters.dateFrom ||
    filters.dateTo;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search notices by title or description..."
          value={filters.searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Pinned Filter */}
        <Select
          value={filters.pinnedFilter}
          onValueChange={handlePinnedFilterChange}
        >
          <SelectTrigger className="w-auto min-w-[140px]">
            <Pin className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Notices</SelectItem>
            <SelectItem value="pinned">Pinned Only</SelectItem>
            <SelectItem value="unpinned">Unpinned Only</SelectItem>
          </SelectContent>
        </Select>

        {/* Editor Filter */}
        {allEditors.length > 0 && (
          <Select
            value={filters.editorFilter || "all-editors"}
            onValueChange={(value) =>
              handleEditorFilterChange(value === "all-editors" ? "" : value)
            }
          >
            <SelectTrigger className="w-auto min-w-[140px]">
              <User className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Editors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-editors">All Editors</SelectItem>
              {allEditors.map((editor) => (
                <SelectItem key={editor} value={editor}>
                  {editor}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Date From Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="min-w-[140px] justify-start">
              <CalendarIcon className="h-4 w-4 mr-2" />
              {filters.dateFrom ? (
                format(filters.dateFrom, "MMM dd, yyyy")
              ) : (
                <span>From Date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={filters.dateFrom}
              onSelect={handleDateFromChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Date To Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="min-w-[140px] justify-start">
              <CalendarIcon className="h-4 w-4 mr-2" />
              {filters.dateTo ? (
                format(filters.dateTo, "MMM dd, yyyy")
              ) : (
                <span>To Date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={filters.dateTo}
              onSelect={handleDateToChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Tags Filter */}
        {allTags.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="min-w-[120px] justify-start">
                <Tag className="h-4 w-4 mr-2" />
                Tags
                {filters.selectedTags.length > 0 && (
                  <Badge variant="secondary" className="ml-2 px-1 py-0 text-xs">
                    {filters.selectedTags.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" align="start">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Filter by Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={
                        filters.selectedTags.includes(tag)
                          ? "default"
                          : "outline"
                      }
                      className="cursor-pointer hover:bg-muted"
                      onClick={() => handleTagToggle(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Clear All Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
          <span className="text-sm text-muted-foreground">Active filters:</span>

          {filters.searchTerm && (
            <Badge variant="secondary" className="gap-1">
              Search: &quot;{filters.searchTerm}&quot;
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleSearchChange("")}
              />
            </Badge>
          )}

          {filters.pinnedFilter !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {filters.pinnedFilter === "pinned" ? "Pinned" : "Unpinned"}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handlePinnedFilterChange("all")}
              />
            </Badge>
          )}

          {filters.editorFilter && (
            <Badge variant="secondary" className="gap-1">
              Editor: {filters.editorFilter}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleEditorFilterChange("")}
              />
            </Badge>
          )}

          {filters.dateFrom && (
            <Badge variant="secondary" className="gap-1">
              From: {format(filters.dateFrom, "MMM dd")}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleDateFromChange(undefined)}
              />
            </Badge>
          )}

          {filters.dateTo && (
            <Badge variant="secondary" className="gap-1">
              To: {format(filters.dateTo, "MMM dd")}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleDateToChange(undefined)}
              />
            </Badge>
          )}

          {filters.selectedTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleTagToggle(tag)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default NoticeBoardSearchFilters;
