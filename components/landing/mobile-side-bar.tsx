"use client";

import { Menu, X, User, LogIn, UserPlus } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
} from "@/components/ui/sheet";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Logo from "../logo";
import { navLinks } from "@/lib/constants/landing";
import { useUserStore } from "@/stores/user-store";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { getFilteredNavLinks } from "@/lib/utils/navigation-helpers";

const MobileSidebar = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUserStore();
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Close sidebar when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  if (!isMounted) {
    return null;
  }

  const isHomePage = pathname === "/";

  // Filter navigation links based on user authentication
  const filteredNavLinks = getFilteredNavLinks(navLinks, user);

  const getUserInitials = () => {
    if (user?.user_metadata?.first_name && user?.user_metadata?.last_name) {
      return `${user.user_metadata.first_name[0]}${user.user_metadata.last_name[0]}`.toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || "U";
  };

  const getUserDisplayName = () => {
    if (user?.user_metadata?.first_name && user?.user_metadata?.last_name) {
      return `${user.user_metadata.first_name} ${user.user_metadata.last_name}`;
    }
    return user?.email || "User";
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "lg:hidden transition-colors duration-200",
            isHomePage && "text-white hover:text-white/80"
          )}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-80 p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="px-6 py-4 border-b bg-primary/5">
            <div className="flex items-center justify-between">
              <Logo />
              {/* <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </SheetTrigger> */}
            </div>

            {/* User Info */}
            {user && (
              <div className="flex items-center gap-3 pt-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="font-medium text-sm text-foreground">
                    {getUserDisplayName()}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            )}
          </SheetHeader>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {filteredNavLinks.map((route) => {
              const isActive = pathname === route.href;
              const Icon = route.icon;

              return (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "flex items-center gap-4 rounded-lg px-4 py-3 text-sm font-medium",
                    "transition-colors duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground/80 hover:text-foreground hover:bg-primary/5"
                  )}
                >
                  {/* Icon */}
                  {Icon && (
                    <Icon
                      className={cn(
                        "h-5 w-5",
                        isActive ? "text-primary-foreground" : "text-primary"
                      )}
                    />
                  )}

                  {/* Label */}
                  <span>{route.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer Actions */}
          <div className="p-4 border-t">
            {user ? (
              <Button
                asChild
                className="w-full rounded-lg transition-all duration-200"
                size="lg"
              >
                <Link
                  href={user.user_metadata?.is_admin ? "/admin" : "/dashboard"}
                  className="flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
            ) : (
              <div className="space-y-3">
                <Button
                  asChild
                  variant="outline"
                  className="w-full rounded-lg transition-all duration-200"
                  size="lg"
                >
                  <Link href="/sign-in" className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </Link>
                </Button>

                {/* <Button
                  asChild
                  className="w-full rounded-lg transition-all duration-200"
                  size="lg"
                >
                  <Link href="/sign-up" className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Sign Up
                  </Link>
                </Button> */}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;
