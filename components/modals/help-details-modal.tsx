"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ExternalLink,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Search,
  Settings,
  UserPlus,
  Upload,
  Calendar,
  FileText,
  Shield,
  ImageIcon,
  User,
} from "lucide-react";
import Link from "next/link";

export interface HelpStep {
  stepNumber: number;
  title: string;
  description: string;
  subSteps?: {
    label: string;
    description: string;
  }[];
}

export interface HelpTopic {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  userType: "user" | "publisher" | "admin";
  requiresApproval?: boolean;
  steps: HelpStep[];
  actionButtons: {
    label: string;
    href: string;
    variant?: "default" | "outline" | "secondary";
  }[];
  tips?: string[];
  warnings?: string[];
}

interface HelpDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: HelpTopic | null;
}

export function HelpDetailsModal({
  isOpen,
  onClose,
  topic,
}: HelpDetailsModalProps) {
  if (!topic) return null;

  const IconComponent = topic.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <IconComponent className={`h-6 w-6 ${topic.color}`} />
            <DialogTitle className="text-xl">{topic.title}</DialogTitle>
            {topic.requiresApproval && (
              <Badge variant="outline" className="ml-auto">
                <Clock className="h-3 w-3 mr-1" />
                Requires Approval
              </Badge>
            )}
          </div>
          <DialogDescription className="text-sm">
            {topic.description}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Steps Section */}
            <div>
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Step-by-Step Instructions
              </h3>
              <div className="space-y-4">
                {topic.steps.map((step, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 bg-muted/30"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                        {step.stepNumber}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium mb-1">{step.title}</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          {step.description}
                        </p>
                        {step.subSteps && step.subSteps.length > 0 && (
                          <div className="space-y-2">
                            {step.subSteps.map((subStep, subIndex) => (
                              <div
                                key={subIndex}
                                className="flex items-start gap-2 text-sm"
                              >
                                <div className="flex-shrink-0 w-5 h-5 bg-secondary text-secondary-foreground rounded text-xs flex items-center justify-center mt-0.5">
                                  {String.fromCharCode(65 + subIndex)}
                                </div>
                                <div>
                                  <span className="font-medium">
                                    {subStep.label}:
                                  </span>
                                  <span className="text-muted-foreground ml-1">
                                    {subStep.description}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips Section */}
            {topic.tips && topic.tips.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-blue-600">
                    💡 Helpful Tips
                  </h3>
                  <ul className="space-y-2">
                    {topic.tips.map((tip, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm"
                      >
                        <ChevronRight className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {/* Warnings Section */}
            {topic.warnings && topic.warnings.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-amber-600">
                    <AlertCircle className="h-5 w-5" />
                    Important Notes
                  </h3>
                  <ul className="space-y-2">
                    {topic.warnings.map((warning, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm"
                      >
                        <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span>{warning}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        {/* Action Buttons */}
        <div className="border-t pt-4 mt-6">
          <div className="flex flex-wrap gap-2">
            {topic.actionButtons.map((button, index) => (
              <Link key={index} href={button.href}>
                <Button
                  variant={button.variant || "default"}
                  size="sm"
                  onClick={onClose}
                >
                  {button.label}
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="ml-auto"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Help Topics Data
export const helpTopicsData: HelpTopic[] = [
  // REGULAR USERS
  {
    id: "adding-new-members",
    title: "Adding New Members",
    description:
      "Learn how to add new family members to the family tree with proper relationship information.",
    icon: UserPlus,
    color: "text-blue-600",
    userType: "user",
    requiresApproval: true,
    steps: [
      {
        stepNumber: 1,
        title: "Navigate to Family Members",
        description:
          "Access the family members section from the menu on the homepage or in your personal space.",
      },
      {
        stepNumber: 2,
        title: "Click 'Add Family Member' Button",
        description:
          "Look for and click the 'Add Family Member' button to start the process.",
      },
      {
        stepNumber: 3,
        title: "Fill Form & Submit",
        description: "Complete all required information in the form.",
        subSteps: [
          {
            label: "For Children",
            description: "Descendant father or mother is a mandatory entry",
          },
          {
            label: "For Spouses",
            description: "Descendant married to is a mandatory entry",
          },
        ],
      },
      {
        stepNumber: 4,
        title: "Wait for Approval",
        description:
          "Your request will be reviewed by an admin before the new member is added to the family tree.",
      },
    ],
    actionButtons: [
      { label: "Go to Family Members", href: "/family-members" },
      { label: "View Family Tree", href: "/family-tree", variant: "outline" },
    ],
    tips: [
      "Make sure you have accurate relationship information before submitting",
      "Double-check spelling of names as they will appear on the family tree",
      "Include as much detail as possible to help with approval process",
    ],
  },
  {
    id: "profile-settings",
    title: "Profile & Settings",
    description:
      "Manage your personal profile information and account settings.",
    icon: User,
    color: "text-pink-600",
    userType: "user",
    steps: [
      {
        stepNumber: 1,
        title: "Navigate to Settings or Profile",
        description: "Access your settings or profile section.",
        subSteps: [
          {
            label: "Option A",
            description: "Navigate to Settings from the main menu",
          },
          {
            label: "Option B",
            description:
              "Navigate to your profile via the icon in top right corner of the screen",
          },
        ],
      },
      {
        stepNumber: 2,
        title: "Edit Your Information",
        description: "Choose what you want to update.",
        subSteps: [
          {
            label: "Profile Section",
            description: "Edit profile information or add timeline events",
          },
          {
            label: "Settings Section",
            description: "Edit profile photo & other personal information",
          },
        ],
      },
    ],
    actionButtons: [
      { label: "Go to Profile", href: "/dashboard/profile" },
      {
        label: "Go to Settings",
        href: "/dashboard/settings",
        variant: "outline",
      },
    ],
  },
  {
    id: "global-search",
    title: "Global Search",
    description:
      "Use the search functionality to quickly find family members, events, and notices.",
    icon: Search,
    color: "text-yellow-600",
    userType: "user",
    steps: [
      {
        stepNumber: 1,
        title: "Use the Search Bar",
        description: "Type in the search bar at the top of the page to find:",
        subSteps: [
          {
            label: "Unique Identification Number",
            description: "Search by family member's unique ID",
          },
          {
            label: "Family Members",
            description: "Search by name to find family members",
          },
          {
            label: "Events",
            description: "Find upcoming or past family events",
          },
          {
            label: "Notices",
            description: "Search through notice board announcements",
          },
        ],
      },
    ],
    actionButtons: [{ label: "Try Search Now", href: "/dashboard" }],
    tips: [
      "Use partial names if you're not sure of the exact spelling",
      "Try different search terms if you don't find what you're looking for",
      "Search results will show the most relevant matches first",
    ],
  },

  // PUBLISHERS
  {
    id: "managing-gallery-uploads",
    title: "Managing Gallery Uploads",
    description:
      "Review and approve photo uploads from family members as a publisher.",
    icon: Upload,
    color: "text-purple-600",
    userType: "publisher",
    steps: [
      {
        stepNumber: 1,
        title: "Navigate to Gallery Requests",
        description:
          "Access gallery requests via the side menu in your publisher dashboard.",
      },
      {
        stepNumber: 2,
        title: "Review Submissions",
        description:
          "Click on photo in recent submissions to enlarge and review the content.",
      },
      {
        stepNumber: 3,
        title: "Approve or Decline",
        description:
          "Make a decision based on content quality and appropriateness.",
        subSteps: [
          {
            label: "If photo is appropriate",
            description: "Click approve to publish the photo to the gallery",
          },
          {
            label: "If photo is not appropriate",
            description: "Click decline and optionally provide feedback",
          },
        ],
      },
    ],
    actionButtons: [
      { label: "Go to Gallery Requests", href: "/publisher/gallery-requests" },
      { label: "View Gallery", href: "/publisher/gallery", variant: "outline" },
    ],
    warnings: [
      "Review all photos carefully for appropriateness before approving",
      "Consider family privacy when approving photos",
      "Provide feedback when declining submissions to help users understand",
    ],
  },
  {
    id: "managing-notice-board",
    title: "Managing Notice Board",
    description:
      "Review and manage notice board submissions from family members.",
    icon: FileText,
    color: "text-orange-600",
    userType: "publisher",
    steps: [
      {
        stepNumber: 1,
        title: "Navigate to Notice Board Requests",
        description:
          "Access notice board requests via the side menu in your publisher dashboard.",
      },
      {
        stepNumber: 2,
        title: "Review Notice Details",
        description: "Click on notice to review the full content and details.",
      },
      {
        stepNumber: 3,
        title: "Approve or Decline",
        description:
          "Make a decision based on content appropriateness and relevance.",
        subSteps: [
          {
            label: "If notice is appropriate",
            description: "Click approve to publish the notice",
          },
          {
            label: "If notice is not appropriate",
            description: "Click decline and provide feedback if necessary",
          },
        ],
      },
    ],
    actionButtons: [
      {
        label: "Go to Notice Board Requests",
        href: "/publisher/notice-board-requests",
      },
      {
        label: "View Notice Board",
        href: "/publisher/notice-board",
        variant: "outline",
      },
    ],
  },
  {
    id: "managing-events",
    title: "Managing Events",
    description:
      "Create and manage family events, and handle event invitations.",
    icon: Calendar,
    color: "text-teal-600",
    userType: "publisher",
    steps: [
      {
        stepNumber: 1,
        title: "Navigate to Events",
        description:
          "Access the Events section via the side menu in your publisher dashboard.",
      },
      {
        stepNumber: 2,
        title: "Add New Event",
        description:
          "To create a new event, click 'Add New Event' and enter all event details including date, time, and description.",
      },
      {
        stepNumber: 3,
        title: "Invite Family Members",
        description:
          "To invite family members to your event, enter their names and click invite.",
      },
      {
        stepNumber: 4,
        title: "Manage Invitations",
        description:
          "To view your invitations and RSVP to events, navigate to the invitations tab.",
      },
    ],
    actionButtons: [
      { label: "Go to Events", href: "/publisher/events" },
      {
        label: "View Invitations",
        href: "/publisher/invitations",
        variant: "outline",
      },
    ],
    tips: [
      "Include detailed event information to help family members plan",
      "Send invitations well in advance for better attendance",
      "Follow up on RSVPs closer to the event date",
    ],
  },

  // ADMINS
  {
    id: "managing-family-member-requests",
    title: "Managing Family Member Requests",
    description:
      "Review and approve requests to add new family members to the tree.",
    icon: Users,
    color: "text-green-600",
    userType: "admin",
    steps: [
      {
        stepNumber: 1,
        title: "Navigate to Family Member Requests",
        description:
          "Access family member requests via the side menu in your admin dashboard.",
      },
      {
        stepNumber: 2,
        title: "Review Request Details",
        description:
          "Carefully review all details of family member requests including relationships and personal information.",
      },
      {
        stepNumber: 3,
        title: "Approve or Reject",
        description:
          "Make a decision based on the accuracy and completeness of the information provided.",
      },
    ],
    actionButtons: [
      { label: "Go to Member Requests", href: "/admin/member-requests" },
      {
        label: "View Family Tree",
        href: "/admin/family-tree",
        variant: "outline",
      },
    ],
    warnings: [
      "Verify relationship information is accurate before approving",
      "Check for duplicate entries in the family tree",
      "Ensure all mandatory fields are properly filled",
    ],
  },
  {
    id: "publisher-management",
    title: "Publisher Management",
    description:
      "Manage publisher accounts and assign publishing permissions to family members.",
    icon: Shield,
    color: "text-red-600",
    userType: "admin",
    steps: [
      {
        stepNumber: 1,
        title: "Navigate to Publisher Management",
        description:
          "Access Publisher Management via the side menu in your admin dashboard.",
      },
      {
        stepNumber: 2,
        title: "Search for User",
        description:
          "Search for the user you want to assign rights to using their name or email address.",
      },
      {
        stepNumber: 3,
        title: "Promote or Demote",
        description:
          "Use the actions button on the far right to promote users to publisher or demote existing publishers.",
      },
    ],
    actionButtons: [
      {
        label: "Go to Publisher Management",
        href: "/admin/publisher-management",
      },
      {
        label: "View User Accounts",
        href: "/admin/user-accounts",
        variant: "outline",
      },
    ],
  },
  {
    id: "user-account-management",
    title: "User Account Management",
    description: "Create and manage user accounts for family members.",
    icon: Users,
    color: "text-indigo-600",
    userType: "admin",
    steps: [
      {
        stepNumber: 1,
        title: "Navigate to User Accounts",
        description:
          "Access User Accounts via the side menu in your admin dashboard.",
      },
      {
        stepNumber: 2,
        title: "Search for Family Member",
        description:
          "Search for the family member using their name, email address, or unique identification number.",
      },
      {
        stepNumber: 3,
        title: "Confirm Eligibility",
        description:
          "Verify that the family member is eligible for an account and has valid contact information.",
      },
      {
        stepNumber: 4,
        title: "Create Account",
        description:
          "Click 'Create Account' on the far right of the page. You may also use bulk create using the bulk create button at the top of the screen.",
      },
      {
        stepNumber: 5,
        title: "Send Login Instructions",
        description:
          "Enter the email address in the address field in the pop-up form and submit. They will receive an email with login instructions.",
      },
    ],
    actionButtons: [
      { label: "Go to User Accounts", href: "/admin/user-accounts" },
      {
        label: "Bulk Create Accounts",
        href: "/admin/user-accounts",
        variant: "outline",
      },
    ],
    tips: [
      "Verify email addresses are correct before creating accounts",
      "Use bulk creation for multiple accounts to save time",
      "Follow up with family members to ensure they received login instructions",
    ],
  },
  {
    id: "gallery-management",
    title: "Gallery Management",
    description:
      "Manage the family photo gallery and oversee all uploaded content.",
    icon: ImageIcon,
    color: "text-cyan-600",
    userType: "admin",
    steps: [
      {
        stepNumber: 1,
        title: "Use Global Search",
        description: "Type in the search bar at the top of the page to find:",
        subSteps: [
          {
            label: "Unique Identification Number",
            description: "Search for specific family member photos",
          },
          {
            label: "Family Members",
            description: "Find photos of specific family members",
          },
          {
            label: "Events",
            description: "Locate event-related photos",
          },
          {
            label: "Notices",
            description: "Find photos associated with notices",
          },
        ],
      },
    ],
    actionButtons: [
      { label: "Go to Gallery", href: "/admin/gallery" },
      {
        label: "Gallery Requests",
        href: "/admin/gallery-requests",
        variant: "outline",
      },
    ],
  },
];

// Helper function to get topics by user type
export const getHelpTopicsByUserType = (
  userType: "user" | "publisher" | "admin"
): HelpTopic[] => {
  return helpTopicsData.filter((topic) => topic.userType === userType);
};

// Helper function to get topic by id
export const getHelpTopicById = (id: string): HelpTopic | undefined => {
  return helpTopicsData.find((topic) => topic.id === id);
};
