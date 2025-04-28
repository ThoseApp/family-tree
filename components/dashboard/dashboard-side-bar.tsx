"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import Logo from "../logo";
import { navLinksTopSection } from "@/lib/constants/dashbaord";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";
import { useState } from "react";

const DashboardSideBar = () => {
  const pathname = usePathname();

  return (
    <>
      <div className="space-y-4 py-4 flex flex-col h-full">
        <div className="pb-2 flex-1">
          <Logo />

          <div className="flex flex-col gap-5 h-full">
            <div className="space-y-1 px-3 py-6">
              {navLinksTopSection.map((route) => (
                <Link
                  href={route.href}
                  key={route.href}
                  className={cn(
                    "relative text-sm group p-3 flex w-full rounded-lg  justify-start items-center  cursor-pointer hover:bg-foreground hover:text-background  transition",
                    pathname === route.href
                      ? "text-background bg-foreground "
                      : "text-foreground"
                  )}
                >
                  <div className="flex items-center flex-1">
                    {route.icon && (
                      <route.icon className={cn("size-5 mr-3 ")} />
                    )}
                    {route.label}
                  </div>
                </Link>
              ))}
            </div>
            {/* 
            <div className="mt-auto pb-16 px-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start px-3 py-2 rounded-lg hover:bg-primary/30 focus-visible:ring-0 focus-visible:ring-offset-0"
                  >
                    <Avatar className="h-8 w-8 mr-2 border border-[#C8CFD5]/30">
                      <AvatarFallback className="bg-primary/20  font-medium">
                        OJ
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start text-left mr-auto">
                      <span className="font-medium text-sm">Otor John</span>
                      <span className="text-xs text-muted-foreground">
                        Admin
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-2">
                  <DropdownMenuItem
                    className="cursor-pointer flex items-center gap-2 rounded-md"
                    onClick={toggleProfileEditModal}
                  >
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer flex items-center gap-2 rounded-md text-destructive"
                    onClick={toggleLogoutDialog}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div> */}

            <div className="mt-auto  px-3">
              <div
                className="relative text-sm group p-3 flex w-full rounded-lg  justify-start items-center  cursor-pointer hover:bg-destructive/20 text-destructive   transition"
                // onClick={toggleLogoutDialog}
              >
                <LogOut className="size-5 mr-2" />
                <span>Log out</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardSideBar;
