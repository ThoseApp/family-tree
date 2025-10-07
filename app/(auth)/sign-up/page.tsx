import { Metadata } from "next";
import SignUpDetails from "@/components/auth/sign-up/sign-up-details";
import React from "react";
import { generatePageMetadata } from "@/lib/constants/metadata";

export const dynamic = "force-dynamic";
export const metadata: Metadata = generatePageMetadata("signUp");

const SignUpPage = () => {
  return (
    <>
      <SignUpDetails />
    </>
  );
};

export default SignUpPage;
