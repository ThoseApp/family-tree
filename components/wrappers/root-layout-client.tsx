"use client";

import { Montserrat } from "next/font/google";
import { Toaster } from "sonner";
import { ConnectionStatusBanner } from "@/components/connection-status-banner";
import { MockDataBanner } from "@/components/mock-data-banner";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useUserStore } from "@/stores/user-store";
import { useNotificationsStore } from "@/stores/notifications-store";

const font = Montserrat({
  subsets: ["latin"],
});

interface RootLayoutClientProps {
  children: React.ReactNode;
}

export default function RootLayoutClient({ children }: RootLayoutClientProps) {
  const { user } = useUserStore();
  const { subscribeToNotifications, unsubscribeFromNotifications } =
    useNotificationsStore();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        useUserStore.setState({ user: session.user });
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      useUserStore.setState({ user: session?.user ?? null });

      if (event === "SIGNED_IN" && session?.user) {
        // User signed in, subscribe to notifications
        subscribeToNotifications(session.user.id);
      } else if (event === "SIGNED_OUT") {
        // User signed out, unsubscribe from notifications
        unsubscribeFromNotifications();
      }
    });

    return () => subscription.unsubscribe();
  }, [subscribeToNotifications, unsubscribeFromNotifications]);

  // Subscribe to notifications when user is available
  useEffect(() => {
    if (user?.id) {
      subscribeToNotifications(user.id);
      return () => {
        unsubscribeFromNotifications();
      };
    }
  }, [user?.id, subscribeToNotifications, unsubscribeFromNotifications]);

  return (
    <html lang="en">
      <body className={`${font.className}`}>
        {/* <UIToaster /> */}
        <Toaster position="top-center" richColors />
        {process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true" && <MockDataBanner />}
        <ConnectionStatusBanner />
        {/* //TODO: ADD THEME PROVIDER */}
        {children}
      </body>
    </html>
  );
}
