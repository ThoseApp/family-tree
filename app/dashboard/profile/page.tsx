"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image"; // Assuming Next.js for Image component
import { dummyProfileImage } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useUserStore } from "@/stores/user-store";
import { useGalleryStore } from "@/stores/gallery-store";
import { toast } from "sonner";
import { UserProfile } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
// Placeholder data based on the image
const profile = {
  name: "John Smith",
  imageUrl: dummyProfileImage, // Replace with actual image path
  fullName: "John Smith",
  dob: "December 3, 1960",
  gender: "Male",
  phone: "123-4567-8900",
  occupation: "Neurosurgeon",
  maritalStatus: "Married",
  biography:
    "Lorem ipsum dolor sit amet, conscttettutur adipiscing elit. Maecenas congue srcu quis turpis is tintinduct, ur feugat saplen vairus. Lorem ipsum dolor sit amet, conscttettutur adipiscing elit. Maecenas congue srcu quis turpis is tintinduct, ur feugat saplen vairus. Lorem ipsum dolor sit amet, conscttettutur adipiscing elit. Maecenas congue srcu quis turpis is tintinduct, ur feugat saplen vairus. Lorem ipsum dolor sit amet, conscttettutur adipiscing elit. Maecenas congue srcu quis turpis is tintinduct, ur feugat saplen vairus.",
  parents: [
    { name: "Robert Smith", imageUrl: dummyProfileImage },
    { name: "Margaret Smith", imageUrl: dummyProfileImage },
  ],
  siblings: [
    { name: "Robert Smith", imageUrl: dummyProfileImage },
    { name: "Margaret Smith", imageUrl: dummyProfileImage },
    { name: "Margaret Smith", imageUrl: dummyProfileImage }, // Example additional sibling
  ],
  spouse: [{ name: "Margaret Smith", imageUrl: dummyProfileImage }],
  children: [
    { name: "Angela Smith", imageUrl: dummyProfileImage },
    { name: "Robertto Smith", imageUrl: dummyProfileImage },
    { name: "Robert Smith", imageUrl: dummyProfileImage },
  ],
  timeline: ["Graduated in 1990", "Married in 2000"],
  gallery: [
    dummyProfileImage,
    dummyProfileImage,
    dummyProfileImage,
    dummyProfileImage,
    dummyProfileImage,
    dummyProfileImage,
    dummyProfileImage,
    dummyProfileImage,
    dummyProfileImage, // Added some extra images for grid demo
  ],
};

// Simple component for linked family members
const FamilyMember = ({
  name,
  imageUrl,
}: {
  name: string;
  imageUrl: string;
}) => (
  <div className="flex items-center space-x-2 mr-4 mb-2">
    <div className="relative w-10 h-10">
      <Image
        src={imageUrl}
        alt={name}
        fill
        className="rounded-full object-cover"
      />
    </div>
    <span>{name}</span>
  </div>
);

const Page = () => {
  const { user, getUserProfile } = useUserStore();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { fetchUserImages, userImages } = useGalleryStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      toast.error("User not authenticated");
      return;
    }

    (async () => {
      fetchUserImages(user.id);
      const profile = await getUserProfile();
      setUserProfile(profile);
    })();
  }, [user]);

  return (
    <div className="flex flex-col gap-y-8 lg:gap-y-12">
      {/* HEADER SECTION */}
      <div className="flex md:items-center md:flex-row flex-col md:justify-between gap-y-4">
        <h1 className="text-2xl font-semibold">Profile</h1>
      </div>

      {/* Profile Section */}
      <Card>
        {/* Header */}
        <CardHeader className="">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="relative w-16 h-16">
                <Image
                  src={userProfile?.image || ""}
                  alt={userProfile?.first_name || ""}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <h1 className="text-2xl font-semibold">
                {userProfile?.first_name} {userProfile?.last_name}
              </h1>
            </div>
            <Button variant="outline" asChild>
              <Link href="/dashboard/settings">Edit Profile</Link>
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Basic Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-gray-700">
              <div>
                <span className="font-medium text-gray-900">Full Name:</span>{" "}
                {userProfile?.first_name} {userProfile?.last_name}
              </div>
              <div>
                <span className="font-medium text-gray-900">
                  Date of Birth:
                </span>{" "}
                {formatDate(new Date(userProfile?.date_of_birth || ""))}
              </div>
              <div>
                <span className="font-medium text-gray-900">Gender:</span>{" "}
                {userProfile?.gender}
              </div>
              <div>
                <span className="font-medium text-gray-900">Phone Number:</span>{" "}
                {userProfile?.phone_number}{" "}
                <span className="text-sm text-gray-500">(Optional)</span>
              </div>
              <div>
                <span className="font-medium text-gray-900">Occupation:</span>{" "}
                {userProfile?.occupation}{" "}
                <span className="text-sm text-gray-500">(Optional)</span>
              </div>
              <div>
                <span className="font-medium text-gray-900">
                  Marital Status:
                </span>{" "}
                {userProfile?.marital_status}
              </div>
            </div>
          </div>

          {/* Biography */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Biography</h2>
            <p className="text-gray-700 leading-relaxed">{userProfile?.bio}</p>
          </div>

          {/* Family Links */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Family Links</h2>
            <div className="space-y-3">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Parents:</h3>
                <div className="flex flex-wrap">
                  {profile.parents.map((member) => (
                    <FamilyMember key={member.name + "-parent"} {...member} />
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Siblings:</h3>
                <div className="flex flex-wrap">
                  {profile.siblings.map((member) => (
                    <FamilyMember key={member.name + "-sibling"} {...member} />
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Spouse:</h3>
                <div className="flex flex-wrap">
                  {profile.spouse.map((member) => (
                    <FamilyMember key={member.name + "-spouse"} {...member} />
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Children:</h3>
                <div className="flex flex-wrap">
                  {profile.children.map((member) => (
                    <FamilyMember key={member.name + "-child"} {...member} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Timeline / Life Events */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">
              Timeline / Life Events
            </h2>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              {profile.timeline.map((event, index) => (
                <li key={index}>{event}</li>
              ))}
            </ul>
          </div>

          {/* Gallery */}
          <div>
            <h2 className="text-xl font-semibold mb-2">Gallery</h2>
            <p className="text-gray-600 mb-4">Personal photos uploaded</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {userImages.map((imgSrc, index) => (
                <div
                  key={index}
                  className="aspect-square overflow-hidden rounded"
                >
                  <Image
                    src={imgSrc.url}
                    alt={`Gallery image ${index + 1}`}
                    width={200}
                    height={200}
                    className="object-cover w-full h-full"
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
