import { Notification } from "@/lib/types";
import { useNotificationsStore } from "@/stores/notifications-store";
import Image from "next/image";
import React from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

interface NotificationCardProps {
  notification: Notification;
}

const NotificationCard = ({ notification }: NotificationCardProps) => {
  const { markAsRead, deleteNotification } = useNotificationsStore();

  const handleMarkAsRead = async () => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
  };

  const handleDelete = async () => {
    await deleteNotification(notification.id);
  };

  return (
    <div
      className={cn(
        "flex items-center gap-4 p-6 rounded-full border-2 shadow-sm",
        notification.read &&
          "bg-primary/30 border-primary/30 shadow-inner shadow-primary/30"
      )}
    >
      {notification.image && (
        <Image
          src={notification.image}
          alt={notification.title}
          width={32}
          height={32}
          className="rounded-full object-cover"
        />
      )}
      <div className="flex-1 flex flex-col gap-1">
        <p className="text-sm font-medium">{notification.title}</p>
        <p className="text-sm text-gray-500">{notification.body}</p>
        {notification.created_at && (
          <p className="text-xs text-gray-400">
            {new Date(notification.created_at).toLocaleString()}
          </p>
        )}
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex items-center gap-2">
        {!notification.read && (
          <Button className="rounded-full" onClick={handleMarkAsRead} size="sm">
            Mark as read
          </Button>
        )}
        <Button
          variant="destructive"
          className="rounded-full"
          onClick={handleDelete}
          size="sm"
        >
          Delete
        </Button>
      </div>
    </div>
  );
};

export default NotificationCard;
