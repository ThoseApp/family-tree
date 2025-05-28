"use client";

import React from "react";
import Image from "next/image";

import FrameWrapper from "@/components/wrappers/frame-wrapper";
import { Button } from "@/components/ui/button";
import { familyMembers } from "@/lib/constants/landing";
import { useLandingPageContent } from "@/hooks/use-landing-page-content";

const FamilyMembersSection = () => {
  const { sections, loading, error } = useLandingPageContent();
  const familyMembersSection = sections.family_members;

  // Fallback content
  const defaultContent = {
    title: "THE MOSURO FAMILY MEMBERS",
    description: "Meet the Family: The People Who Make Us Whole",
  };

  const content = familyMembersSection || defaultContent;

  return (
    <FrameWrapper>
      {/* Header Section */}
      <div className="text-center flex flex-col gap-y-8 items-center">
        <h2 className="text-xl md:text-2xl font-semibold mb-4">
          {loading ? "THE MOSURO FAMILY MEMBERS" : content.title}
        </h2>
        <h3 className="text-2xl md:text-4xl font-bold mb-8">
          {loading
            ? "Meet the Family: The People Who Make Us Whole"
            : content.description}
        </h3>
        <Button variant="alternative" className="rounded-full" size="lg">
          View More →
        </Button>
      </div>

      {/* Photos Grid */}
      <div className="flex justify-center items-end gap-6">
        {familyMembers.map((member) => (
          <div
            key={member.alt}
            className={`relative w-[${member.width}] h-[${member.height}] rounded-3xl overflow-hidden`}
          >
            <Image
              src={member.imageSrc}
              alt={member.alt}
              fill
              className="object-cover"
              priority
            />
          </div>
        ))}
      </div>
    </FrameWrapper>
  );
};

export default FamilyMembersSection;
