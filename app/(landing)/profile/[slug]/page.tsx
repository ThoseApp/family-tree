"use client";

import { fetchMemberProfile } from "@/lib/utils/family-tree-helpers";
import {
  ProcessedMember,
  UserProfile,
  LifeEvent,
  GalleryType,
} from "@/lib/types";
import { useEffect, useState } from "react";
import PageHeader from "@/components/page-header";
import { dummyProfileImage, dummyFemaleProfileImage } from "@/lib/constants";
import Image from "next/image";
import { Calendar as CalendarIcon } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";
import { GalleryStatusEnum } from "@/lib/constants/enums";

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

// Helper function to fetch user's life events
const fetchUserLifeEvents = async (uniqueId: string): Promise<LifeEvent[]> => {
  try {
    // Find user profile by family_tree_uid
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("user_id, timeline")
      .eq("family_tree_uid", uniqueId)
      .single();

    if (profileError || !profileData) {
      return [];
    }

    // Parse the timeline JSONB data
    const timelineData = profileData?.timeline || [];
    const events: LifeEvent[] = Array.isArray(timelineData)
      ? timelineData.map((event: any, index: number) => ({
          id: event.id || `event-${index}`,
          year: event.year || new Date().getFullYear().toString(),
          title: event.title || event.event || "",
          description: event.description || "",
          date: event.date || "",
          created_at: event.created_at || new Date().toISOString(),
          updated_at: event.updated_at || new Date().toISOString(),
        }))
      : [];

    return events;
  } catch (error) {
    console.error("Error fetching life events:", error);
    return [];
  }
};

// Helper function to fetch user's gallery
const fetchUserGallery = async (uniqueId: string): Promise<GalleryType[]> => {
  try {
    // Find user profile by family_tree_uid
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("family_tree_uid", uniqueId)
      .single();

    if (profileError || !profileData) {
      return [];
    }

    // Fetch approved gallery items for this user
    const { data: galleryData, error: galleryError } = await supabase
      .from("galleries")
      .select("*")
      .eq("user_id", profileData.user_id)
      .eq("status", GalleryStatusEnum.approved)
      .order("updated_at", { ascending: false });

    if (galleryError) {
      console.error("Error fetching gallery:", galleryError);
      return [];
    }

    return galleryData || [];
  } catch (error) {
    console.error("Error fetching gallery:", error);
    return [];
  }
};

const ProfilePage = ({ params }: ProfilePageProps) => {
  const [profile, setProfile] = useState<ProcessedMember | UserProfile | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lifeEvents, setLifeEvents] = useState<LifeEvent[]>([]);
  const [gallery, setGallery] = useState<GalleryType[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const memberProfile = await fetchMemberProfile(params.slug);
        if (memberProfile) {
          setProfile(memberProfile);

          // Fetch additional data (life events and gallery) if available
          setDataLoading(true);
          const [events, galleryData] = await Promise.all([
            fetchUserLifeEvents(params.slug),
            fetchUserGallery(params.slug),
          ]);

          setLifeEvents(events);
          setGallery(galleryData);
          setDataLoading(false);
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
    (profile.gender?.toLowerCase() === "female"
      ? dummyFemaleProfileImage
      : dummyProfileImage);

  console.log(profile);
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
            {profile.date_of_birth && (
              <InfoRow label="Date of Birth" value={profile.date_of_birth} />
            )}
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

        {/* Timeline / Life Events Section - Show if there are events OR if it's a detailed profile with account */}
        {(lifeEvents.length > 0 || (isDetailedProfile && !dataLoading)) && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold border-b pb-2 mb-4">
              Timeline / Life Events
            </h2>
            {dataLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <span className="ml-2">Loading life events...</span>
              </div>
            ) : lifeEvents.length > 0 ? (
              <div className="space-y-4">
                {lifeEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start p-4 border rounded-lg bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CalendarIcon className="size-4 text-gray-500" />
                        <span className="font-medium text-gray-900">
                          {event.year}
                        </span>
                        <span className="text-lg font-semibold text-gray-900">
                          {event.title}
                        </span>
                      </div>
                      {event.description && (
                        <p className="text-gray-600 text-sm ml-6">
                          {event.description}
                        </p>
                      )}
                      {event.date && (
                        <p className="text-gray-500 text-xs ml-6 mt-1">
                          Date: {formatDate(new Date(event.date))}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CalendarIcon className="size-12 mx-auto mb-2 text-gray-300" />
                <p>No life events have been added yet.</p>
              </div>
            )}
          </section>
        )}

        {/* Gallery Section - Show if there are images OR if it's a detailed profile with account */}
        {(gallery.length > 0 || (isDetailedProfile && !dataLoading)) && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold border-b pb-2 mb-4">
              Gallery
            </h2>
            {dataLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <span className="ml-2">Loading gallery...</span>
              </div>
            ) : gallery.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {gallery.map((imgSrc, index) => (
                  <div
                    key={imgSrc.id || index}
                    className="aspect-square overflow-hidden rounded-lg hover:opacity-90 transition-opacity"
                  >
                    <Image
                      src={imgSrc.url}
                      alt={
                        imgSrc.caption ||
                        imgSrc.file_name ||
                        `Gallery image ${index + 1}`
                      }
                      width={200}
                      height={200}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="size-12 mx-auto mb-2 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🖼️</span>
                </div>
                <p>No gallery images have been shared yet.</p>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
