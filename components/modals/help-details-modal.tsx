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
  Crown,
  User,
  Mail,
  Bell,
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
  {
    id: "uploading-pictures",
    title: "Uploading Pictures",
    description:
      "Upload family photos to share memories with your family. All uploads require admin approval.",
    icon: Upload,
    color: "text-green-600",
    userType: "user",
    requiresApproval: true,
    steps: [
      {
        stepNumber: 1,
        title: "Navigate to Gallery",
        description: "Go to the Gallery section from your dashboard menu.",
      },
      {
        stepNumber: 2,
        title: "Click Upload Button",
        description:
          "Look for the 'Upload' or 'Add Photos' button in the gallery interface.",
      },
      {
        stepNumber: 3,
        title: "Select Photos",
        description: "Choose photos from your device to upload.",
        subSteps: [
          {
            label: "File Types",
            description: "Supported formats: JPEG, PNG, WebP",
          },
          {
            label: "File Size",
            description: "Maximum file size: 10MB per photo",
          },
          {
            label: "Multiple Selection",
            description: "You can select multiple photos at once",
          },
        ],
      },
      {
        stepNumber: 4,
        title: "Add Captions and Details",
        description:
          "Provide meaningful captions and organize photos into albums.",
        subSteps: [
          {
            label: "Descriptive Captions",
            description: "Add context about when and where the photo was taken",
          },
          {
            label: "Album Selection",
            description: "Choose an existing album or create a new one",
          },
          {
            label: "Privacy Settings",
            description: "Set appropriate privacy levels for your photos",
          },
        ],
      },
      {
        stepNumber: 5,
        title: "Submit for Approval",
        description: "Submit your photos for admin review and approval.",
      },
    ],
    actionButtons: [
      { label: "Go to Gallery", href: "/dashboard/gallery" },
      {
        label: "View Upload Guidelines",
        href: "/dashboard/help",
        variant: "outline",
      },
    ],
    tips: [
      "Use high-quality photos for better viewing experience",
      "Add descriptive captions to help family members understand the context",
      "Group related photos into albums for better organization",
      "Be patient - approval may take some time",
    ],
    warnings: [
      "Only upload photos you have permission to share",
      "Ensure photos are family-appropriate",
      "Large files may take longer to upload",
    ],
  },
  {
    id: "creating-events",
    title: "Creating Events",
    description:
      "Create family gatherings, birthdays, and important dates to keep everyone informed.",
    icon: Calendar,
    color: "text-purple-600",
    userType: "user",
    steps: [
      {
        stepNumber: 1,
        title: "Navigate to Events",
        description: "Access the Events section from your dashboard menu.",
      },
      {
        stepNumber: 2,
        title: "Click Create Event",
        description: "Look for the 'Create Event' or 'Add New Event' button.",
      },
      {
        stepNumber: 3,
        title: "Fill Event Details",
        description: "Provide comprehensive information about your event.",
        subSteps: [
          {
            label: "Event Title",
            description: "Choose a clear, descriptive title",
          },
          {
            label: "Date and Time",
            description: "Set the event date, start time, and duration",
          },
          {
            label: "Location",
            description: "Specify where the event will take place",
          },
          {
            label: "Description",
            description: "Add details about what to expect",
          },
        ],
      },
      {
        stepNumber: 4,
        title: "Set Event Options",
        description: "Configure event settings and privacy options.",
        subSteps: [
          {
            label: "Privacy Level",
            description: "Choose who can see and attend the event",
          },
          {
            label: "RSVP Settings",
            description: "Enable or disable RSVP tracking",
          },
          {
            label: "Reminders",
            description: "Set up automatic reminders for attendees",
          },
        ],
      },
      {
        stepNumber: 5,
        title: "Invite Family Members",
        description: "Select family members to invite to your event.",
      },
    ],
    actionButtons: [
      { label: "Go to Events", href: "/dashboard/events" },
      {
        label: "View My Events",
        href: "/dashboard/events",
        variant: "outline",
      },
    ],
    tips: [
      "Include all important details in the description",
      "Set reminders to help family members remember",
      "Consider time zones if family is spread across different locations",
      "Update event details if plans change",
    ],
  },
  {
    id: "accepting-invitations",
    title: "Accepting Invitations",
    description:
      "Manage event invitations and family member requests you've received.",
    icon: Mail,
    color: "text-orange-600",
    userType: "user",
    steps: [
      {
        stepNumber: 1,
        title: "Navigate to Invitations",
        description: "Access the Invitations section from your dashboard menu.",
      },
      {
        stepNumber: 2,
        title: "Review Pending Invitations",
        description: "Check all pending invitations and requests.",
        subSteps: [
          {
            label: "Event Invitations",
            description: "Family events you've been invited to attend",
          },
          {
            label: "Family Member Requests",
            description: "Requests to connect with new family members",
          },
          {
            label: "Group Invitations",
            description: "Invitations to join family groups or circles",
          },
        ],
      },
      {
        stepNumber: 3,
        title: "Review Invitation Details",
        description:
          "Click on invitations to see full details before responding.",
      },
      {
        stepNumber: 4,
        title: "Respond to Invitations",
        description: "Accept, decline, or request more information.",
        subSteps: [
          {
            label: "Accept",
            description: "Confirm your attendance or agreement",
          },
          {
            label: "Decline",
            description: "Politely decline with optional message",
          },
          {
            label: "Maybe/Tentative",
            description: "Indicate uncertainty about attendance",
          },
        ],
      },
    ],
    actionButtons: [
      { label: "Go to Invitations", href: "/dashboard/invitations" },
      { label: "View Events", href: "/dashboard/events", variant: "outline" },
    ],
    tips: [
      "Respond to invitations promptly to help organizers plan",
      "Add events to your calendar after accepting",
      "Communicate any dietary restrictions or special needs",
      "Update your response if your availability changes",
    ],
  },
  {
    id: "adding-notices",
    title: "Adding Notices",
    description:
      "Post important announcements and updates for your family to see.",
    icon: Bell,
    color: "text-red-600",
    userType: "user",
    steps: [
      {
        stepNumber: 1,
        title: "Navigate to Notice Board",
        description:
          "Access the Notice Board section from your dashboard menu.",
      },
      {
        stepNumber: 2,
        title: "Click Add Notice",
        description:
          "Look for the 'Add Notice' or 'Create Announcement' button.",
      },
      {
        stepNumber: 3,
        title: "Write Your Notice",
        description: "Create a clear and informative announcement.",
        subSteps: [
          {
            label: "Title",
            description: "Write a clear, attention-grabbing headline",
          },
          {
            label: "Content",
            description: "Provide all necessary details and information",
          },
          {
            label: "Priority Level",
            description: "Set importance level (urgent, normal, low)",
          },
          {
            label: "Expiration Date",
            description: "Set when the notice should be archived",
          },
        ],
      },
      {
        stepNumber: 4,
        title: "Set Visibility Options",
        description: "Choose who can see your notice.",
        subSteps: [
          {
            label: "All Family",
            description: "Visible to all family members",
          },
          {
            label: "Specific Groups",
            description: "Limit to certain family branches or groups",
          },
          {
            label: "Adults Only",
            description: "Restrict to adult family members",
          },
        ],
      },
      {
        stepNumber: 5,
        title: "Submit for Review",
        description:
          "Submit your notice for publisher/admin approval if required.",
      },
    ],
    actionButtons: [
      { label: "Go to Notice Board", href: "/dashboard/notice-board" },
      { label: "View Guidelines", href: "/dashboard/help", variant: "outline" },
    ],
    tips: [
      "Keep notices concise but informative",
      "Use appropriate priority levels to avoid notice fatigue",
      "Include contact information if responses are needed",
      "Proofread before submitting",
    ],
    warnings: [
      "Avoid sharing sensitive personal information",
      "Respect family privacy and boundaries",
      "Follow community guidelines for appropriate content",
    ],
  },
  {
    id: "notice-board",
    title: "Notice Board",
    description:
      "Stay updated with family announcements, news, and important information.",
    icon: FileText,
    color: "text-indigo-600",
    userType: "user",
    steps: [
      {
        stepNumber: 1,
        title: "Access Notice Board",
        description: "Navigate to the Notice Board from your dashboard menu.",
      },
      {
        stepNumber: 2,
        title: "Browse Current Notices",
        description: "Review all active family announcements and updates.",
        subSteps: [
          {
            label: "Recent Notices",
            description: "See the latest announcements at the top",
          },
          {
            label: "Priority Notices",
            description: "Important or urgent notices are highlighted",
          },
          {
            label: "Categories",
            description: "Filter notices by type or category",
          },
        ],
      },
      {
        stepNumber: 3,
        title: "Interact with Notices",
        description: "Engage with family announcements appropriately.",
        subSteps: [
          {
            label: "Read Full Details",
            description: "Click on notices to see complete information",
          },
          {
            label: "React or Comment",
            description: "Show support or ask questions if enabled",
          },
          {
            label: "Share or Forward",
            description: "Share important notices with other family members",
          },
        ],
      },
      {
        stepNumber: 4,
        title: "Manage Your Notices",
        description: "Keep track of notices you've posted or are following.",
      },
    ],
    actionButtons: [
      { label: "Go to Notice Board", href: "/dashboard/notice-board" },
      {
        label: "Add New Notice",
        href: "/dashboard/notice-board",
        variant: "outline",
      },
    ],
    tips: [
      "Check the notice board regularly for important updates",
      "Use filters to find specific types of announcements",
      "Set up notifications for high-priority notices",
      "Archive or dismiss notices you've read",
    ],
  },
  {
    id: "gallery",
    title: "Gallery",
    description:
      "Browse, view, and manage family photos and albums shared by family members.",
    icon: ImageIcon,
    color: "text-teal-600",
    userType: "user",
    steps: [
      {
        stepNumber: 1,
        title: "Access Gallery",
        description:
          "Navigate to the Gallery section from your dashboard menu.",
      },
      {
        stepNumber: 2,
        title: "Browse Photos and Albums",
        description: "Explore family photos organized in various ways.",
        subSteps: [
          {
            label: "Recent Photos",
            description: "View the latest uploaded family photos",
          },
          {
            label: "Albums",
            description: "Browse photos organized by events or themes",
          },
          {
            label: "Family Members",
            description: "Find photos featuring specific family members",
          },
          {
            label: "Timeline View",
            description: "See photos organized chronologically",
          },
        ],
      },
      {
        stepNumber: 3,
        title: "View and Interact",
        description: "Engage with family photos and memories.",
        subSteps: [
          {
            label: "Full-Size Viewing",
            description: "Click photos to see them in full resolution",
          },
          {
            label: "Photo Details",
            description: "Read captions, dates, and location information",
          },
          {
            label: "Comments and Reactions",
            description: "Share memories and reactions to photos",
          },
          {
            label: "Download or Share",
            description: "Save photos or share them with others",
          },
        ],
      },
      {
        stepNumber: 4,
        title: "Organize Your View",
        description: "Customize how you browse and view family photos.",
        subSteps: [
          {
            label: "Search Photos",
            description: "Find specific photos using search filters",
          },
          {
            label: "Sort Options",
            description: "Sort by date, popularity, or family member",
          },
          {
            label: "Create Collections",
            description: "Save favorite photos to personal collections",
          },
        ],
      },
    ],
    actionButtons: [
      { label: "Go to Gallery", href: "/dashboard/gallery" },
      {
        label: "Upload Photos",
        href: "/dashboard/gallery",
        variant: "outline",
      },
    ],
    tips: [
      "Use search filters to quickly find specific photos",
      "Create collections of your favorite family memories",
      "Add meaningful comments to share your memories",
      "Download important photos for personal backup",
    ],
  },
  {
    id: "settings",
    title: "Settings",
    description:
      "Manage your account preferences, privacy settings, and notification options.",
    icon: Settings,
    color: "text-cyan-600",
    userType: "user",
    steps: [
      {
        stepNumber: 1,
        title: "Access Settings",
        description:
          "Navigate to Settings from your dashboard menu or profile.",
      },
      {
        stepNumber: 2,
        title: "Account Information",
        description: "Update your personal information and account details.",
        subSteps: [
          {
            label: "Profile Details",
            description: "Update name, email, phone, and other personal info",
          },
          {
            label: "Profile Photo",
            description: "Upload or change your profile picture",
          },
          {
            label: "Bio and About",
            description: "Add or update your personal description",
          },
        ],
      },
      {
        stepNumber: 3,
        title: "Privacy Settings",
        description: "Control who can see your information and activities.",
        subSteps: [
          {
            label: "Profile Visibility",
            description: "Choose who can view your profile information",
          },
          {
            label: "Activity Sharing",
            description: "Control what activities are visible to others",
          },
          {
            label: "Contact Information",
            description: "Set privacy levels for your contact details",
          },
        ],
      },
      {
        stepNumber: 4,
        title: "Notification Preferences",
        description: "Customize how and when you receive notifications.",
        subSteps: [
          {
            label: "Email Notifications",
            description: "Choose which events trigger email alerts",
          },
          {
            label: "Push Notifications",
            description: "Configure mobile and browser notifications",
          },
          {
            label: "Frequency Settings",
            description: "Set how often you receive notification summaries",
          },
        ],
      },
      {
        stepNumber: 5,
        title: "Security Settings",
        description: "Manage password and account security options.",
        subSteps: [
          {
            label: "Change Password",
            description: "Update your account password regularly",
          },
          {
            label: "Two-Factor Authentication",
            description: "Enable additional security for your account",
          },
          {
            label: "Login History",
            description: "Review recent account access and activity",
          },
        ],
      },
    ],
    actionButtons: [
      { label: "Go to Settings", href: "/dashboard/settings" },
      { label: "View Profile", href: "/dashboard/profile", variant: "outline" },
    ],
    tips: [
      "Review your privacy settings regularly",
      "Use strong passwords and enable two-factor authentication",
      "Keep your contact information up to date",
      "Customize notifications to avoid information overload",
    ],
    warnings: [
      "Be careful when changing email addresses as it affects login",
      "Always log out from shared or public devices",
      "Some privacy changes may affect how family members can contact you",
      "Backup important information before making major changes",
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

  // PUBLISHERS
  {
    id: "notice-board-requests",
    title: "Notice Board Requests",
    description:
      "Review and manage notice board requests from family members before they go to admin approval.",
    icon: Clock,
    color: "text-green-600",
    userType: "publisher",
    steps: [
      {
        stepNumber: 1,
        title: "Navigate to Notice Board Requests",
        description:
          "Access Notice Board Requests via the side menu in your publisher dashboard.",
      },
      {
        stepNumber: 2,
        title: "Review Pending Requests",
        description:
          "View all pending notice board submissions from family members. Each request shows the title, content, and submitter information.",
      },
      {
        stepNumber: 3,
        title: "Approve or Decline Requests",
        description:
          "Use the action buttons to approve or decline requests based on content appropriateness and family guidelines.",
        subSteps: [
          {
            label: "Approve",
            description: "Approved requests move to admin review queue",
          },
          {
            label: "Decline",
            description:
              "Declined requests are removed and submitter is notified",
          },
        ],
      },
      {
        stepNumber: 4,
        title: "Monitor Real-time Updates",
        description:
          "The page automatically updates when new requests are submitted, so you can stay on top of pending content.",
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
    tips: [
      "Review content for appropriateness and family-friendly language",
      "Check for accuracy of information before approving",
      "Provide feedback to family members when declining requests",
      "Monitor the requests regularly to maintain good content flow",
    ],
  },
  {
    id: "photo-guidelines",
    title: "Photo Guidelines",
    description:
      "Best practices for uploading and managing family photos to ensure quality and appropriateness.",
    icon: ImageIcon,
    color: "text-teal-600",
    userType: "publisher",
    steps: [
      {
        stepNumber: 1,
        title: "Photo Quality Standards",
        description:
          "Ensure photos meet quality standards for the family gallery.",
        subSteps: [
          {
            label: "Resolution",
            description:
              "Upload high-resolution images (minimum 800x600 pixels)",
          },
          {
            label: "Format",
            description: "Use common formats: JPEG, PNG, or WebP",
          },
          {
            label: "File Size",
            description: "Keep files under 10MB for optimal loading",
          },
        ],
      },
      {
        stepNumber: 2,
        title: "Content Appropriateness",
        description:
          "Review photos for family-appropriate content before uploading.",
        subSteps: [
          {
            label: "Family-Friendly",
            description:
              "Ensure all content is appropriate for all family members",
          },
          {
            label: "Privacy",
            description: "Respect privacy preferences of family members",
          },
          {
            label: "Consent",
            description: "Ensure you have permission to share photos of others",
          },
        ],
      },
      {
        stepNumber: 3,
        title: "Organization and Captions",
        description: "Properly organize and caption photos for easy discovery.",
        subSteps: [
          {
            label: "Descriptive Captions",
            description: "Add meaningful captions with context and dates",
          },
          {
            label: "Album Organization",
            description: "Group related photos into appropriate albums",
          },
          {
            label: "Tagging",
            description: "Tag family members when appropriate",
          },
        ],
      },
    ],
    actionButtons: [
      { label: "Go to Gallery", href: "/publisher/gallery" },
      {
        label: "Gallery Requests",
        href: "/publisher/gallery-requests",
        variant: "outline",
      },
    ],
    tips: [
      "Always preview photos before uploading to check quality",
      "Use descriptive filenames to help with organization",
      "Consider creating themed albums for special events",
      "Regularly review and organize existing photos",
    ],
    warnings: [
      "Do not upload copyrighted images without permission",
      "Avoid uploading blurry or low-quality photos",
      "Respect family members who prefer not to be photographed",
    ],
  },
  {
    id: "publisher-settings",
    title: "Publisher Settings",
    description:
      "Manage your publisher account preferences, notifications, and privacy settings.",
    icon: Settings,
    color: "text-cyan-600",
    userType: "publisher",
    steps: [
      {
        stepNumber: 1,
        title: "Access Settings",
        description:
          "Navigate to Settings via the side menu in your publisher dashboard.",
      },
      {
        stepNumber: 2,
        title: "Account Preferences",
        description: "Configure your account settings and preferences.",
        subSteps: [
          {
            label: "Profile Information",
            description: "Update your name, email, and contact information",
          },
          {
            label: "Password Security",
            description:
              "Change your password and enable two-factor authentication",
          },
          {
            label: "Display Preferences",
            description: "Customize how content appears in your dashboard",
          },
        ],
      },
      {
        stepNumber: 3,
        title: "Notification Settings",
        description: "Control how and when you receive notifications.",
        subSteps: [
          {
            label: "Email Notifications",
            description: "Choose which events trigger email notifications",
          },
          {
            label: "In-App Notifications",
            description: "Configure dashboard notification preferences",
          },
          {
            label: "Frequency Settings",
            description: "Set how often you receive notification summaries",
          },
        ],
      },
      {
        stepNumber: 4,
        title: "Privacy Controls",
        description: "Manage your privacy and visibility settings.",
        subSteps: [
          {
            label: "Profile Visibility",
            description: "Control who can see your publisher profile",
          },
          {
            label: "Activity Tracking",
            description: "Choose what activities are visible to others",
          },
          {
            label: "Data Preferences",
            description: "Manage how your data is used and stored",
          },
        ],
      },
    ],
    actionButtons: [
      { label: "Go to Settings", href: "/publisher/settings" },
      {
        label: "View Profile",
        href: "/publisher/profile",
        variant: "outline",
      },
    ],
    tips: [
      "Regularly review and update your notification preferences",
      "Use strong passwords and enable two-factor authentication",
      "Keep your contact information up to date",
      "Review privacy settings periodically",
    ],
    warnings: [
      "Be cautious when changing email addresses as it affects login",
      "Always log out from shared devices after changing settings",
      "Some settings changes may require admin approval",
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
  {
    id: "admin-management",
    title: "Admin Management",
    description:
      "Manage administrator accounts and permissions. Control who has full system access and administrative privileges.",
    icon: Crown,
    color: "text-purple-600",
    userType: "admin",
    steps: [
      {
        stepNumber: 1,
        title: "Navigate to Admin Management",
        description:
          "Access Admin Management via the side menu in your admin dashboard.",
      },
      {
        stepNumber: 2,
        title: "View Current Administrators",
        description:
          "Review the list of current administrators and their account details.",
        subSteps: [
          {
            label: "Admin Status",
            description: "See who currently has admin privileges",
          },
          {
            label: "Account Information",
            description: "View admin names, emails, and join dates",
          },
          {
            label: "Activity Status",
            description: "Check when admins were last active",
          },
        ],
      },
      {
        stepNumber: 3,
        title: "Promote Users to Admin",
        description:
          "Grant administrator privileges to trusted family members.",
        subSteps: [
          {
            label: "Search for User",
            description:
              "Find the user you want to promote using the search function",
          },
          {
            label: "Review User Profile",
            description:
              "Verify the user's identity and activity before promoting",
          },
          {
            label: "Confirm Promotion",
            description: "Use the promote action to grant admin privileges",
          },
        ],
      },
      {
        stepNumber: 4,
        title: "Demote Administrators",
        description:
          "Remove admin privileges when necessary for security or role changes.",
        subSteps: [
          {
            label: "Select Admin",
            description: "Choose the administrator you want to demote",
          },
          {
            label: "Confirm Demotion",
            description: "Use the demote action to remove admin privileges",
          },
          {
            label: "Notification",
            description: "The user will be notified of their role change",
          },
        ],
      },
      {
        stepNumber: 5,
        title: "Monitor Admin Activity",
        description:
          "Keep track of administrative actions and maintain system security.",
        subSteps: [
          {
            label: "Regular Reviews",
            description: "Periodically review who has admin access",
          },
          {
            label: "Activity Monitoring",
            description: "Check admin activity logs and recent actions",
          },
          {
            label: "Security Audits",
            description: "Ensure only trusted individuals have admin access",
          },
        ],
      },
    ],
    actionButtons: [
      {
        label: "Go to Admin Management",
        href: "/admin/admin-management",
      },
      {
        label: "View User Accounts",
        href: "/admin/user-accounts",
        variant: "outline",
      },
    ],
    tips: [
      "Only promote trusted family members who understand the responsibilities",
      "Regularly review admin accounts to ensure security",
      "Document reasons for promoting or demoting administrators",
      "Ensure there are always at least 2 active administrators",
      "Communicate role changes clearly to affected users",
    ],
    warnings: [
      "Admin privileges grant full system access - use carefully",
      "Always verify user identity before granting admin access",
      "Demoting the last admin could lock you out of admin functions",
      "Admin actions are logged and can be audited",
      "Consider the impact on family dynamics when managing roles",
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
