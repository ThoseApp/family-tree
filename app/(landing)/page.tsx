"use client";

import LandingHero from "@/components/landing/home/hero";
import LandingNav from "@/components/landing/nav-bar";
import HistorySection from "@/components/landing/home/history-section";
import { fadeInUp, staggerContainer } from "@/lib/animaitons";
import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import FamilyMembersSection from "@/components/landing/home/family-members-section";
import UpcomingEventsSection from "@/components/landing/home/upcoming-events-section";
import FrameWrapper from "@/components/wrappers/frame-wrapper";
import GalleryGrid from "@/components/gallery";
import { galleryImages } from "@/lib/constants/landing";
import { MoveRight } from "lucide-react";

export default function Home() {
  return (
    <motion.div
      className="min-h-screen flex flex-col relative"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <div className="flex-1 flex flex-col gap-8 lg:gap-12">
        {/* Hero Section */}
        <motion.div
          className="px-4 md:px-10 xl:px-16 landing-hero-container"
          variants={fadeInUp}
        >
          <LandingNav />
          <LandingHero />
        </motion.div>

        {/* Every Person Makes His Own History */}
        <section className="-mt-8 lg:-mt-12">
          <HistorySection />
        </section>

        {/* MOSURO'S FAMILY TREE */}
        <section className="relative h-[585px] w-full mt-8 lg:mt-12 ">
          <Image
            src="/images/landing/makes_history.webp"
            alt="Family Tree"
            fill
            className="object-cover"
            priority
          />

          <div className="absolute inset-0 bg-foreground/50" />

          {/* Centered Heading */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-y-8">
            <h2 className="text-4xl md:text-6xl font-bold text-center text-background px-4">
              Mosuro&apos;s Family Tree
            </h2>
            <p className="text-background text-center text-lg md:max-w-2xl">
              The informality of family life is a blessed condition that allows
              us all to become our best while looking our worst.
            </p>

            <Button className="rounded-full text-lg " size={"lg"} asChild>
              <Link href="/family-tree">View Family Tree</Link>
            </Button>
          </div>
        </section>

        {/* MEET THE FAMILY */}
        <FamilyMembersSection />

        {/* UPCOMING EVENTS */}
        <UpcomingEventsSection />

        {/* GALLERY */}
        <FrameWrapper className="py-8 lg:py-12">
          {/* HEADER SECTION */}
          <div className="text-center  items-center space-y-6">
            <h2 className="text-xl md:text-2xl font-semibold ">GALLERY</h2>
            <p className=" font-bold text-base md:text-xl tracking-wider">
              Remembering Our Golden Days
            </p>
          </div>

          {/* GALLERY GRID */}
          <GalleryGrid gallery={galleryImages} />

          <div className="flex justify-center">
            <Button
              variant="alternative"
              size="lg"
              className="rounded-full items-center"
            >
              View Details
              <MoveRight className="size-5 ml-2" />
            </Button>
          </div>
        </FrameWrapper>
      </div>
    </motion.div>
  );
}
