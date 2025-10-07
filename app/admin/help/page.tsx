"use client";

import { useState } from "react";
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
  HelpCircle,
  Crown,
} from "lucide-react";
import Link from "next/link";
import {
  HelpDetailsModal,
  getHelpTopicsByUserType,
  getHelpTopicById,
  type HelpTopic,
} from "@/components/modals/help-details-modal";

const helpTopics = [
  {
    id: "adding-new-members",
    icon: UserPlus,
    title: "Adding New Members",
    description:
      "Navigate to Family Members section to add new family members to the tree. Fill in their details and relationship information.",
    color: "text-blue-600",
    href: "/admin/family-members",
    adminOnly: false,
  },
  {
    id: "managing-family-member-requests",
    icon: Users,
    title: "Managing Member Requests",
    description:
      "Review and approve family member requests from users. Check the Member Requests section for pending approvals.",
    color: "text-green-600",
    href: "/admin/member-requests",
    adminOnly: true,
  },
  {
    id: "managing-gallery-uploads",
    icon: Upload,
    title: "Managing Gallery Uploads",
    description:
      "Review and approve photo uploads in the Gallery Requests section. All uploads require admin approval before being published.",
    color: "text-purple-600",
    href: "/admin/gallery-requests",
    adminOnly: true,
  },
  {
    id: "managing-notice-board",
    icon: FileText,
    title: "Managing Notice Board",
    description:
      "Review notice board requests and manage published notices. Publisher users can submit notices for your approval.",
    color: "text-orange-600",
    href: "/admin/notice-board-requests",
    adminOnly: true,
  },
  {
    id: "admin-management",
    icon: Crown,
    title: "Admin Management",
    description:
      "Manage administrator accounts and permissions. Promote users to admin role for full system access or demote admins to regular users.",
    color: "text-purple-600",
    href: "/admin/admin-management",
    adminOnly: true,
  },
  {
    id: "publisher-management",
    icon: Shield,
    title: "Publisher Management",
    description:
      "Manage publisher accounts and permissions. Assign users to the publisher role for content creation capabilities.",
    color: "text-red-600",
    href: "/admin/publisher-management",
    adminOnly: true,
  },
  {
    id: "user-account-management",
    icon: Users,
    title: "User Account Management",
    description:
      "View and manage all user accounts, roles, and permissions across the family tree application.",
    color: "text-indigo-600",
    href: "/admin/user-accounts",
    adminOnly: true,
  },
  {
    id: "gallery-management",
    icon: ImageIcon,
    title: "Gallery Management",
    description:
      "View and manage all family photos and albums. Remove inappropriate content if necessary.",
    color: "text-cyan-600",
    href: "/admin/gallery",
    adminOnly: true,
  },
  {
    id: "profile-settings",
    icon: User,
    title: "Profile & Settings",
    description:
      "Access your Profile section to update personal information, change password, or modify account settings.",
    color: "text-pink-600",
    href: "/admin/profile",
    adminOnly: false,
  },
  {
    id: "global-search",
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
  const [selectedTopic, setSelectedTopic] = useState<HelpTopic | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleTopicClick = (topicId: string) => {
    const topic = getHelpTopicById(topicId);
    if (topic) {
      setSelectedTopic(topic);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTopic(null);
  };

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
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleTopicClick(topic.id)}
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  View Guide
                </Button>
                <Link href={topic.href}>
                  <Button variant="secondary" size="sm">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
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

      <HelpDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        topic={selectedTopic}
      />
    </div>
  );
}
