import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import { Toaster as UIToaster } from "@/components/ui/toaster";
import { Toaster } from "sonner";
import { ConnectionStatusBanner } from "@/components/connection-status-banner";

const font = Montserrat({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Family Tree",
  description: "Family Tree",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${font.className}`}>
        {/* <UIToaster /> */}
        <Toaster position="top-center" richColors />
        <ConnectionStatusBanner />
        {/* //TODO: ADD THEME PROVIDER */}
        {children}
      </body>
    </html>
  );
}
