"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";

interface LogoProps {
  component?: string;
}

const Logo = ({ component }: LogoProps) => {
  return (
    <Link href="/" className="flex items-center">
      {/* //TODO: ADD THE IMAGE */}
      {/* <div className="relative size-20 md:size-24 mr-2 md:mr-4">
        <Image
          fill
          alt="logo"
          src={component === "footer" ? "/logo_white.png" : "/logo.png"}
          className="object-contain object-center"
        />
      </div> */}

      <div className="text-2xl font-bold italic">Logo</div>
    </Link>
  );
};

export default Logo;
