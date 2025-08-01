import React from "react";
import FrameWrapper from "../wrappers/frame-wrapper";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import Link from "next/link";
import { Facebook, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="">
      <FrameWrapper className="py-10 bg-[#3A3734]">
        <div className=" grid grid-cols-1 text-background sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-8">
          {/* CONTACT US */}
          <div className="w-full">
            <h5 className="text-sm md:text-base font-semibold mb-4">
              CONTACT US
            </h5>

            <div className="space-y-2">
              <p className="text-sm md:text-base ">
                Email:{" "}
                <Link
                  href="mailto:
                  mosurofamily@gmail.com
                  "
                  className="text-background hover:text-primary"
                >
                  mosurofamily@gmail.com
                </Link>
              </p>
              <p className="text-sm md:text-base ">
                Phone:{" "}
                <Link
                  href="tel:+2349085693183"
                  className="text-background hover:text-primary"
                >
                  +234 908 569 3183
                </Link>
              </p>

              <p className="text-sm md:text-base ">
                22 N&apos;tebo Street, Ijebu Ode
              </p>
            </div>
          </div>

          {/* EXPLORE */}
          <div className="w-full">
            <h5 className="text-sm md:text-base font-semibold mb-4">EXPLORE</h5>

            <div className="space-y-2 flex flex-col">
              <Link
                href="/family-members"
                className="text-sm md:text-base text-background hover:text-primary"
              >
                Family Members
              </Link>
              <Link
                href="/family-tree"
                className="text-sm md:text-base text-background hover:text-primary"
              >
                Family Tree
              </Link>
              <Link
                href="/history"
                className="text-sm md:text-base text-background hover:text-primary"
              >
                History
              </Link>
              <Link
                href="/events"
                className="text-sm md:text-base text-background hover:text-primary"
              >
                Events
              </Link>
              <Link
                href="/gallery"
                className="text-sm md:text-base text-background hover:text-primary"
              >
                Gallery
              </Link>
            </div>
          </div>

          {/* SOCIAL MEDIA LINKS */}
          <div className="w-full">
            <h5 className="text-sm md:text-base font-semibold mb-4">
              SOCIAL MEDIA LINKS
            </h5>

            <div className="flex  gap-4 ">
              <Link href="https://facebook.com" target="_blank">
                <Facebook className="size-6 text-background hover:text-primary" />
              </Link>
              <Link
                href="https://www.instagram.com/lsepropertiesng/"
                target="_blank"
              >
                <Instagram className="size-6 text-background hover:text-primary" />
              </Link>
              <Link href="https://linkedin.com" target="_blank">
                <Linkedin className="size-6 text-background hover:text-primary" />
              </Link>
            </div>
          </div>

          {/* NEWS LETTER */}
          <div className="w-full">
            <h5 className="text-sm md:text-base font-semibold mb-4">
              NEWSLETTER SIGNUP
            </h5>

            <div className="space-y-2">
              <p className="text-sm md:text-base ">
                Subscribe to our newsletter to get the latest updates.
              </p>
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-background"
              />
              <Button
                variant="alternative"
                className="mt-2 text-base rounded-xl"
              >
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </FrameWrapper>

      <div className="items-center flex justify-center bg-foreground py-4">
        <p className="text-xs md:text-sm text-background font-normal text-center">
          &copy; {new Date().getFullYear()} Kith & Kin - All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
