"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect } from "react";

import Logo from "../logo";
import { navLinksTopSection } from "@/lib/constants/dashbaord";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/stores/user-store";
import { useSidebarStore } from "@/stores/sidebar-store";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DashboardSideBarProps {
  forceMobileExpanded?: boolean;
}

const DashboardSideBar = ({
  forceMobileExpanded = false,
}: DashboardSideBarProps) => {
  const pathname = usePathname();
  const { logout } = useUserStore();
  const { isCollapsed, toggleSidebar } = useSidebarStore();

  // Force expanded state for mobile or use store state for desktop
  const isActuallyCollapsed = forceMobileExpanded ? false : isCollapsed;

  // Add keyboard shortcut for toggling sidebar (only for desktop)
  useEffect(() => {
    if (forceMobileExpanded) return; // Don't add keyboard shortcuts in mobile mode

    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "b") {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar, forceMobileExpanded]);

  return (
    <TooltipProvider>
      <div
        className={cn(
          "space-y-4 py-4 flex flex-col h-full bg-background border-r transition-all duration-300",
          isActuallyCollapsed ? "w-16" : "w-72"
        )}
      >
        <div className="pb-2 flex-1">
          {/* Header with Logo and Toggle */}
          <div className="flex items-center justify-between px-3 mb-6">
            {!isActuallyCollapsed && <Logo />}
            {!forceMobileExpanded && (
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSidebar}
                    className="ml-auto hover:bg-accent"
                  >
                    {isActuallyCollapsed ? (
                      <ChevronRight className="h-4 w-4" />
                    ) : (
                      <ChevronLeft className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="ml-2">
                  <p>
                    {isActuallyCollapsed
                      ? "Expand sidebar"
                      : "Collapse sidebar"}{" "}
                    (⌘B)
                  </p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          <div className="flex flex-col gap-5 h-full">
            <div className="space-y-1 px-3">
              {navLinksTopSection.map((route) => (
                <Tooltip key={route.href} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Link
                      href={route.href}
                      data-tour={`nav-${route.label
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                      className={cn(
                        "relative text-sm group p-3 flex w-full rounded-lg justify-start items-center cursor-pointer hover:bg-foreground hover:text-background transition",
                        pathname === route.href
                          ? "text-background bg-foreground"
                          : "text-foreground",
                        isActuallyCollapsed && "justify-center"
                      )}
                    >
                      <div
                        className={cn(
                          "flex items-center",
                          isActuallyCollapsed ? "justify-center" : "flex-1"
                        )}
                      >
                        {route.icon && (
                          <route.icon
                            className={cn(
                              "size-5",
                              isActuallyCollapsed ? "" : "mr-3"
                            )}
                          />
                        )}
                        {!isActuallyCollapsed && route.label}
                      </div>
                    </Link>
                  </TooltipTrigger>
                  {isActuallyCollapsed && (
                    <TooltipContent side="right" className="ml-2">
                      <p>{route.label}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              ))}
            </div>

            <div className="mt-auto px-3">
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "relative text-sm group p-3 flex w-full rounded-lg justify-start items-center cursor-pointer hover:bg-destructive/20 text-destructive transition",
                      isActuallyCollapsed && "justify-center"
                    )}
                    onClick={logout}
                  >
                    <LogOut
                      className={cn(
                        "size-5",
                        isActuallyCollapsed ? "" : "mr-2"
                      )}
                    />
                    {!isActuallyCollapsed && <span>Log out</span>}
                  </div>
                </TooltipTrigger>
                {isActuallyCollapsed && (
                  <TooltipContent side="right" className="ml-2">
                    <p>Log out</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default DashboardSideBar;
