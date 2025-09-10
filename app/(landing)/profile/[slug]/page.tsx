"use client";

import { fetchMemberProfile } from "@/lib/utils/family-tree-helpers";
import { ProcessedMember, UserProfile } from "@/lib/types";
import { useEffect, useState } from "react";
import PageHeader from "@/components/page-header";
import { dummyProfileImage } from "@/lib/constants";
import Image from "next/image";
import { GalleryType } from "@/components/gallery";

type ProfilePageProps = {
  params: { slug: string };
};

// Helper component for info rows
const InfoRow = ({
  label,
  value,
  optional = false,
}: {
  label: string;
  value: string | undefined | null;
  optional?: boolean;
}) => (
  <div className="grid grid-cols-3 gap-4 py-1">
    <dt className="font-medium text-gray-600">{label}</dt>
    <dd className="col-span-2 text-gray-800">
      {value}
      {optional && (
        <span className="ml-2 text-sm text-gray-500">(Optional)</span>
      )}
    </dd>
  </div>
);

const ProfilePage = ({ params }: ProfilePageProps) => {
  const [profile, setProfile] = useState<ProcessedMember | UserProfile | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const memberProfile = await fetchMemberProfile(params.slug);
        if (memberProfile) {
          setProfile(memberProfile);
        } else {
          setError("Profile not found.");
        }
      } catch (e) {
        setError("Failed to fetch profile data.");
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    if (params.slug) {
      loadProfile();
    }
  }, [params.slug]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>No profile data available.</p>
      </div>
    );
  }

  const isDetailedProfile = "user_id" in profile;
  const name =
    "first_name" in profile
      ? `${profile.first_name} ${profile.last_name}`
      : "Unknown";
  const imageUrl =
    ("picture_link" in profile && profile.picture_link) ||
    ("image" in profile && profile.image) ||
    dummyProfileImage;

  return (
    <div className="pb-20">
      <PageHeader title="Profile" />
      <div className="relative mb-8">
        <div className="h-52 w-full bg-gradient-to-r from-[#3F2518] to-[#795F52] rounded-lg"></div>
        <div className="absolute left-8 top-20 flex items-end space-x-4">
          <div className="size-56 relative rounded-md border-4 border-white overflow-hidden">
            <Image
              src={imageUrl}
              alt={`${name}'s profile`}
              fill
              className="object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = dummyProfileImage;
              }}
            />
          </div>
          <h1 className="text-3xl font-bold pb-2">{name}</h1>
        </div>
      </div>

      <div className="pt-24 px-8">
        <section className="mb-8">
          <h2 className="text-xl font-semibold border-b pb-2 mb-4">
            Basic Information
          </h2>
          <dl>
            <InfoRow label="Full Name" value={name} />
            <InfoRow label="Date of Birth" value={profile.date_of_birth} />
            <InfoRow label="Gender" value={profile.gender} />
            {isDetailedProfile && (profile as UserProfile).phone_number && (
              <InfoRow
                label="Contact Info"
                value={`${(profile as UserProfile).phone_number}, ${
                  (profile as UserProfile).email
                }`}
                optional
              />
            )}
            {isDetailedProfile && (profile as UserProfile).occupation && (
              <InfoRow
                label="Occupation"
                value={(profile as UserProfile).occupation}
                optional
              />
            )}
            <InfoRow label="Marital Status" value={profile.marital_status} />
          </dl>
        </section>

        {isDetailedProfile && (profile as UserProfile).bio && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold border-b pb-2 mb-4">
              Biography
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {(profile as UserProfile).bio}
            </p>
          </section>
        )}

        {/* The following sections are placeholders and need to be implemented */}
        {/* with actual data from the profile object when available.       */}
      </div>
    </div>
  );
};

export default ProfilePage;
