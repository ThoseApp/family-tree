"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animaitons";
import ProfileHistoryCard from "@/components/cards/profile-history-card";
import { historyCards } from "@/lib/constants/landing";
import { Button } from "@/components/ui/button";
import { useLandingPageContent } from "@/hooks/use-landing-page-content";
import Link from "next/link";

const HistorySection = () => {
  const { sections, loading, error } = useLandingPageContent();
  const historySection = sections.history;

  // Fallback content
  const defaultContent = {
    title: "Every Person Makes His Own History",
    subtitle: "The Legacy of the Mosuro Family",
    description:
      "Explore the rich heritage and stories that shaped our family through generations.",
    image_url: "/images/landing/makes_history.webp",
  };

  const content = historySection || defaultContent;

  return (
    <section className="relative">
      {/* Background Image Section */}
      <div className="relative h-[585px] w-full z-0">
        <Image
          src={content.image_url || defaultContent.image_url}
          alt="Family Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-foreground/40" />

        {/* Centered Heading */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-4">
            <h2 className="text-4xl md:text-6xl font-bold text-background mb-4">
              {loading ? "Every Person Makes His Own History" : content.title}
            </h2>
            {content.subtitle && (
              <p className="text-xl md:text-2xl text-background/90 font-medium">
                {content.subtitle}
              </p>
            )}
            {content.description && (
              <p className="text-lg text-background/80 max-w-4xl mx-auto mt-4">
                {content.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Cards Container - Positioned at bottom */}
      <div className=" -mt-32  px-4 md:px-10 xl:px-16">
        <motion.div variants={fadeInUp} className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {historyCards.map((card, index) => (
              <ProfileHistoryCard key={index} {...card} />
            ))}
          </div>
        </motion.div>
      </div>

      {/* View History Button Section */}
      <div className="pt-8 md:pt-12">
        <div className="flex justify-center">
          <Button
            variant="alternative"
            size="lg"
            className="rounded-full"
            asChild
          >
            <Link href="/history">
              View History
              <svg
                className="size-5 ml-2 "
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HistorySection;
