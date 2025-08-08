"use client";

import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import Logo from "../logo";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import MobileSidebar from "./mobile-side-bar";
import { navLinks } from "@/lib/constants/landing";
import { useUserStore } from "@/stores/user-store";
import { getFilteredNavLinks } from "@/lib/utils/navigation-helpers";

const LandingNav = () => {
  const { user } = useUserStore();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  // Simple scroll detection for background transition
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isHomePage = pathname === "/";
  const shouldUseTransparentBg = isHomePage && !scrolled;

  // Filter navigation links based on user authentication
  const filteredNavLinks = getFilteredNavLinks(navLinks, user);

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out",
        "h-16 sm:h-20 flex items-center",
        // Background transitions
        scrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border/50 shadow-sm"
          : shouldUseTransparentBg
          ? "bg-transparent backdrop-blur-none border-b-0"
          : "bg-background/90 backdrop-blur-sm border-b border-border/30"
      )}
    >
      <div className="container mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Logo />

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-1">
          {filteredNavLinks.map((route) => {
            const isActive = pathname === route.href;

            return (
              <Button
                key={route.href}
                asChild
                variant="ghost"
                size="sm"
                className={cn(
                  "relative px-4 py-2 text-sm font-medium transition-colors duration-200",
                  shouldUseTransparentBg &&
                    "hover:bg-primary/40 hover:text-foreground",
                  // Active state
                  isActive
                    ? "text-primary"
                    : shouldUseTransparentBg
                    ? "text-white hover:text-white/80"
                    : "text-foreground/70 hover:text-foreground"
                )}
              >
                <Link href={route.href} className="relative">
                  {route.label}

                  {/* Simple active indicator */}
                  {isActive && (
                    <div
                      className={cn(
                        "absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-colors duration-200",
                        shouldUseTransparentBg ? "bg-white" : "bg-primary"
                      )}
                    />
                  )}
                </Link>
              </Button>
            );
          })}
        </nav>

        {/* CTA Buttons */}
        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <Button
              asChild
              variant={shouldUseTransparentBg ? "secondary" : "default"}
              size="sm"
              className={cn(
                "rounded-full px-6 transition-all duration-200",
                shouldUseTransparentBg &&
                  "bg-white text-foreground hover:bg-white/90"
              )}
            >
              <Link
                href={
                  user.user_metadata?.is_admin
                    ? "/admin"
                    : user.user_metadata?.is_publisher
                    ? "/publisher"
                    : "/dashboard"
                }
              >
                Personal Space
              </Link>
            </Button>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className={cn(
                  "text-sm font-medium transition-colors duration-200",
                  shouldUseTransparentBg
                    ? "text-white hover:text-white/80"
                    : "text-foreground/70 hover:text-foreground"
                )}
              >
                <Link href="/sign-in">Sign In</Link>
              </Button>

              <Button
                asChild
                variant={shouldUseTransparentBg ? "secondary" : "default"}
                size="sm"
                className={cn(
                  "rounded-full px-6 transition-all duration-200",
                  shouldUseTransparentBg &&
                    "bg-white text-foreground hover:bg-white/90"
                )}
              >
                <Link href="/sign-up">Sign Up</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="lg:hidden">
          <MobileSidebar />
        </div>
      </div>
    </div>
  );
};

export default LandingNav;
