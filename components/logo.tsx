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
      <div className="relative size-10 md:size-12 mr-2 md:mr-4">
        <Image
          fill
          alt="logo"
          src="/images/kith_logo.webp"
          className="object-cover object-center rounded-full"
        />
      </div>

      <h1 className="text-base font-bold">Kith & Kin</h1>
    </Link>
  );
};

export default Logo;
