"use client";

import { Button } from "@/components/ui/button";
import { dummyNotifications } from "@/lib/constants/dashbaord";
import { Notification } from "@/lib/types";
import { Plus } from "lucide-react";
import React, { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NotificationCard from "@/components/cards/notification-card";

const NotificationsPage = () => {
  const [notifications, setNotifications] =
    useState<Notification[]>(dummyNotifications);

  const unreadNotifications = useMemo(() => {
    return notifications.filter((notification) => !notification.read);
  }, [notifications]);

  return (
    <div className="flex flex-col gap-y-8 lg:gap-y-12">
      {/* HEADER SECTION */}
      <div className="flex md:items-center md:flex-row flex-col md: justify-between gap-y-4">
        <h1 className="text-2xl font-semibold">Notifications</h1>

        <div className="flex items-center gap-4">
          <Button
            size="lg"
            className="bg-foreground text-background rounded-full hover:bg-foreground/80"
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
            All
          </TabsTrigger>
          <TabsTrigger value="new" className="px-5">
            New
          </TabsTrigger>
          <TabsTrigger value="read" className="px-5">
            Read
          </TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="">
          <div className="flex flex-col gap-y-2 lg:gap-y-4">
            {notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
              />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="new">
          <div className="flex flex-col gap-y-2 lg:gap-y-4">
            {notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
              />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="read">
          <div className="flex flex-col gap-y-2 lg:gap-y-4">
            {notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationsPage;
