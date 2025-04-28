"use client";
import { Menu } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Logo from "../logo";
import { navLinks } from "@/lib/constants/landing";

const MobileSidebar = () => {
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <Sheet>
      <SheetTrigger>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "lg:hidden hover:bg-accent/40"
            // pathname === "/" && "text-background hover:text-background/80"
          )}
        >
          <Menu />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="p-0 h-full">
        <div className=" flex flex-col h-full">
          <div className="pl-6 py-2">
            <Logo />
          </div>
          <div className="px-3 py-2">
            <div className="space-y-1">
              {navLinks.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
                    pathname === route.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  {route.icon && <route.icon className="h-4 w-4" />}
                  {route.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-auto px-3 py-2">
            <Button asChild className="w-full" size="lg">
              <Link href="/sign-up">Sign Up</Link>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;
