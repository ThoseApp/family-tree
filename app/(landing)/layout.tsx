"use client";

import LandingFooter from "@/components/landing/footer";
import LandingNav from "@/components/landing/nav-bar";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import React from "react";

const LandingLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  return (
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
  );
};

export default LandingLayout;
