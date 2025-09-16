"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn, slideIn, staggerContainer } from "@/lib/animaitons";
import { Separator } from "../../ui/separator";
import { Box } from "lucide-react";
import { useLandingPageContent } from "@/hooks/use-landing-page-content";

const Hero = () => {
  const { sections, loading, error } = useLandingPageContent();
  const heroSection = sections.hero;

  // Fallback content while loading or if error
  const defaultContent = {
    title: "THE MOSURO FAMILY",
    subtitle: "The Story Behind the Mosuro Name",
    description:
      "Discover our rich family heritage, share precious moments, and stay connected with family members across the world.",
  };

  const content = heroSection || defaultContent;

  return (
    <div className="flex items-center justify-center text-background  ">
      {/* Optional overlay for better text visibility */}
      <motion.div
        className="absolute h-[90dvh] lg:h-[114dvh] inset-0 bg-foreground/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 0.8 }}
      />
      <div className="h-[70dvh] lg:h-screen w-full flex flex-col lg:flex-row lg:items-center gap-y-14 md:gap-y-16 lg:gap-y-0 justify-center ">
        <motion.div
          className="relative z-10  lg:min-w-[1073px] lg:min-h-[531px]"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <div className=" text-left space-y-4 sm:space-y-8 py-8  bg-[#19141066]/40 rounded-lg">
            <motion.div
              className="text-4xl lg:text-5xl xl:text-6xl  sm:text-center font-bold relative"
              variants={fadeInUp}
            >
              {loading ? "THE MOSURO FAMILY" : content.title}
            </motion.div>

            <div className="flex -mt-5 items-center gap-x-6 justify-center">
              <Separator className="w-[310px] h-[2px] bg-background" />
              <Box className="size-8" />
              <Separator className="w-[310px] h-[2px] bg-background" />
            </div>

            <div className="flex flex-col gap-y-2 text-2xl font-medium leading-8">
              <motion.p className=" sm:text-center " variants={slideIn}>
                {loading
                  ? "The Story Behind the Mosuro Name"
                  : content.subtitle}
              </motion.p>
            </div>

            {content.description && (
              <motion.p
                className="text-lg sm:text-center max-w-4xl mx-auto"
                variants={fadeInUp}
              >
                {content.description}
              </motion.p>
            )}

            {/* <motion.div
              className="flex md:items-center md:justify-center flex-row flex-wrap gap-2 md:gap-4"
              variants={fadeInUp}
            >
              <Button
                asChild
                variant="default"
                size="lg"
                className="rounded-full text-2xl font-medium"
              >
                <Link href="/history">Read History</Link>
              </Button>
            </motion.div> */}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;
