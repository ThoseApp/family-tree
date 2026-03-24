"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import FrameWrapper from "@/components/wrappers/frame-wrapper";
import NoticeCarouselCard from "@/components/cards/notice-carousel-card";
import { useNoticeBoardStore } from "@/stores/notice-board-store";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, MoveRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const NoticesCarouselSection = () => {
  const { noticeBoards, loading } = useNoticeBoardStore();
  const [api, setApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!api) return;
    setSelectedIndex(api.selectedScrollSnap());
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, [api]);

  const onReInit = useCallback(() => {
    if (!api) return;
    setScrollSnaps(api.scrollSnapList());
    onSelect();
  }, [api, onSelect]);

  useEffect(() => {
    if (!api) return;
    setScrollSnaps(api.scrollSnapList());
    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onReInit);
    return () => {
      api.off("select", onSelect);
      api.off("reInit", onReInit);
    };
  }, [api, onSelect, onReInit]);

  // Don't render while loading or if no notices
  if (loading || noticeBoards.length === 0) return null;

  const hasMultipleSlides = noticeBoards.length > 1;

  return (
    <FrameWrapper className="py-8 lg:py-12">
      {/* Header with navigation arrows at top-right */}
      <div className="flex items-end justify-between">
        <div className="space-y-2">
          <h2 className="text-xl md:text-2xl font-semibold">NOTICE BOARD</h2>
          <p className="font-bold text-base md:text-xl tracking-wider">
            Stay Informed with Family Announcements
          </p>
        </div>
        {hasMultipleSlides && (
          <div className="hidden md:flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              disabled={!canScrollPrev}
              onClick={() => api?.scrollPrev()}
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Previous slide</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              disabled={!canScrollNext}
              onClick={() => api?.scrollNext()}
            >
              <ArrowRight className="h-4 w-4" />
              <span className="sr-only">Next slide</span>
            </Button>
          </div>
        )}
      </div>

      {/* Carousel */}
      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          loop: hasMultipleSlides,
        }}
        plugins={
          hasMultipleSlides
            ? [
                Autoplay({
                  delay: 5000,
                  stopOnInteraction: false,
                  stopOnMouseEnter: true,
                }),
              ]
            : undefined
        }
        className="w-full"
      >
        <CarouselContent>
          {noticeBoards.map((notice) => (
            <CarouselItem
              key={notice.id}
              className="basis-full md:basis-1/2 lg:basis-1/3"
            >
              <NoticeCarouselCard noticeBoard={notice} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Dot Indicators with Framer Motion layoutId */}
      {hasMultipleSlides && scrollSnaps.length > 1 && (
        <div className="flex justify-center gap-2">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className="relative h-2 w-2 rounded-full bg-foreground/20 hover:bg-foreground/40 transition-colors"
              aria-label={`Go to slide ${index + 1}`}
            >
              {index === selectedIndex && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-foreground"
                  layoutId="notices-carousel-dot"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* CTA */}
      <div className="flex justify-center">
        <Button
          variant="alternative"
          size="lg"
          className="rounded-full items-center"
          asChild
        >
          <Link href="/notice-board">
            View All Notices
            <MoveRight className="size-5 ml-2" />
          </Link>
        </Button>
      </div>
    </FrameWrapper>
  );
};

export default NoticesCarouselSection;
