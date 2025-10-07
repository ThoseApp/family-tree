import { Metadata } from "next";
import SignInDetails from "@/components/auth/sign-in/sign-in-details";
import { generatePageMetadata } from "@/lib/constants/metadata";

export const dynamic = "force-dynamic";
export const metadata: Metadata = generatePageMetadata("signIn");

export default async function SignInPage() {
  return (
    <>
      <SignInDetails />
    </>
  );
}
