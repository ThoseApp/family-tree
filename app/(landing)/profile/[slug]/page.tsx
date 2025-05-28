"use client";

import { GalleryType } from "@/components/gallery";
import PageHeader from "@/components/page-header";
import { dummyProfileImage } from "@/lib/constants";
import Image from "next/image";

// Placeholder data - replace with actual data fetching logic
const profileData = {
  name: "John Smith",
  imageUrl: dummyProfileImage, // Replace with a real image path or use a placeholder service
  dob: "December 3, 1960",
  gender: "Male",
  contactInfo: {
    phone: "1234-567-8900",
    email: "contactmenu@yahoo.com",
  },
  occupation: "Neurosurgeon",
  maritalStatus: "Married",
  biography: `Lorem ipsum dolor sit amet, conscettetutur adipiscing elit. Maecenas congue srcu quis turpis is tintinduct, ur feugat sapien vairus. Lorem ipsum dolor sit amet, conscettetutur adipiscing elit. Maecenas congue srcu quis turpis is tintinduct, ur feugat sapien vairus. Lorem ipsum dolor sit amet, conscettetutur adipiscing elit. Maecenas congue srcu quis turpis is tintinduct, ur feugat sapien vairus. Lorem ipsum dolor sit amet, conscettetutur adipiscing elit. Maecenas congue srcu quis turpis is tintinduct, ur feugat sapien vairus. Lorem ipsum dolor sit amet, conscettetutur adipiscing elit. Maecenas congue srcu quis turpis is tintinduct, ur feugat sapien vairus.`,
  familyLinks: {
    parents: [
      { name: "Robert Smith", imageUrl: dummyProfileImage },
      { name: "Margaret Smith", imageUrl: dummyProfileImage },
    ],
    siblings: [
      { name: "Robert Smith", imageUrl: dummyProfileImage },
      { name: "Margaret Smith", imageUrl: dummyProfileImage },
      { name: "Margaret Smith", imageUrl: dummyProfileImage },
    ],
    spouse: [{ name: "Margaret Smith", imageUrl: dummyProfileImage }],
    children: [
      { name: "Angela Smith", imageUrl: dummyProfileImage },
      { name: "Robertto Smith", imageUrl: dummyProfileImage },
      { name: "Robert Smith", imageUrl: dummyProfileImage },
    ],
  },
  lifeEvents: [
    { year: 1990, event: "Graduated" },
    { year: 2000, event: "Married" },
  ],
  gallery: [
    { imageUrl: dummyProfileImage, date: "03 Dec 2015" },
    { imageUrl: dummyProfileImage, date: "03 Dec 2015" },
    { imageUrl: dummyProfileImage, date: "03 Dec 2015" },
    { imageUrl: dummyProfileImage, date: "03 Dec 2015" },
  ],
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

// Helper component for Family Links
const FamilyMemberLink = ({
  name,
  imageUrl,
}: {
  name: string;
  imageUrl: string;
}) => (
  <div className="flex items-center space-x-2">
    <div className="size-10 relative rounded-full overflow-hidden">
      <Image
        src={imageUrl}
        alt={name}
        fill
        className="rounded-full object-cover"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.onerror = null;
          target.src = dummyProfileImage;
        }}
      />
    </div>
    <span className="text-sm font-medium text-gray-800">{name}</span>
  </div>
);

export default function ProfilePage({ params }: { params: { slug: string } }) {
  // TODO: Fetch data based on params.slug

  return (
    <div className="pb-20">
      {/* HEADER SECTION */}
      <PageHeader title="Profile" />
      {/* Header Section */}
      <div className="relative mb-8">
        {/* Brown Background */}
        <div className="h-52 w-full bg-gradient-to-r from-[#3F2518] to-[#795F52] rounded-lg"></div>
        {/* Profile Image & Name Container */}
        <div className="absolute left-8 top-20 flex items-end space-x-4">
          {/* Profile Image */}
          <div className="size-56 relative rounded-md border-4 border-white overflow-hidden">
            <Image
              src={profileData.imageUrl}
              alt={`${profileData.name}'s profile`}
              fill
              className="object-cover"
              // Add a placeholder image or ensure the path exists
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null; // prevent looping
                target.src = dummyProfileImage; // Fallback placeholder
              }}
            />
          </div>
          {/* Name */}
          <h1 className="text-3xl font-bold pb-2">{profileData.name}</h1>
        </div>
      </div>

      {/* Padding to clear the absolute positioned elements */}
      <div className="pt-24 px-8">
        {/* Basic Information Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold border-b pb-2 mb-4">
            Basic Information
          </h2>
          <dl>
            <InfoRow label="Full Name" value={profileData.name} />
            <InfoRow label="Date of Birth" value={profileData.dob} />
            <InfoRow label="Gender" value={profileData.gender} />
            <InfoRow
              label="Contact Info"
              value={`${profileData.contactInfo.phone}, ${profileData.contactInfo.email}`}
              optional
            />
            <InfoRow
              label="Occupation"
              value={profileData.occupation}
              optional
            />
            <InfoRow label="Marital Status" value={profileData.maritalStatus} />
          </dl>
        </section>

        {/* Biography Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold border-b pb-2 mb-4">
            Biography
          </h2>
          <p className="text-gray-700 leading-relaxed">
            {profileData.biography}
          </p>
        </section>

        {/* Family Links Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold border-b pb-2 mb-4">
            Family Links
          </h2>
          <div className="grid grid-cols-3 gap-x-4 gap-y-3">
            <dt className="font-medium text-gray-600">Parents</dt>
            <dd className="col-span-2 flex flex-wrap gap-4">
              {profileData.familyLinks.parents.map((person, index) => (
                <FamilyMemberLink key={`parent-${index}`} {...person} />
              ))}
            </dd>

            <dt className="font-medium text-gray-600">Siblings</dt>
            <dd className="col-span-2 flex flex-wrap gap-4">
              {profileData.familyLinks.siblings.map((person, index) => (
                <FamilyMemberLink key={`sibling-${index}`} {...person} />
              ))}
            </dd>

            <dt className="font-medium text-gray-600">Spouse</dt>
            <dd className="col-span-2 flex flex-wrap gap-4">
              {profileData.familyLinks.spouse.map((person, index) => (
                <FamilyMemberLink key={`spouse-${index}`} {...person} />
              ))}
            </dd>

            <dt className="font-medium text-gray-600">Children</dt>
            <dd className="col-span-2 flex flex-wrap gap-4">
              {profileData.familyLinks.children.map((person, index) => (
                <FamilyMemberLink key={`child-${index}`} {...person} />
              ))}
            </dd>
          </div>
        </section>

        {/* Timeline / Life Events Section */}
        <section className="mb-8 relative">
          <h2 className="text-xl font-semibold border-b pb-2 mb-4">
            Timeline / Life Events
          </h2>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            {profileData.lifeEvents.map((item, index) => (
              <li key={`event-${index}`}>
                {item.event} in {item.year}
              </li>
            ))}
          </ul>
        </section>

        {/* Gallery Section */}
        <section className="mb-8">
          <div className="flex justify-between items-center border-b pb-2 mb-4">
            <div>
              <h2 className="text-xl font-semibold ">Gallery</h2>
              <p className="text-sm text-gray-500">
                Personal photos uploaded by this user
              </p>
            </div>
            <a href="#" className="text-sm text-blue-600 hover:underline">
              View All →
            </a>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {profileData.gallery.map((photo, index) => (
              <GalleryType
                key={index}
                url={photo.imageUrl}
                date={photo.date}
                title={`Gallery image ${index + 1}`}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
