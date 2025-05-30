"use client";

import { Button } from "@/components/ui/button";
import { useNotificationsStore } from "@/stores/notifications-store";
import { useUserStore } from "@/stores/user-store";
import { useNotificationNavigation } from "@/hooks/use-notification-navigation";
import { createTestNotifications } from "@/lib/utils/create-test-notifications";
import { Notification } from "@/lib/types";
import { Plus } from "lucide-react";
import React, { useMemo, useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

  const unreadNotifications = useMemo(() => {
    return notifications.filter((notification) => !notification.read);
  }, [notifications]);

  const readNotifications = useMemo(() => {
    return notifications.filter((notification) => notification.read);
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
            variant="outline"
            className=" bg-blue-500 text-white rounded-full text-sm sm:text-base px-4 sm:px-6 h-10 sm:h-12"
            onClick={handleCreateTestNotifications}
            disabled={isCreatingTest || !user?.id}
          >
            <span className="hidden sm:inline">
              {isCreatingTest ? "Creating..." : "Create Test Notifications"}
            </span>
            <span className="sm:hidden">
              {isCreatingTest ? "Creating..." : "Test Notifications"}
            </span>
          </Button>

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
              All ({notifications.length})
            </span>
            <span className="sm:hidden">
              All
              <br />({notifications.length})
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
            {notifications.length === 0 ? (
              <div className="text-center py-12 sm:py-16 lg:py-20">
                <p className="text-muted-foreground text-sm sm:text-base">
                  No notifications yet
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
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
            {unreadNotifications.length === 0 ? (
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
            {readNotifications.length === 0 ? (
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
