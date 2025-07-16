"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import NotificationCard from "@/components/cards/notification-card";
import { useNotificationsStore } from "@/stores/notifications-store";
import { useUserStore } from "@/stores/user-store";
import { LoadingIcon } from "@/components/loading-icon";
import { Bell, BellOff } from "lucide-react";

const PublisherNotificationsPage = () => {
  const { user } = useUserStore();
  const {
    notifications,
    isLoading,
    fetchNotifications,
    subscribeToNotifications,
  } = useNotificationsStore();

  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    if (user?.id) {
      fetchNotifications(user.id);
      subscribeToNotifications(user.id);
    }
  }, [user?.id, fetchNotifications, subscribeToNotifications]);

  // Filter notifications based on selected filter
  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "unread") {
      return !notification.read;
    }
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingIcon className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-8 lg:gap-y-12">
      {/* HEADER SECTION */}
      <div className="flex md:items-center md:flex-row flex-col md:justify-between gap-y-4">
        <div>
          <h1 className="text-2xl font-semibold">Notifications</h1>
          <p className="text-gray-600 text-sm">
            Stay updated with the latest family activity and publisher requests.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1 rounded-full text-sm transition ${
              filter === "all"
                ? "bg-foreground text-background"
                : "bg-border text-foreground hover:bg-border/80"
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-3 py-1 rounded-full text-sm transition ${
              filter === "unread"
                ? "bg-foreground text-background"
                : "bg-border text-foreground hover:bg-border/80"
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>
      </div>

      {/* NOTIFICATIONS LIST */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {unreadCount > 0 ? (
              <Bell className="h-5 w-5" />
            ) : (
              <BellOff className="h-5 w-5" />
            )}
            {filter === "all"
              ? `All Notifications (${notifications.length})`
              : `Unread Notifications (${unreadCount})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-8">
              <BellOff className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {filter === "all"
                  ? "No notifications"
                  : "No unread notifications"}
              </h3>
              <p className="text-muted-foreground">
                {filter === "all"
                  ? "You don't have any notifications yet."
                  : "All caught up! You have no unread notifications."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PublisherNotificationsPage;
