import { Metadata } from "next";
import OtpVerificationDetails from "@/components/auth/otp-verification/otp-verification-details";
import React from "react";
import { generatePageMetadata } from "@/lib/constants/metadata";

export const dynamic = "force-dynamic";
export const metadata: Metadata = generatePageMetadata("signIn", {
  title: "Verify Email - Mosuro Family Tree",
  description: "Verify your email address to complete your Mosuro family tree account setup. Enter the verification code sent to your email.",
});

const OtpVerificationPage = () => {
  return (
    <>
      <OtpVerificationDetails />
    </>
  );
};

export default OtpVerificationPage;
