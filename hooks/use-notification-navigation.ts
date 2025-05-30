import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useNotificationsStore } from "@/stores/notifications-store";
import { useUserStore } from "@/stores/user-store";
import { Notification } from "@/lib/types";

export function useNotificationNavigation() {
  const router = useRouter();
  const { navigateToNotification } = useNotificationsStore();
  const { user } = useUserStore();

  useEffect(() => {
    const handleNavigateToNotification = (event: CustomEvent<Notification>) => {
      const notification = event.detail;
      const isAdmin = user?.user_metadata?.is_admin === true;

      if (notification && user) {
        navigateToNotification(notification, isAdmin, router);
      }
    };

    // Listen for the custom navigation event
    window.addEventListener(
      "navigateToNotification",
      handleNavigateToNotification as EventListener
    );

    return () => {
      window.removeEventListener(
        "navigateToNotification",
        handleNavigateToNotification as EventListener
      );
    };
  }, [router, navigateToNotification, user]);
}
