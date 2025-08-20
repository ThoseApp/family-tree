"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNotificationsStore } from "@/stores/notifications-store";
import { useUserStore } from "@/stores/user-store";
import { useNotificationNavigation } from "@/hooks/use-notification-navigation";
import { createTestNotifications } from "@/lib/utils/create-test-notifications";
import { Notification } from "@/lib/types";
import { Plus, Search, X } from "lucide-react";
import React, { useMemo, useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import NotificationCard from "@/components/cards/notification-card";

const NotificationPanel = () => {
  const { user } = useUserStore();
  const {
    notifications,
    isLoading,
    fetchNotifications,
    markAllAsRead,
    subscribeToNotifications,
    unsubscribeFromNotifications,
  } = useNotificationsStore();

  // Enable navigation from toast notifications
  useNotificationNavigation();

  const [isCreatingTest, setIsCreatingTest] = useState(false);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    if (user?.id) {
      // Fetch initial notifications
      fetchNotifications(user.id);

      // Subscribe to real-time notifications
      subscribeToNotifications(user.id);

      // Cleanup on unmount
      return () => {
        unsubscribeFromNotifications();
      };
    }
  }, [
    user?.id,
    fetchNotifications,
    subscribeToNotifications,
    unsubscribeFromNotifications,
  ]);

  // Filter notifications based on search query and type
  const filteredNotifications = useMemo(() => {
    let filtered = [...notifications];

    // Search filter
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (notification) =>
          notification.title.toLowerCase().includes(searchLower) ||
          (notification.body || "").toLowerCase().includes(searchLower) ||
          (notification.type || "").toLowerCase().includes(searchLower)
      );
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(
        (notification) => notification.type === typeFilter
      );
    }

    return filtered;
  }, [notifications, searchQuery, typeFilter]);

  const unreadNotifications = useMemo(() => {
    return filteredNotifications.filter((notification) => !notification.read);
  }, [filteredNotifications]);

  const readNotifications = useMemo(() => {
    return filteredNotifications.filter((notification) => notification.read);
  }, [filteredNotifications]);

  // Get unique notification types
  const availableTypes = useMemo(() => {
    const types = notifications
      .map((notification) => notification.type)
      .filter((type) => type !== undefined && type !== null) as string[];
    return Array.from(new Set(types)).sort();
  }, [notifications]);

  const handleMarkAllAsRead = async () => {
    if (user?.id) {
      await markAllAsRead(user.id);
    }
  };

  const handleCreateTestNotifications = async () => {
    if (!user?.id) return;

    setIsCreatingTest(true);
    try {
      const isAdmin = user?.user_metadata?.is_admin === true;
      await createTestNotifications(user.id, isAdmin);
    } catch (error) {
      console.error("Failed to create test notifications:", error);
    } finally {
      setIsCreatingTest(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setTypeFilter("all");
  };

  if (isLoading && notifications.length === 0) {
    return (
      <div className="flex flex-col gap-y-8 lg:gap-y-12">
        <div className="flex items-center justify-center h-40">
          <div className="text-muted-foreground">Loading notifications...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-6 sm:gap-y-8 lg:gap-y-12">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold">
          Notifications
        </h1>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <Button
            size="lg"
            className="bg-foreground text-background rounded-full hover:bg-foreground/80 text-sm sm:text-base px-4 sm:px-6 h-10 sm:h-12"
            onClick={handleMarkAllAsRead}
            disabled={unreadNotifications.length === 0}
          >
            <span className="hidden sm:inline">Mark all as read</span>
            <span className="sm:hidden">Mark all read</span>
          </Button>
        </div>
      </div>

      {/* SEARCH AND FILTER SECTION */}
      {notifications.length > 0 && (
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4" />
              <Input
                placeholder="Search notifications by title, message, or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 rounded-full"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 lg:gap-4 w-full lg:w-auto">
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="type-filter"
                  className="text-sm font-medium whitespace-nowrap"
                >
                  Filter by type:
                </Label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {availableTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type
                          ? type.charAt(0).toUpperCase() + type.slice(1)
                          : "Unknown"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {(searchQuery || typeFilter !== "all") && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="shrink-0"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {/* Results count */}
          {(searchQuery || typeFilter !== "all") && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-sm text-muted-foreground">
                Showing {filteredNotifications.length} of {notifications.length}{" "}
                notifications
              </p>
            </div>
          )}
        </div>
      )}

      {unreadNotifications.length !== 0 && (
        <div className="-mt-2 sm:-mt-4 lg:-mt-8 text-muted-foreground text-sm sm:text-base">
          You have {unreadNotifications.length} unread notification
          {unreadNotifications.length !== 1 ? "s" : ""}
        </div>
      )}

      <Tabs defaultValue="all">
        <TabsList className="grid w-full grid-cols-3 mb-4 lg:mb-6 h-12 sm:h-14">
          <TabsTrigger value="all" className="px-2 sm:px-5 text-xs sm:text-sm">
            <span className="hidden sm:inline">
              All ({filteredNotifications.length})
            </span>
            <span className="sm:hidden">
              All
              <br />({filteredNotifications.length})
            </span>
          </TabsTrigger>
          <TabsTrigger value="new" className="px-2 sm:px-5 text-xs sm:text-sm">
            <span className="hidden sm:inline">
              New ({unreadNotifications.length})
            </span>
            <span className="sm:hidden">
              New
              <br />({unreadNotifications.length})
            </span>
          </TabsTrigger>
          <TabsTrigger value="read" className="px-2 sm:px-5 text-xs sm:text-sm">
            <span className="hidden sm:inline">
              Read ({readNotifications.length})
            </span>
            <span className="sm:hidden">
              Read
              <br />({readNotifications.length})
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="">
          <div className="flex flex-col gap-y-3 sm:gap-y-4 lg:gap-y-6">
            {filteredNotifications.length === 0 && notifications.length > 0 ? (
              <div className="text-center py-12 sm:py-16 lg:py-20">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  No matching notifications
                </h3>
                <p className="text-muted-foreground text-sm sm:text-base mb-4">
                  Try adjusting your search terms or filters.
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-12 sm:py-16 lg:py-20">
                <p className="text-muted-foreground text-sm sm:text-base">
                  No notifications yet
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="new">
          <div className="flex flex-col gap-y-3 sm:gap-y-4 lg:gap-y-6">
            {unreadNotifications.length === 0 &&
            filteredNotifications.length > 0 ? (
              <div className="text-center py-12 sm:py-16 lg:py-20">
                <p className="text-muted-foreground text-sm sm:text-base">
                  No new notifications matching your filters
                </p>
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              </div>
            ) : unreadNotifications.length === 0 ? (
              <div className="text-center py-12 sm:py-16 lg:py-20">
                <p className="text-muted-foreground text-sm sm:text-base">
                  No new notifications
                </p>
              </div>
            ) : (
              unreadNotifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="read">
          <div className="flex flex-col gap-y-3 sm:gap-y-4 lg:gap-y-6">
            {readNotifications.length === 0 &&
            filteredNotifications.length > 0 ? (
              <div className="text-center py-12 sm:py-16 lg:py-20">
                <p className="text-muted-foreground text-sm sm:text-base">
                  No read notifications matching your filters
                </p>
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              </div>
            ) : readNotifications.length === 0 ? (
              <div className="text-center py-12 sm:py-16 lg:py-20">
                <p className="text-muted-foreground text-sm sm:text-base">
                  No read notifications
                </p>
              </div>
            ) : (
              readNotifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationPanel;
