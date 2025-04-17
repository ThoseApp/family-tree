"use client";

import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import Logo from "../logo";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import MobileSidebar from "./mobile-side-bar";
import { navLinks } from "@/lib/constants/landing";

const LandingNav = () => {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 h-16 sm:h-24 bg-white/5 backdrop-blur-sm border-b border-white/20 flex items-center px-4 md:px-10 xl:px-16",
        scrolled ? " shadow-md" : "",
        pathname !== "/" && "",
        pathname === "/" &&
          !scrolled &&
          "border-b-0 bg-transparent backdrop-blur-none"
      )}
    >
      <div className="container mx-auto flex items-center justify-between">
        <Logo />
        <div className="hidden lg:flex items-center">
          {navLinks.map((route) => (
            <Button
              asChild
              size="lg"
              variant="navlink"
              key={route.href}
              className={cn(
                scrolled
                  ? "text-black"
                  : "text-black hover:text-primary hover:scale-110 ease-in transition duration-150",
                pathname === route.href &&
                  "border-b-2 border-primary rounded-none hover:no-underline "
              )}
            >
              <Link href={route.href}>{route.label}</Link>
            </Button>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-x-1 md:gap-x-2">
          <Button
            asChild
            size="lg"
            className={cn(
              "transition-colors rounded-full bg-primary text-black"
              // scrolled
              //   ? "bg-primary text-black"
              //   : "bg-primary/10 text-primary hover:bg-primary/80",
              // pathname === "/" && !scrolled && "bg-primary text-black"
            )}
          >
            <Link href="/sign-up">Sign Up</Link>
          </Button>
        </div>

        <div className="lg:hidden">
          <MobileSidebar />
        </div>
      </div>
    </div>
  );
};

export default LandingNav;
