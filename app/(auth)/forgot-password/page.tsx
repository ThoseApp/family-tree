import { Metadata } from "next";
import ForgotPasswordDetails from "@/components/auth/forgot-password/forgot-password-details";
import React from "react";
import { generatePageMetadata } from "@/lib/constants/metadata";

export const metadata: Metadata = generatePageMetadata("signIn", {
  title: "Forgot Password - Mosuro Family Tree",
  description: "Reset your Mosuro family tree account password. Enter your email to receive password reset instructions.",
});

const ForgotPasswordPage = () => {
  return (
    <div>
      <ForgotPasswordDetails />
    </div>
  );
};

export default ForgotPasswordPage;
