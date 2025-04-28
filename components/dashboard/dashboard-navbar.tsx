import React from "react";
import DashboardMobileSidebar from "./dashboard-mobile-sidebar";
import { usePathname } from "next/navigation";
import { Bell, Heart, LogOut, Mail, Search, User } from "lucide-react";
import { Mic } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";

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

const DashboardNavbar = () => {
  const pathname = usePathname();
  return (
    <div className="flex bg-border/30 items-center  px-3  py-4 lg:px-6">
      <DashboardMobileSidebar />

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
          <Button variant="outline" size="icon" className="rounded-full">
            <Mail className="size-6" />
          </Button>

          <Button variant="outline" size="icon" className="rounded-full">
            <Heart className="size-6" />
          </Button>

          <Button variant="outline" size="icon" className="rounded-full">
            <Bell className="size-6" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full">
                <Avatar className="size-10">
                  <AvatarImage
                    src={dummyProfileImage}
                    className="object-cover"
                  />
                  <AvatarFallback>AB</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-2">
              <DropdownMenuItem
                className="cursor-pointer flex items-center gap-2 rounded-md"
                // onClick={toggleProfileEditModal}
              >
                <User className="size-5" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer flex items-center gap-2 rounded-md text-destructive hover:bg-destructive/20 hover:text-destructive"
                // onClick={toggleLogoutDialog}
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
