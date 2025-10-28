/**
 * Metadata constants for the Family Tree application
 * Provides consistent metadata across all pages
 */

export const DEFAULT_METADATA = {
  title: " Family Tree - Connecting Generations",
  description:
    "Explore the rich heritage of the  family. Discover our family tree, share memories, view photo galleries, and stay connected with upcoming events and announcements.",
  keywords: [
    "family tree",
    " family",
    "genealogy",
    "family history",
    "family photos",
    "family events",
    "family connections",
    "heritage",
    "ancestry",
    "family legacy",
  ],
  author: " Family",
  siteName: " Family Tree",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://mosuro.com.ng",
  ogImage: "/images/og-image.png",
  twitterCard: "summary_large_image" as const,
};

export const PAGE_METADATA = {
  // Landing Pages
  home: {
    title: " Family Tree - Welcome Home",
    description:
      "Welcome to the  family tree. Discover our rich heritage, explore family connections, and stay updated with family events and announcements.",
    keywords: [...DEFAULT_METADATA.keywords, "family home", "welcome"],
  },

  familyTree: {
    title: "Family Tree -  Family Legacy",
    description:
      "Explore the complete  family tree. Trace our lineage, discover family connections, and learn about our ancestors and their stories.",
    keywords: [
      ...DEFAULT_METADATA.keywords,
      "family lineage",
      "ancestors",
      "family connections",
    ],
  },

  familyMembers: {
    title: "Family Members - Meet the  Family",
    description:
      "Meet all members of the  family. Browse profiles, learn about family members, and discover the people who make our family special.",
    keywords: [
      ...DEFAULT_METADATA.keywords,
      "family members",
      "family profiles",
      "meet the family",
    ],
  },

  events: {
    title: "Family Events -  Family Gatherings",
    description:
      "Stay updated with upcoming  family events, reunions, celebrations, and special occasions. Never miss a family gathering.",
    keywords: [
      ...DEFAULT_METADATA.keywords,
      "family events",
      "reunions",
      "celebrations",
      "gatherings",
    ],
  },

  gallery: {
    title: "Photo Gallery -  Family Memories",
    description:
      "Browse through cherished  family photos and memories. Relive special moments and discover family history through pictures.",
    keywords: [
      ...DEFAULT_METADATA.keywords,
      "family photos",
      "memories",
      "photo gallery",
      "family pictures",
    ],
  },

  history: {
    title: "Family History -  Heritage & Stories",
    description:
      "Discover the rich history and heritage of the  family. Read stories, learn about our origins, and explore our family's journey through time.",
    keywords: [
      ...DEFAULT_METADATA.keywords,
      "family stories",
      "heritage",
      "family origins",
      "history",
    ],
  },

  noticeBoard: {
    title: "Notice Board -  Family Announcements",
    description:
      "Stay informed with the latest  family announcements, news, and important updates. Your central hub for family communications.",
    keywords: [
      ...DEFAULT_METADATA.keywords,
      "announcements",
      "family news",
      "updates",
      "communications",
    ],
  },

  // Dashboard Pages
  dashboard: {
    title: "Dashboard -  Family Portal",
    description:
      "Your personal  family dashboard. Access family information, upcoming events, recent updates, and manage your family connections.",
    keywords: [
      ...DEFAULT_METADATA.keywords,
      "dashboard",
      "family portal",
      "personal hub",
    ],
  },

  // Admin Pages
  adminDashboard: {
    title: "Admin Dashboard -  Family Management",
    description:
      "Administrative dashboard for managing the  family tree application. Handle member requests, content moderation, and system administration.",
    keywords: [
      ...DEFAULT_METADATA.keywords,
      "admin",
      "management",
      "administration",
    ],
  },

  // Publisher Pages
  publisherDashboard: {
    title: "Publisher Dashboard - Content Management",
    description:
      "Publisher dashboard for managing  family content. Create and moderate notice board posts, manage photo galleries, and publish family updates.",
    keywords: [
      ...DEFAULT_METADATA.keywords,
      "publisher",
      "content management",
      "moderation",
    ],
  },

  // Auth Pages
  signIn: {
    title: "Sign In -  Family Tree",
    description:
      "Sign in to access your  family account. Connect with family members, view exclusive content, and participate in family activities.",
    keywords: [
      ...DEFAULT_METADATA.keywords,
      "sign in",
      "login",
      "account access",
    ],
  },

  signUp: {
    title: "Join the Family -  Family Tree Registration",
    description:
      "Join the  family tree community. Create your account to connect with family members and access exclusive family content.",
    keywords: [
      ...DEFAULT_METADATA.keywords,
      "sign up",
      "registration",
      "join family",
    ],
  },

  // Profile Pages
  profile: {
    title: "Family Profile -  Family Member",
    description:
      "View detailed family member profile information, including personal details, family connections, and shared memories.",
    keywords: [
      ...DEFAULT_METADATA.keywords,
      "profile",
      "family member",
      "personal information",
    ],
  },

  // Help Pages
  help: {
    title: "Help & Support -  Family Tree",
    description:
      "Get help and support for using the  family tree application. Find answers to common questions and contact support.",
    keywords: [
      ...DEFAULT_METADATA.keywords,
      "help",
      "support",
      "FAQ",
      "assistance",
    ],
  },

  // Settings Pages
  settings: {
    title: "Settings -  Family Tree",
    description:
      "Manage your  family tree account settings, preferences, and privacy options.",
    keywords: [
      ...DEFAULT_METADATA.keywords,
      "settings",
      "preferences",
      "account management",
    ],
  },

  // Timeline Pages
  timeline: {
    title: "Family Timeline -  Family Journey",
    description:
      "Explore the  family timeline. Discover important milestones, events, and moments that shaped our family history.",
    keywords: [
      ...DEFAULT_METADATA.keywords,
      "timeline",
      "milestones",
      "family journey",
    ],
  },

  // Invitations Pages
  invitations: {
    title: "Family Invitations -  Family Events",
    description:
      "View and manage your  family event invitations. RSVP to family gatherings and special occasions.",
    keywords: [
      ...DEFAULT_METADATA.keywords,
      "invitations",
      "RSVP",
      "event invitations",
    ],
  },

  // Notifications Pages
  notifications: {
    title: "Notifications -  Family Updates",
    description:
      "Stay updated with your  family notifications. View recent activity, announcements, and important family updates.",
    keywords: [
      ...DEFAULT_METADATA.keywords,
      "notifications",
      "updates",
      "activity",
    ],
  },
};

/**
 * Generate metadata for a specific page
 */
export function generatePageMetadata(
  pageKey: keyof typeof PAGE_METADATA,
  customData?: {
    title?: string;
    description?: string;
    keywords?: string[];
    ogImage?: string;
  }
) {
  const pageData = PAGE_METADATA[pageKey];
  const baseUrl = DEFAULT_METADATA.siteUrl;

  return {
    title: customData?.title || pageData.title,
    description: customData?.description || pageData.description,
    keywords: customData?.keywords || pageData.keywords,
    authors: [{ name: DEFAULT_METADATA.author }],
    creator: DEFAULT_METADATA.author,
    publisher: DEFAULT_METADATA.author,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: baseUrl,
    },
    openGraph: {
      title: customData?.title || pageData.title,
      description: customData?.description || pageData.description,
      url: baseUrl,
      siteName: DEFAULT_METADATA.siteName,
      images: [
        {
          url: customData?.ogImage || DEFAULT_METADATA.ogImage,
          width: 1200,
          height: 630,
          alt: pageData.title,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: DEFAULT_METADATA.twitterCard,
      title: customData?.title || pageData.title,
      description: customData?.description || pageData.description,
      images: [customData?.ogImage || DEFAULT_METADATA.ogImage],
      creator: "@mosuro_family",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large" as const,
        "max-snippet": -1,
      },
    },
    verification: {
      google: process.env.GOOGLE_VERIFICATION_ID,
      yandex: process.env.YANDEX_VERIFICATION_ID,
      yahoo: process.env.YAHOO_VERIFICATION_ID,
    },
  };
}

/**
 * Generate dynamic metadata for profile pages
 */
export function generateProfileMetadata(
  memberName: string,
  memberDescription?: string
) {
  return generatePageMetadata("profile", {
    title: `${memberName} -  Family Member Profile`,
    description:
      memberDescription ||
      `View ${memberName}'s profile in the  family tree. Learn about their family connections, shared memories, and personal information.`,
    keywords: [
      ...DEFAULT_METADATA.keywords,
      memberName,
      "family member profile",
    ],
  });
}

/**
 * Generate dynamic metadata for event pages
 */
export function generateEventMetadata(
  eventName: string,
  eventDescription?: string
) {
  return generatePageMetadata("events", {
    title: `${eventName} -  Family Event`,
    description:
      eventDescription ||
      `Join us for ${eventName}, a special  family gathering. Get event details, RSVP, and connect with family members.`,
    keywords: [...DEFAULT_METADATA.keywords, eventName, "family event"],
  });
}
