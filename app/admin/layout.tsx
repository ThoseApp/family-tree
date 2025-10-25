"use client";

import AdminSideBar from "@/components/admin/admin-side-bar";
import DashboardNavbar from "@/components/dashboard/dashboard-navbar";
import MobileResponsiveWrapper from "@/components/wrappers/mobile-responsive-wrapper";
import { useSidebarStore } from "@/stores/sidebar-store";
import { cn } from "@/lib/utils";
import React, { useEffect } from "react";
import { useOnboardingTour } from "@/hooks/use-onboarding-tour";
import { useUserStore } from "@/stores/user-store";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { isCollapsed } = useSidebarStore();
  const { maybeStart } = useOnboardingTour();
  const { user, profile } = useUserStore();

  useEffect(() => {
    if (user && profile) {
      maybeStart();
    }
  }, [user?.id, profile?.has_completed_onboarding_tour]);

  return (
    <MobileResponsiveWrapper
      mobileTitle="Admin Panel Access Required"
      mobileSubtitle="Family Tree Admin"
      showRotateHint={true}
    >
      <div className="h-full flex flex-col relative">
        {/* SIDE BAR */}
        <div
          className={cn(
            "hidden h-full md:flex md:flex-col md:fixed md:inset-y-0 transition-all duration-300 ",
            isCollapsed ? "md:w-16" : "md:w-72"
          )}
        >
          <AdminSideBar />
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

          <div className="p-6 bg-border/30 min-h-screen overflow-y-scroll">
            {children}
          </div>
        </section>
      </div>
    </MobileResponsiveWrapper>
  );
};

export default DashboardLayout;
