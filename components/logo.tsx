"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";

interface LogoProps {
  hideText?: boolean;
  component?: string;
}

const Logo = ({ component, hideText }: LogoProps) => {
  return (
    <Link href="/" className="flex items-center">
      <div className="relative size-10 md:size-12 mr-2 md:mr-4 3xl:size-14">
        <Image
          fill
          alt="logo"
          src="/images/family_tree_logo.png"
          className="object-cover object-center rounded-full"
        />
      </div>

      {!hideText && (
        <h1 className="text-base 3xl:text-2xl font-bold">Family Tree</h1>
      )}
    </Link>
  );
};

export default Logo;
