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
  Upload,
  Calendar,
  Bell,
  FileText,
  ImageIcon,
  Settings,
  User,
  Search,
  Clock,
  CheckCircle,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

const helpTopics = [
  {
    icon: FileText,
    title: "Notice Board Management",
    description:
      "Create and manage family announcements. Post important updates that may require admin approval.",
    color: "text-blue-600",
    href: "/publisher/notice-board",
    requiresApproval: true,
  },
  {
    icon: Clock,
    title: "Notice Board Requests",
    description:
      "View pending notice board requests from regular users. Help manage content before admin approval.",
    color: "text-green-600",
    href: "/publisher/notice-board-requests",
    requiresApproval: false,
  },
  {
    icon: Calendar,
    title: "Event Creation",
    description:
      "Create family events, gatherings, and important dates. Events may need admin approval before publishing.",
    color: "text-purple-600",
    href: "/publisher/events",
    requiresApproval: true,
  },
  {
    icon: CheckCircle,
    title: "Event Requests",
    description:
      "Review and manage event requests from family members. Help organize family gatherings and celebrations.",
    color: "text-orange-600",
    href: "/publisher/event-requests",
    requiresApproval: false,
  },
  {
    icon: Upload,
    title: "Gallery Management",
    description:
      "Upload and manage family photos. Your uploads may require admin approval before being published.",
    color: "text-red-600",
    href: "/publisher/gallery",
    requiresApproval: true,
  },
  {
    icon: Bell,
    title: "Content Approval Workflow",
    description:
      "Understand the approval process for notices, events, and photos. Track the status of your submissions.",
    color: "text-indigo-600",
    href: "/publisher/notice-board-requests",
    requiresApproval: false,
  },
  {
    icon: ImageIcon,
    title: "Photo Guidelines",
    description:
      "Learn best practices for uploading family photos. Ensure content is appropriate and high quality.",
    color: "text-teal-600",
    href: "/publisher/gallery",
    requiresApproval: false,
  },
  {
    icon: User,
    title: "Profile Management",
    description:
      "Access your Profile section to update personal information, change password, or modify account settings.",
    color: "text-pink-600",
    href: "/publisher/profile",
    requiresApproval: false,
  },
  {
    icon: Settings,
    title: "Settings",
    description:
      "Manage your account preferences, notification settings, and privacy options.",
    color: "text-cyan-600",
    href: "/publisher/settings",
    requiresApproval: false,
  },
  {
    icon: Search,
    title: "Global Search",
    description:
      "Use the search bar at the top to quickly find family members, events, or content across all sections.",
    color: "text-yellow-600",
    href: "/publisher",
    requiresApproval: false,
  },
];

export default function PublisherHelpPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/publisher">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Publisher Help Center
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            As a publisher, you have special permissions to create content and
            manage requests. Learn how to make the most of your publisher role.
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
                  Learn More
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 p-6 bg-muted/50 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">
          Publisher Responsibilities
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="font-medium mb-2">📝 Content Creation</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Create engaging family announcements</li>
              <li>• Organize family events and gatherings</li>
              <li>• Share family photos and memories</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">🔄 Request Management</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Review user-submitted requests</li>
              <li>• Help prepare content for admin approval</li>
              <li>• Maintain quality family content</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8 p-6 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
        <h2 className="text-xl font-semibold mb-3 text-amber-900 dark:text-amber-100">
          ⚠️ Important Notes
        </h2>
        <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-2">
          <li>
            • <strong>Content Approval Required</strong> - Most content you
            create needs admin approval before publishing
          </li>
          <li>
            • <strong>Quality Guidelines</strong> - Ensure all content is
            appropriate and follows family guidelines
          </li>
          <li>
            • <strong>Response Time</strong> - Try to review user requests
            within 24-48 hours
          </li>
          <li>
            • <strong>Privacy Consideration</strong> - Be mindful of family
            privacy when sharing photos and information
          </li>
          <li>
            • <strong>Communication</strong> - Keep family members informed
            about approval processes
          </li>
        </ul>
      </div>

      <div className="mt-8 p-6 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
        <h2 className="text-xl font-semibold mb-3 text-green-900 dark:text-green-100">
          🚀 Publisher Best Practices
        </h2>
        <ul className="text-sm text-green-800 dark:text-green-200 space-y-2">
          <li>
            • <strong>Regular Updates</strong> - Keep the notice board current
            with family news
          </li>
          <li>
            • <strong>Event Planning</strong> - Help organize family gatherings
            and celebrations
          </li>
          <li>
            • <strong>Photo Curation</strong> - Select and upload high-quality
            family photos
          </li>
          <li>
            • <strong>Community Building</strong> - Encourage family
            participation and engagement
          </li>
          <li>
            • <strong>Quality Control</strong> - Review content for
            appropriateness before submission
          </li>
        </ul>
      </div>

      <div className="mt-8 text-center">
        <p className="text-muted-foreground">
          Need more help? Contact your admin or check the admin help center for
          additional guidance.
        </p>
      </div>
    </div>
  );
}
