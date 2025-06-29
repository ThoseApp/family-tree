import React, { useEffect, useState } from "react";
import DashboardMobileSidebar from "./dashboard-mobile-sidebar";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Heart, LogOut, Mail, Search, User } from "lucide-react";
import { Mic } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { dummyProfileImage } from "@/lib/constants";
import Link from "next/link";
import AdminMobileSidebar from "../admin/admin-mobile-sidebar";
import { useUserStore } from "@/stores/user-store";
import { useNotificationsStore } from "@/stores/notifications-store";
import { useMemberRequestsStore } from "@/stores/member-requests-store";

const DashboardNavbar = () => {
  const { user, logout } = useUserStore();
  const { notifications, fetchNotifications, subscribeToNotifications } =
    useNotificationsStore();
  const { memberRequests, fetchMemberRequests } = useMemberRequestsStore();
  const pathname = usePathname();
  const router = useRouter();

  // State for counters
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [pendingMemberRequestsCount, setPendingMemberRequestsCount] =
    useState(0);

  // Fetch notifications and member requests on component mount
  useEffect(() => {
    if (user?.id) {
      fetchNotifications(user.id);
      subscribeToNotifications(user.id);

      // Only fetch member requests if user is admin
      if (user?.user_metadata?.is_admin === true) {
        fetchMemberRequests();
      }
    }
  }, [
    user?.id,
    user?.user_metadata?.is_admin,
    fetchNotifications,
    subscribeToNotifications,
    fetchMemberRequests,
  ]);

  // Update unread notifications count
  useEffect(() => {
    const unreadCount = notifications.filter(
      (notification) => !notification.read
    ).length;
    setUnreadNotificationsCount(unreadCount);
  }, [notifications]);

  // Update pending member requests count
  useEffect(() => {
    const pendingCount = memberRequests.filter(
      (request) => request.status === "pending"
    ).length;
    setPendingMemberRequestsCount(pendingCount);
  }, [memberRequests]);

  // Refresh member requests periodically for admins
  useEffect(() => {
    if (user?.user_metadata?.is_admin === true) {
      const interval = setInterval(() => {
        fetchMemberRequests();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [user?.user_metadata?.is_admin, fetchMemberRequests]);

  return (
    <div className="flex bg-border/30 backdrop-blur-sm items-center  px-3  py-4 lg:px-6">
      {pathname.includes("/admin") ? (
        <AdminMobileSidebar />
      ) : (
        <DashboardMobileSidebar />
      )}

      <div className="w-full flex items-center justify-between gap-8">
        {/* SEARCH BAR */}
        <div className=" flex-1 2xl:max-w-xl flex items-center gap-2">
          <div className="flex-1 w-full  flex items-center justify-center">
            <div className="relative max-w-full w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Search"
                className="w-full pl-10 focus-visible:ring-offset-0 rounded-full h-12 bg-background"
              />
            </div>
          </div>

          <div className="rounded-full cursor-pointer p-2 hover:bg-border/50 hover:text-accent-foreground transition">
            <Mic className="size-5" />
          </div>
        </div>

        {/* ACTION ICONS */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {user?.user_metadata?.is_admin === true && (
              <Button
                variant="outline"
                size="icon"
                className="rounded-full relative"
                asChild
              >
                <Link href="/admin/member-requests">
                  <Mail className="size-6" />
                  {pendingMemberRequestsCount > 0 && (
                    <Badge
                      className="absolute -top-2 -right-2 h-6 w-6 p-0 flex items-center justify-center text-xs bg-red-500 hover:bg-red-600 border-2 border-background"
                      variant="destructive"
                    >
                      {pendingMemberRequestsCount > 99
                        ? "99+"
                        : pendingMemberRequestsCount}
                    </Badge>
                  )}
                </Link>
              </Button>
            )}

            <Button
              variant="outline"
              size="icon"
              className="rounded-full relative"
              asChild
            >
              <Link
                href={
                  user?.user_metadata?.is_admin === true
                    ? "/admin/notifications"
                    : "/dashboard/notifications"
                }
              >
                <Bell className="size-6" />
                {unreadNotificationsCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-6 w-6 p-0 flex items-center justify-center text-xs bg-blue-500 hover:bg-blue-600 border-2 border-background">
                    {unreadNotificationsCount > 99
                      ? "99+"
                      : unreadNotificationsCount}
                  </Badge>
                )}
              </Link>
            </Button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full">
                <Avatar className="size-10">
                  <AvatarImage
                    src={user?.user_metadata?.avatar_url}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-muted-foreground/10">
                    {user?.user_metadata?.first_name?.charAt(0)}
                    {user?.user_metadata?.last_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-2">
              <DropdownMenuItem
                className="cursor-pointer flex items-center gap-2 rounded-md"
                onClick={() =>
                  user?.user_metadata?.is_admin
                    ? router.push("/admin/profile")
                    : router.push("/dashboard/profile")
                }
              >
                <User className="size-5" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer flex items-center gap-2 rounded-md text-destructive hover:bg-destructive/20 hover:text-destructive"
                onClick={logout}
              >
                <LogOut className="size-5" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default DashboardNavbar;
