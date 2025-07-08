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
import { MoveRight } from "lucide-react";
import { useLandingPageContent } from "@/hooks/use-landing-page-content";
import { useGalleryStore } from "@/stores/gallery-store";
import { useEffect } from "react";
import { useNoticeBoardStore } from "@/stores/notice-board-store";
import Footer from "@/components/landing/footer";

export default function Home() {
  const { sections, loading, error } = useLandingPageContent();
  const {
    gallery,
    isLoading: galleryLoading,
    fetchGallery,
  } = useGalleryStore();
  const { fetchApprovedNoticeBoards } = useNoticeBoardStore();

  const familyTreeSection = sections.family_tree;
  const gallerySection = sections.gallery_preview;

  // Fetch gallery data on component mount
  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  useEffect(() => {
    // Fetch only approved notice boards for the landing page
    fetchApprovedNoticeBoards();
  }, [fetchApprovedNoticeBoards]);

  // Fallback content
  const defaultFamilyTree = {
    title: "Mosuro's Family Tree",
    description:
      "The informality of family life is a blessed condition that allows us all to become our best while looking our worst.",
    image_url: "/images/landing/makes_history.webp",
  };

  const defaultGallery = {
    title: "GALLERY",
    subtitle: "Remembering Our Golden Days",
  };

  const familyTreeContent = familyTreeSection || defaultFamilyTree;
  const galleryContent = gallerySection || defaultGallery;

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

        {/* FAMILY TREE SECTION */}
        <section className="relative h-[585px] w-full mt-8 lg:mt-12 ">
          <Image
            src={familyTreeContent.image_url || defaultFamilyTree.image_url}
            alt="Family Tree"
            fill
            className="object-cover"
            priority
          />

          <div className="absolute inset-0 bg-foreground/50" />

          {/* Centered Heading */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-y-8">
            <h2 className="text-4xl md:text-6xl font-bold text-center text-background px-4">
              {loading ? "Mosuro's Family Tree" : familyTreeContent.title}
            </h2>
            {familyTreeContent.subtitle && (
              <h3 className="text-xl md:text-2xl text-background/90 font-medium text-center px-4">
                {familyTreeContent.subtitle}
              </h3>
            )}
            <p className="text-background text-center text-lg md:max-w-2xl px-4">
              {loading
                ? defaultFamilyTree.description
                : familyTreeContent.description}
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
            <h2 className="text-xl md:text-2xl font-semibold ">
              {loading ? "GALLERY" : galleryContent.title}
            </h2>
            <p className=" font-bold text-base md:text-xl tracking-wider">
              {loading
                ? "Remembering Our Golden Days"
                : galleryContent.subtitle}
            </p>
            {galleryContent.description && (
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {galleryContent.description}
              </p>
            )}
          </div>

          {/* GALLERY GRID */}
          {galleryLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
            </div>
          ) : (
            <GalleryGrid gallery={gallery} />
          )}

          <div className="flex justify-center">
            <Button
              variant="alternative"
              size="lg"
              className="rounded-full items-center"
              asChild
            >
              <Link href="/gallery">
                View Details
                <MoveRight className="size-5 ml-2" />
              </Link>
            </Button>
          </div>
        </FrameWrapper>
      </div>
    </motion.div>
  );
}
