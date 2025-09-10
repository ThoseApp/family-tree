"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  UserPlus,
  Upload,
  Calendar,
  Mail,
  Bell,
  User,
  Search,
  FileText,
  ImageIcon,
  Settings,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

const helpTopics = [
  {
    icon: UserPlus,
    title: "Adding New Members",
    description:
      "Navigate to Family Members section to add new family members to the tree. Fill in their details and relationship information.",
    color: "text-blue-600",
    href: "/family-members",
    requiresApproval: false,
  },
  {
    icon: Upload,
    title: "Uploading Pictures",
    description:
      "Go to Gallery section to upload family photos. Note: All uploads require admin approval before being published.",
    color: "text-green-600",
    href: "/dashboard/gallery",
    requiresApproval: true,
  },
  {
    icon: Calendar,
    title: "Creating Events",
    description:
      "Use the Events section to create family gatherings, birthdays, or important dates. Publisher users can submit events for approval.",
    color: "text-purple-600",
    href: "/dashboard/events",
    requiresApproval: false,
  },
  {
    icon: Mail,
    title: "Accepting Invitations",
    description:
      "Check your Invitations section for pending family member requests. Review and approve or reject as appropriate.",
    color: "text-orange-600",
    href: "/dashboard/invitations",
    requiresApproval: false,
  },
  {
    icon: Bell,
    title: "Adding Notices",
    description:
      "Post important announcements in the Notice Board. Publisher users can create notices that may require approval.",
    color: "text-red-600",
    href: "/dashboard/notice-board",
    requiresApproval: false,
  },
  {
    icon: FileText,
    title: "Notice Board",
    description:
      "View family announcements and important updates. Stay connected with the latest family news and events.",
    color: "text-indigo-600",
    href: "/dashboard/notice-board",
    requiresApproval: false,
  },
  {
    icon: ImageIcon,
    title: "Gallery",
    description:
      "Browse and view family photos and albums. Upload your own photos to share with the family.",
    color: "text-teal-600",
    href: "/dashboard/gallery",
    requiresApproval: false,
  },
  {
    icon: User,
    title: "Profile Management",
    description:
      "Access your Profile section to update personal information, change password, or modify account settings.",
    color: "text-pink-600",
    href: "/dashboard/profile",
    requiresApproval: false,
  },
  {
    icon: Settings,
    title: "Settings",
    description:
      "Manage your account preferences, notification settings, and privacy options.",
    color: "text-cyan-600",
    href: "/dashboard/settings",
    requiresApproval: false,
  },
  {
    icon: Search,
    title: "Global Search",
    description:
      "Use the search bar at the top to quickly find family members, events, or content across all sections.",
    color: "text-yellow-600",
    href: "/dashboard",
    requiresApproval: false,
  },
];

export default function DashboardHelpPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Help & Tips
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Welcome to your family tree dashboard! Here you&apos;ll find helpful
            guides and tips to make the most of your family tree experience.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {helpTopics.map((topic, index) => (
          <Card
            key={index}
            className="hover:shadow-lg transition-shadow duration-200"
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <topic.icon className={`h-6 w-6 ${topic.color}`} />
                <CardTitle className="text-lg">{topic.title}</CardTitle>
              </div>
              {topic.requiresApproval && (
                <Badge variant="outline" className="w-fit">
                  Requires Approval
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm mb-4">
                {topic.description}
              </CardDescription>
              <Link href={topic.href}>
                <Button variant="outline" size="sm" className="w-full">
                  Go to Section
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 p-6 bg-muted/50 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="font-medium mb-2">📸 Sharing Memories</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Upload family photos</li>
              <li>• Create photo albums</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h2 className="text-xl font-semibold mb-3 text-blue-900 dark:text-blue-100">
          💡 Pro Tips
        </h2>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
          <li>
            • <strong>Keep your profile updated</strong> - This helps other
            family members find and connect with you
          </li>
          <li>
            • <strong>Upload high-quality photos</strong> - Good quality images
            make the family tree more engaging
          </li>
          <li>
            • <strong>Check notifications regularly</strong> - Stay updated on
            family activities and requests
          </li>
          <li>
            • <strong>Use the search feature</strong> - Quickly find family
            members, events, or specific content
          </li>
          <li>
            • <strong>Be patient with approvals</strong> - Some content may need
            admin review before being published
          </li>
        </ul>
      </div>

      <div className="mt-8 text-center">
        <p className="text-muted-foreground">
          Need more help? Contact your family admin or check the notice board
          for announcements.
        </p>
      </div>
    </div>
  );
}
