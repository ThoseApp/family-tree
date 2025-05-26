"use client";

import { Button } from "@/components/ui/button";
import { useNotificationsStore } from "@/stores/notifications-store";
import { useUserStore } from "@/stores/user-store";
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
    <div className="flex flex-col gap-y-8 lg:gap-y-12">
      {/* HEADER SECTION */}
      <div className="flex md:items-center md:flex-row flex-col md: justify-between gap-y-4">
        <h1 className="text-2xl font-semibold">Notifications</h1>

        <div className="flex items-center gap-4">
          <Button
            size="lg"
            className="bg-foreground text-background rounded-full hover:bg-foreground/80"
            onClick={handleMarkAllAsRead}
            disabled={unreadNotifications.length === 0}
          >
            Mark all as read
          </Button>
        </div>
      </div>

      {unreadNotifications.length !== 0 && (
        <div className="-mt-4 lg:-mt-12 text-muted-foreground">
          You have {unreadNotifications.length} unread notifications
        </div>
      )}

      <Tabs defaultValue="all">
        <TabsList className="grid w-full grid-cols-3 mb-4 lg:mb-6">
          <TabsTrigger value="all" className="px-5">
            All ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="new" className="px-5">
            New ({unreadNotifications.length})
          </TabsTrigger>
          <TabsTrigger value="read" className="px-5">
            Read ({readNotifications.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="">
          <div className="flex flex-col gap-y-2 lg:gap-y-4">
            {notifications.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No notifications yet</p>
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
          <div className="flex flex-col gap-y-2 lg:gap-y-4">
            {unreadNotifications.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No new notifications</p>
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
          <div className="flex flex-col gap-y-2 lg:gap-y-4">
            {readNotifications.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No read notifications</p>
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
