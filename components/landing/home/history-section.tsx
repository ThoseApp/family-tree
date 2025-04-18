import Image from "next/image";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animaitons";
import ProfileHistoryCard from "@/components/cards/profile-history-card";
import { historyCards } from "@/lib/constants/landing";
import { Button } from "@/components/ui/button";

const HistorySection = () => {
  return (
    <section className="relative">
      {/* Background Image Section */}
      <div className="relative h-[585px] w-full z-0">
        <Image
          src="/images/landing/makes_history.webp"
          alt="Family Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-foreground/40" />

        {/* Centered Heading */}
        <div className="absolute inset-0 flex items-center justify-center">
          <h2 className="text-4xl md:text-6xl font-bold text-center text-background px-4">
            Every Person Makes His Own History
          </h2>
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
          <Button variant="alternative" size="lg" className="rounded-full">
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
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HistorySection;
