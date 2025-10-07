import { Metadata } from "next";
import ResetPasswordDetails from "@/components/auth/reset-password/reset-password-details";
import React from "react";
import { generatePageMetadata } from "@/lib/constants/metadata";

export const dynamic = "force-dynamic";
export const metadata: Metadata = generatePageMetadata("signIn", {
  title: "Reset Password - Mosuro Family Tree",
  description: "Create a new password for your Mosuro family tree account. Enter your new password to regain access to your account.",
});

const ResetPasswordPage = () => {
  return (
    <>
      <ResetPasswordDetails />
    </>
  );
};

export default ResetPasswordPage;
