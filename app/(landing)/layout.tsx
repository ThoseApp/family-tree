"use client";

import LandingFooter from "@/components/landing/footer";
import LandingNav from "@/components/landing/nav-bar";
import MobileResponsiveWrapper from "@/components/wrappers/mobile-responsive-wrapper";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import React from "react";

const LandingLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  return (
    <MobileResponsiveWrapper
      mobileTitle="Desktop Experience Required"
      mobileSubtitle="Family Tree Family Tree"
      showRotateHint={true}
    >
      <main className="h-full overflow-auto">
        <div className={cn("mx-auto h-full")}>
          {pathname !== "/" && <LandingNav />}
          <div
            className={cn(
              "min-h-screen",
              pathname !== "/" && "pt-16 sm:pt-24",
              pathname === "/" || pathname === "/history"
                ? null
                : "px-4 md:px-10 xl:px-16"
            )}
          >
            {children}
          </div>
          <LandingFooter />
        </div>
      </main>
    </MobileResponsiveWrapper>
  );
};

export default LandingLayout;
