"use client";

import DashboardNavbar from "@/components/dashboard/dashboard-navbar";
import DashboardSideBar from "@/components/dashboard/dashboard-side-bar";
import React from "react";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-full flex flex-col relative">
      {/* SIDE BAR */}
      <div className="hidden h-full md:flex md:flex-col md:fixed  md:w-72 md:inset-y-0">
        <DashboardSideBar />
      </div>
      <section className=" md:pl-72 flex flex-1 flex-col  ">
        <div className=" sticky top-0 z-10">
          <DashboardNavbar />
        </div>

        <div className=" p-6 bg-border/30 min-h-screen">{children}</div>
      </section>
    </div>
  );
};

export default DashboardLayout;
