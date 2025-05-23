"use client";

import { useEffect, useState } from "react";
import { CheckCircle, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

export const ConnectionStatusBanner = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [showOnlineMessage, setShowOnlineMessage] = useState(false);

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === "undefined") return;

    // Set initial state
    setIsOnline(navigator.onLine);

    // Handler for when the network status changes
    const handleOnline = () => {
      setIsOnline(true);
      setShowOnlineMessage(true);

      // Hide the "back online" message after 3 seconds
      setTimeout(() => {
        setShowOnlineMessage(false);
      }, 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOnlineMessage(false);
    };

    // Add event listeners
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Clean up
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Don't render anything if online and not showing the online message
  if (isOnline && !showOnlineMessage) return null;

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-[9999] py-2 px-4 text-white text-center transition-all flex items-center justify-center shadow-md animate-in fade-in slide-in-from-top duration-300",
        isOnline ? "bg-green-500" : "bg-red-500"
      )}
    >
      {isOnline ? (
        <>
          <CheckCircle className="w-4 h-4 mr-2" />
          <span>You are back online</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4 mr-2" />
          <span>
            You are currently offline. Some features may be unavailable.
          </span>
        </>
      )}
    </div>
  );
};
