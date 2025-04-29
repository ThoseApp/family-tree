import { Notification } from "@/lib/types";
import Image from "next/image";
import React from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

interface NotificationCardProps {
  notification: Notification;
}

const NotificationCard = ({ notification }: NotificationCardProps) => {
  return (
    <div
      className={cn(
        "flex items-center gap-4 p-6 rounded-full border-2 shadow-sm",
        notification.read &&
          "bg-primary/30 border-primary/30 shadow-inner shadow-primary/30"
      )}
    >
      <Image
        src={notification.image}
        alt={notification.title}
        width={32}
        height={32}
      />
      <div className="flex-1 flex flex-col gap-1">
        <p className="text-sm font-medium">{notification.title}</p>
        <p className="text-sm text-gray-500">{notification.body}</p>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex items-center gap-2">
        <Button className="rounded-full">Mark as read</Button>
        <Button variant="destructive" className="rounded-full">
          Delete
        </Button>
      </div>
    </div>
  );
};

export default NotificationCard;
