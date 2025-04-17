"use client";

import LandingHero from "@/components/landing/hero";
import LandingNav from "@/components/landing/nav-bar";
import { fadeInUp, staggerContainer } from "@/lib/animaitons";
import { motion } from "framer-motion";
import Image from "next/image";

export default function Home() {
  return (
    <motion.div
      className="min-h-screen flex flex-col relative"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <div className="flex-1 flex flex-col">
        {/* Hero Section */}
        <motion.div
          className=" px-4 md:px-10 xl:px-16 landing-hero-container"
          variants={fadeInUp}
        >
          <LandingNav />
          <LandingHero />
        </motion.div>
      </div>
    </motion.div>
  );
}
