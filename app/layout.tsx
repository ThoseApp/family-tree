import { Metadata } from "next";
import "./globals.css";
import RootLayoutClient from "@/components/wrappers/root-layout-client";
import { generatePageMetadata } from "@/lib/constants/metadata";

export const metadata: Metadata = generatePageMetadata("home");

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <RootLayoutClient>{children}</RootLayoutClient>;
}
