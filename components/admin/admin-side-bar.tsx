"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";

import Logo from "../logo";
import { navLinksTopSection } from "@/lib/constants/admin";
import { cn } from "@/lib/utils";

const AdminSideBar = () => {
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

export default AdminSideBar;
