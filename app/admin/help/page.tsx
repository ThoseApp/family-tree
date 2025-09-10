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
  Shield,
  Users,
  ImageIcon,
  FileText,
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
    href: "/admin/family-members",
    adminOnly: false,
  },
  {
    icon: Users,
    title: "Managing Member Requests",
    description:
      "Review and approve family member requests from users. Check the Member Requests section for pending approvals.",
    color: "text-green-600",
    href: "/admin/member-requests",
    adminOnly: true,
  },
  {
    icon: Upload,
    title: "Managing Gallery Uploads",
    description:
      "Review and approve photo uploads in the Gallery Requests section. All uploads require admin approval before being published.",
    color: "text-purple-600",
    href: "/admin/gallery-requests",
    adminOnly: true,
  },
  {
    icon: FileText,
    title: "Managing Notice Board",
    description:
      "Review notice board requests and manage published notices. Publisher users can submit notices for your approval.",
    color: "text-orange-600",
    href: "/admin/notice-board-requests",
    adminOnly: true,
  },
  {
    icon: Shield,
    title: "Publisher Management",
    description:
      "Manage publisher accounts and permissions. Assign users to the publisher role for content creation capabilities.",
    color: "text-red-600",
    href: "/admin/publisher-management",
    adminOnly: true,
  },
  {
    icon: Users,
    title: "User Account Management",
    description:
      "View and manage all user accounts, roles, and permissions across the family tree application.",
    color: "text-indigo-600",
    href: "/admin/user-accounts",
    adminOnly: true,
  },
  {
    icon: Calendar,
    title: "Managing Events",
    description:
      "Approve or reject event requests from publishers. Manage all family events and gatherings.",
    color: "text-teal-600",
    href: "/admin/events",
    adminOnly: true,
  },
  {
    icon: ImageIcon,
    title: "Gallery Management",
    description:
      "View and manage all family photos and albums. Remove inappropriate content if necessary.",
    color: "text-cyan-600",
    href: "/admin/gallery",
    adminOnly: true,
  },
  {
    icon: User,
    title: "Profile & Settings",
    description:
      "Access your Profile section to update personal information, change password, or modify account settings.",
    color: "text-pink-600",
    href: "/admin/profile",
    adminOnly: false,
  },
  {
    icon: Search,
    title: "Global Search",
    description:
      "Use the search bar at the top to quickly find family members, events, or content across all sections.",
    color: "text-yellow-600",
    href: "/admin",
    adminOnly: false,
  },
];

export default function AdminHelpPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/admin">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Admin Help Center
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive guide to help you manage your family tree application
            effectively. Find answers to common tasks and learn how to use all
            admin features.
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
              {topic.adminOnly && (
                <Badge variant="secondary" className="w-fit">
                  Admin Only
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
        <h2 className="text-2xl font-semibold mb-4">Quick Tips for Admins</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="font-medium mb-2">🔐 Security & Permissions</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Regularly review user account permissions</li>
              <li>• Approve content before it goes live</li>
              <li>• Monitor gallery uploads for appropriateness</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-muted-foreground">
          Need more help? Contact the development team or check the
          documentation.
        </p>
      </div>
    </div>
  );
}
