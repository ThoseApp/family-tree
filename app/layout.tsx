import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

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
        <Toaster />
        {/* //TODO: ADD THEME PROVIDER */}
        {children}
      </body>
    </html>
  );
}
