"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  HelpCircle,
  UserPlus,
  Upload,
  Calendar,
  Mail,
  Bell,
  User,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HelpSectionProps {
  isCollapsed?: boolean;
  className?: string;
}

const HelpSection = ({ isCollapsed = false, className }: HelpSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const helpTopics = [
    {
      icon: UserPlus,
      title: "Add New Members",
      description:
        "Navigate to Family Members section to add new family members to the tree. Fill in their details and relationship information.",
      color: "text-blue-600",
    },
    {
      icon: Upload,
      title: "Upload Pictures",
      description:
        "Go to Gallery section to upload family photos. Note: All uploads require admin approval before being published.",
      color: "text-green-600",
    },
    {
      icon: Calendar,
      title: "Create Events",
      description:
        "Use the Events section to create family gatherings, birthdays, or important dates. Events may require admin approval.",
      color: "text-purple-600",
    },
    {
      icon: Mail,
      title: "Accept Invitations",
      description:
        "Check your Invitations section for pending family member requests. Review and approve or reject as appropriate.",
      color: "text-orange-600",
    },
    {
      icon: Bell,
      title: "Add Notices",
      description:
        "Post important announcements in the Notice Board. Publisher users can create notices that may require approval.",
      color: "text-red-600",
    },
    {
      icon: User,
      title: "View & Edit Profile",
      description:
        "Access your Profile section to update personal information, change password, or modify account settings.",
      color: "text-indigo-600",
    },
    {
      icon: Search,
      title: "Global Search",
      description:
        "Use the search bar at the top to quickly find family members, events, or content across all sections.",
      color: "text-teal-600",
    },
  ];

  if (isCollapsed) {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <div className={cn("px-3 py-2", className)}>
              <Button
                variant="ghost"
                size="icon"
                className="w-full hover:bg-accent"
                onClick={() => setIsOpen(!isOpen)}
              >
                <HelpCircle className="h-5 w-5" />
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="ml-2 max-w-xs">
            <div className="space-y-2">
              <p className="font-medium">Help & Tips</p>
              <div className="text-sm space-y-1">
                {helpTopics.map((topic, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <topic.icon
                      className={cn(
                        "h-3 w-3 mt-0.5 flex-shrink-0",
                        topic.color
                      )}
                    />
                    <span>{topic.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className={cn("px-3", className)}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between p-3 h-auto hover:bg-accent"
          >
            <div className="flex items-center gap-3">
              <HelpCircle className="h-5 w-5" />
              <span className="font-medium">Help & Tips</span>
            </div>
            {isOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 mt-2">
          {helpTopics.map((topic, index) => (
            <div
              key={index}
              className="p-3 bg-accent/50 rounded-lg border border-border/50"
            >
              <div className="flex items-start gap-3">
                <topic.icon
                  className={cn("h-5 w-5 mt-0.5 flex-shrink-0", topic.color)}
                />
                <div className="space-y-1">
                  <h4 className="font-medium text-sm">{topic.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {topic.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default HelpSection;
