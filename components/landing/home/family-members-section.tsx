"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

import FrameWrapper from "@/components/wrappers/frame-wrapper";
import { Button } from "@/components/ui/button";
import { familyMembers } from "@/lib/constants/landing";
import { useLandingPageContent } from "@/hooks/use-landing-page-content";
import { isMockMode } from "@/lib/mock-data/initialize";
import { mockDataService } from "@/lib/mock-data/mock-service";
import Link from "next/link";
import { dummyProfileImage } from "@/lib/constants";

const FamilyMembersSection = () => {
  const { sections, loading, error } = useLandingPageContent();
  const familyMembersSection = sections.family_members;
  const [mockFamilyMembers, setMockFamilyMembers] = useState<any[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load mock family members if in mock mode
  useEffect(() => {
    const loadMockData = async () => {
      if (isMockMode()) {
        try {
          console.log("[Mock Landing] Loading family members for landing page");
          await mockDataService.initialize();
          const members = mockDataService.query(
            "family-tree",
            [{ column: "life_status", operator: "eq", value: "alive" }],
            [{ column: "first_name", ascending: true }]
          );

          // Take first 5 members for landing page display
          const featuredMembers = members
            .slice(0, 5)
            .map((member: any, index: number) => ({
              imageSrc: member.profile_image_url || dummyProfileImage,
              alt: `${member.first_name} ${member.last_name}`,
              name: `${member.first_name} ${member.last_name}`,
              width:
                ["300px", "300px", "300px", "300px", "300px"][index] || "300px",
              height:
                ["563px", "369px", "269px", "464px", "563px"][index] || "400px",
            }));

          setMockFamilyMembers(featuredMembers);
          console.log(
            `[Mock Landing] Loaded ${featuredMembers.length} featured family members`
          );
        } catch (error) {
          console.error("[Mock Landing] Error loading family members:", error);
        }
      }
      setIsInitialized(true);
    };

    loadMockData();
  }, []);

  const displayMembers = isMockMode() ? mockFamilyMembers : familyMembers;

  // Fallback content (different for mock vs production)
  const defaultContent = isMockMode()
    ? {
        title: "THE SMITH FAMILY MEMBERS",
        description: "Meet the Family: The People Who Make Us Whole",
      }
    : {
        title: "THE MOSURO FAMILY MEMBERS",
        description: "Meet the Family: The People Who Make Us Whole",
      };

  const content = familyMembersSection || defaultContent;

  return (
    <FrameWrapper>
      {/* Header Section */}
      <div className="text-center flex flex-col gap-y-8 items-center">
        <h2 className="text-xl md:text-2xl font-semibold mb-4">
          {loading
            ? isMockMode()
              ? "THE SMITH FAMILY MEMBERS"
              : "THE MOSURO FAMILY MEMBERS"
            : content.title}
        </h2>
        <h3 className="text-2xl md:text-4xl font-bold mb-8">
          {loading
            ? "Meet the Family: The People Who Make Us Whole"
            : content.description}
        </h3>
        <Button
          variant="alternative"
          className="rounded-full"
          size="lg"
          asChild
        >
          <Link href="/family-members">View More →</Link>
        </Button>
      </div>

      {/* Photos Grid */}
      <div className="flex justify-center items-end gap-6">
        {isInitialized &&
          displayMembers.map((member, index) => (
            <div
              key={member.alt || `member-${index}`}
              className={`relative w-[${member.width}] h-[${member.height}] rounded-3xl overflow-hidden`}
            >
              <Image
                src={member.imageSrc}
                alt={member.alt}
                fill
                className="object-cover"
                priority
              />
              {/* Show member name if available (for mock data) */}
              {member.name && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <p className="text-white font-medium text-center text-sm">
                    {member.name}
                  </p>
                </div>
              )}
            </div>
          ))}
      </div>
    </FrameWrapper>
  );
};

export default FamilyMembersSection;
