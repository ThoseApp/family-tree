import { cn } from "@/lib/utils";
import Image from "next/image";
import React from "react";
import { Button } from "../ui/button";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface AuthWrapperProps {
  children: React.ReactNode;
  imageSrc: string;
  imageStyle?: string;
  noActionButton?: boolean;
}

const AuthWrapper = ({
  children,
  imageSrc,
  imageStyle,
  noActionButton,
}: AuthWrapperProps) => {
  const pathname = usePathname();

  return (
    <div className="h-full flex flex-col relative">
      {/* AUTH FORM */}
      <div className="flex flex-1 flex-col md:pl-[50vw]">
        <div className="p-8 min-h-screen">{children}</div>
      </div>

      {/* SIDE IMAGE */}
      <div className="hidden h-full md:flex md:flex-col md:fixed md:w-[50vw] md:left-0 md:inset-y-0">
        <div
          className="relative w-full h-full"
          style={{ clipPath: "polygon(0 0, 100% 0%, 80% 100%, 0% 100%)" }}
        >
          <Image
            alt={`auth-${imageSrc}`}
            src={imageSrc}
            fill
            className={cn("object-cover bg-slate-100", imageStyle)}
          />

          {/* OVERLAY */}
          <div className="absolute inset-0 bg-black/80" />

          {/* CENTERED DIV */}
          <div
            className={cn(
              "absolute top-0 bottom-0 left-32 flex items-center flex-col justify-center gap-4",
              noActionButton ? "hidden" : ""
            )}
          >
            <h2 className="text-white text-3xl font-semibold">
              {pathname === "/forgot-password" ||
              pathname === "/reset-password" ||
              pathname === "/otp-verification"
                ? "Don’t Have an Account Already?"
                : pathname === "/sign-up"
                ? "Already Signed Up?"
                : ""}
            </h2>
            <div className="text-white text-sm">
              {pathname !== "/sign-in" && "Already Have an Account?"}
            </div>
            {pathname !== "/sign-in" && (
              <Button
                variant="outline"
                size="lg"
                className="rounded-full mt-2 min-w-40 bg-transparent text-background"
                asChild
              >
                <Link href={"/sign-in"}>
                  {pathname !== "/sign-in" && "Sign In"}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthWrapper;
