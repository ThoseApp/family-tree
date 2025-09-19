"use client";

import { useState, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import {
  Search,
  Bell,
  Mic,
  User,
  Calendar,
  FileText,
  Users,
  Image,
  Megaphone,
  X,
  Mail,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingIcon } from "@/components/loading-icon";
import AdminMobileSidebar from "@/components/admin/admin-mobile-sidebar";
import PublisherMobileSidebar from "@/components/publisher/publisher-mobile-sidebar";
import DashboardMobileSidebar from "@/components/dashboard/dashboard-mobile-sidebar";
import { useUserStore } from "@/stores/user-store";
import { useMemberRequestsStore } from "@/stores/member-requests-store";
import { useNotificationsStore } from "@/stores/notifications-store";
import { useFamilyMembersStore } from "@/stores/family-members-store";
import { useEventsStore } from "@/stores/events-store";
import { useNoticeBoardStore } from "@/stores/notice-board-store";
import { useGalleryStore } from "@/stores/gallery-store";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserProfile } from "@/lib/types";

// Define search result types
interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: "family-member" | "event" | "notice" | "gallery" | "notification";
  icon: any;
  href: string;
  metadata?: string;
}

const DashboardNavbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userProfile, logout, getUserProfile } = useUserStore();
  const { memberRequests, fetchMemberRequests } = useMemberRequestsStore();
  const { notifications, fetchNotifications } = useNotificationsStore();
  const { familyMembers, fetchFamilyMembers } = useFamilyMembersStore();
  const { userEvents, fetchUserEvents } = useEventsStore();
  const { noticeBoards, fetchUserNoticeBoards } = useNoticeBoardStore();
  const { userGallery, fetchUserGallery } = useGalleryStore();
  const [pendingMemberRequestsCount, setPendingMemberRequestsCount] =
    useState(0);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  // Compute unread count
  const unreadCount = useMemo(() => {
    return notifications.filter((notification) => !notification.read).length;
  }, [notifications]);

  // Search states
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (user?.id && !userProfile) {
      getUserProfile();
    }
  }, [user?.id, userProfile, getUserProfile]);

  useEffect(() => {
    if (user?.id) {
      fetchNotifications(user.id);

      // Load search data
      fetchFamilyMembers();
      fetchUserEvents(user.id);
      fetchUserNoticeBoards(user.id);
      fetchUserGallery(user.id);
    }
  }, [
    user?.id,
    fetchNotifications,
    fetchFamilyMembers,
    fetchUserEvents,
    fetchUserNoticeBoards,
    fetchUserGallery,
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

  useEffect(() => {
    if (user?.user_metadata?.is_admin === true) {
      fetchMemberRequests();

      // Set up polling for real-time updates
      const interval = setInterval(() => {
        fetchMemberRequests();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [user?.user_metadata?.is_admin, fetchMemberRequests]);

  // Search functionality
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    const results: SearchResult[] = [];

    // Search family members
    familyMembers.forEach((member) => {
      if (
        member.name?.toLowerCase().includes(query) ||
        member.description?.toLowerCase().includes(query)
      ) {
        results.push({
          id: `family-${member.id}`,
          title: member.name || "Unknown",
          description: member.description || "Family member",
          type: "family-member",
          icon: Users,
          href: `/family-members`,
          metadata: undefined,
        });
      }
    });

    // Search events
    userEvents.forEach((event) => {
      if (
        event.name?.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query) ||
        event.category?.toLowerCase().includes(query)
      ) {
        results.push({
          id: `event-${event.id}`,
          title: event.name,
          description: event.description || "No description",
          type: "event",
          icon: Calendar,
          href: `/events`,
          metadata: event.date.toString(),
        });
      }
    });

    // Search notices
    noticeBoards.forEach((notice) => {
      if (
        notice.title?.toLowerCase().includes(query) ||
        notice.description?.toLowerCase().includes(query)
      ) {
        results.push({
          id: `notice-${notice.id}`,
          title: notice.title,
          description: notice.description,
          type: "notice",
          icon: Megaphone,
          href: `/notice-board`,
          metadata: notice.posteddate,
        });
      }
    });

    // Search gallery
    userGallery.forEach((item) => {
      if (
        item.caption?.toLowerCase().includes(query) ||
        item.file_name?.toLowerCase().includes(query)
      ) {
        results.push({
          id: `gallery-${item.id}`,
          title: item.caption || item.file_name || "Untitled",
          description: "Gallery item",
          type: "gallery",
          icon: Image,
          href: `/gallery`,
          metadata: item.created_at,
        });
      }
    });

    return results.slice(0, 10); // Limit to 10 results
  }, [searchQuery, familyMembers, userEvents, noticeBoards, userGallery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      router.push(searchResults[0].href);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  const handleResultClick = (result: SearchResult) => {
    router.push(result.href);
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const openSearch = () => {
    setIsSearchOpen(true);
  };

  return (
    <div className="flex bg-border/30 backdrop-blur-sm items-center  px-3  py-4 lg:px-6">
      {pathname.includes("/admin") ? (
        <AdminMobileSidebar />
      ) : pathname.includes("/publisher") ? (
        <PublisherMobileSidebar />
      ) : (
        <DashboardMobileSidebar />
      )}

      <div className="w-full flex items-center justify-between gap-8">
        {/* SEARCH BAR */}
        <div className=" flex-1  flex items-center gap-2">
          <div className="flex-1 w-full  flex items-center justify-center">
            <div
              className="relative max-w-full w-full"
              id="global-search-input"
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Search family members, events, notices..."
                className="w-full pl-10 focus-visible:ring-offset-0 rounded-full h-12 bg-background cursor-pointer"
                onClick={openSearch}
                onFocus={openSearch}
                readOnly
              />
            </div>
          </div>

          {/* <div className="rounded-full cursor-pointer p-2 hover:bg-border/50 hover:text-accent-foreground transition">
            <Mic className="size-5" />
          </div> */}
        </div>

        {/* SEARCH MODAL */}
        <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>Search</DialogTitle>
              <DialogDescription>
                Search across family members, events, notices, and gallery
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSearchSubmit} className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Type to search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10 text-lg h-12"
                  autoFocus
                />
                {searchQuery && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearSearch}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </form>

            {/* Search Results */}
            <div className="flex-1 overflow-y-auto">
              {isSearching ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingIcon className="size-6" />
                  <span className="ml-2">Searching...</span>
                </div>
              ) : searchQuery.trim() && searchResults.length === 0 ? (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    No results found
                  </h3>
                  <p className="text-gray-500">
                    Try searching with different keywords
                  </p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground px-2">
                    {searchResults.length} result
                    {searchResults.length !== 1 ? "s" : ""}
                  </p>
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className="w-full text-left p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          <result.icon className="h-5 w-5 text-gray-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {result.title}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {result.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {result.type.charAt(0).toUpperCase() +
                                result.type.slice(1).replace("-", " ")}
                            </Badge>
                            {result.metadata && (
                              <span className="text-xs text-gray-400">
                                {new Date(result.metadata).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p>Start typing to search...</p>
                  <p className="text-sm mt-2">
                    Search family members, events, notices, and gallery items
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

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
                    : user?.user_metadata?.is_publisher === true
                    ? "/publisher/notifications"
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
              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
                id="navbar-avatar-button"
              >
                <Avatar className="size-10">
                  <AvatarImage
                    src={userProfile?.image}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-muted-foreground/10">
                    {userProfile?.first_name?.charAt(0)}
                    {userProfile?.last_name?.charAt(0)}
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
