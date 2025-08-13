"use client";

import DashboardNavbar from "@/components/dashboard/dashboard-navbar";
import DashboardSideBar from "@/components/dashboard/dashboard-side-bar";
import { useSidebarStore } from "@/stores/sidebar-store";
import { cn } from "@/lib/utils";
import React, { useEffect } from "react";
import { useOnboardingTour } from "@/hooks/use-onboarding-tour";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { isCollapsed } = useSidebarStore();
  const { maybeStart } = useOnboardingTour();

  useEffect(() => {
    // Auto-start tour once per user
    maybeStart();
  }, [maybeStart]);

  return (
    <div className="h-full flex flex-col relative">
      {/* SIDE BAR */}
      <div
        className={cn(
          "hidden h-full md:flex md:flex-col md:fixed md:inset-y-0 transition-all duration-300",
          isCollapsed ? "md:w-16" : "md:w-72"
        )}
      >
        <DashboardSideBar />
      </div>
      <section
        className={cn(
          "flex flex-1 flex-col transition-all duration-300",
          isCollapsed ? "md:pl-16" : "md:pl-72"
        )}
      >
        <div className="sticky top-0 z-10">
          <DashboardNavbar />
        </div>

        <div className="p-6 bg-border/30 min-h-screen">{children}</div>
      </section>
    </div>
  );
};

export default DashboardLayout;
