import { cn } from "@/lib/utils";
import Image from "next/image";
import React from "react";
import { Button } from "../ui/button";
import { usePathname } from "next/navigation";

interface AuthWrapperProps {
  children: React.ReactNode;
  imageSrc: string;
  imageStyle?: string;
}

const AuthWrapper = ({ children, imageSrc, imageStyle }: AuthWrapperProps) => {
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
          style={{ clipPath: "polygon(0 0, 100% 0%, 70% 100%, 0% 100%)" }}
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
          <div className="absolute top-0 bottom-0 left-32 flex items-center flex-col justify-center gap-4">
            <h2 className="text-white text-3xl font-semibold">
              Don&apos;t Have an Account Already?
            </h2>
            <div className="text-white text-sm">
              {pathname === "/sign-in"
                ? "Don’t Have an Account Already?"
                : "Already Signed Up?"}
            </div>
            <Button
              variant="outline"
              size="lg"
              className="rounded-full mt-2 bg-transparent text-background"
            >
              {pathname === "/sign-in" ? "Sign Up" : "Sign In"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthWrapper;
