import { Notification } from "@/lib/types";
import { useNotificationsStore } from "@/stores/notifications-store";
import { useUserStore } from "@/stores/user-store";
import {
  isNotificationNavigable,
  getNotificationActionText,
} from "@/lib/utils/notification-router";
import Image from "next/image";
import React from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { ExternalLink } from "lucide-react";

interface NotificationCardProps {
  notification: Notification;
}

const NotificationCard = ({ notification }: NotificationCardProps) => {
  const { markAsRead, deleteNotification, navigateToNotification } =
    useNotificationsStore();
  const { user } = useUserStore();
  const router = useRouter();

  const isAdmin = user?.user_metadata?.is_admin === true;
  const isNavigable = isNotificationNavigable(notification);
  const actionText = getNotificationActionText(notification);

  const handleMarkAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (!notification.read) {
      await markAsRead(notification.id);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    await deleteNotification(notification.id);
  };

  const handleCardClick = async () => {
    if (!isNavigable) return;
    await navigateToNotification(notification, isAdmin, router);
  };

  const handleActionButtonClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (!isNavigable) return;
    await navigateToNotification(notification, isAdmin, router);
  };

  return (
    <div
      className={cn(
        // Base layout and styling
        "flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 lg:gap-6",
        "p-4 sm:p-5 lg:p-6 rounded-2xl sm:rounded-full border-2 shadow-sm",
        "transition-all duration-200 w-full",
        // Unread state styling
        !notification.read &&
          "bg-primary/10 border-primary/30 shadow-inner shadow-primary/30",
        // Interactive states
        isNavigable &&
          "cursor-pointer hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]"
      )}
      onClick={isNavigable ? handleCardClick : undefined}
      role={isNavigable ? "button" : undefined}
      tabIndex={isNavigable ? 0 : undefined}
      onKeyDown={(e) => {
        if (isNavigable && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      {/* IMAGE SECTION */}
      {notification.image && (
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-32 lg:h-32 flex-shrink-0 mx-auto sm:mx-0">
          <Image
            src={notification.image}
            alt={notification.title}
            fill
            className="rounded-full object-cover"
            sizes="(max-width: 640px) 64px, (max-width: 1024px) 80px, 128px"
          />
        </div>
      )}

      {/* CONTENT SECTION */}
      <div className="flex-1 flex flex-col gap-1 sm:gap-1.5 lg:gap-2 min-w-0 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
          {!notification.read && (
            <span>
              <div className="relative">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-primary rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-3 h-3 sm:w-4 sm:h-4 bg-primary/80 rounded-full animate-ping opacity-75"></div>
              </div>
            </span>
          )}
          <h3 className="text-sm sm:text-base lg:text-lg font-medium leading-tight line-clamp-2 sm:line-clamp-1">
            {notification.title}
          </h3>
          {isNavigable && (
            <ExternalLink className="size-3 sm:size-4 text-muted-foreground flex-shrink-0 mx-auto sm:mx-0" />
          )}
        </div>

        <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400 line-clamp-3 sm:line-clamp-2 lg:line-clamp-1">
          {notification.body}
        </p>

        {notification.created_at && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {new Date(notification.created_at).toLocaleString()}
          </p>
        )}
      </div>

      {/* ACTION BUTTONS SECTION */}
      <div className="flex flex-col gap-2 sm:gap-2 lg:gap-3 w-full sm:w-auto flex-shrink-0">
        {/* Primary Action Button */}
        {isNavigable && (
          <Button
            variant="outline"
            size="sm"
            className="rounded-full text-xs sm:text-sm h-8 sm:h-9 lg:h-10 px-3 sm:px-4 lg:px-6 w-full sm:w-auto whitespace-nowrap"
            onClick={handleActionButtonClick}
          >
            {actionText}
          </Button>
        )}

        {/* Secondary Actions Row */}
        <div className="flex flex-row sm:flex-row gap-2 w-full sm:w-auto">
          {!notification.read && (
            <Button
              size="sm"
              className="rounded-full text-xs h-7 sm:h-8 lg:h-9 px-2 sm:px-3 lg:px-4 flex-1 sm:flex-none whitespace-nowrap"
              onClick={handleMarkAsRead}
            >
              <span className="hidden sm:inline">Mark as read</span>
              <span className="sm:hidden">Mark read</span>
            </Button>
          )}

          <Button
            variant="destructive"
            size="sm"
            className="rounded-full text-xs h-7 sm:h-8 lg:h-9 px-2 sm:px-3 lg:px-4 flex-1 sm:flex-none"
            onClick={handleDelete}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;
