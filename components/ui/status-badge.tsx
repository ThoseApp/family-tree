import React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Clock, Check, X } from "lucide-react";

interface StatusBadgeProps {
  status: "pending" | "approved" | "rejected";
  className?: string;
}

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending":
        return {
          icon: Clock,
          text: "Pending",
          variant: "outline" as const,
          className: "border-yellow-300 text-yellow-700 bg-yellow-50",
        };
      case "approved":
        return {
          icon: Check,
          text: "Approved",
          variant: "outline" as const,
          className: "border-green-300 text-green-700 bg-green-50",
        };
      case "rejected":
        return {
          icon: X,
          text: "Rejected",
          variant: "outline" as const,
          className: "border-red-300 text-red-700 bg-red-50",
        };
      default:
        return {
          icon: Clock,
          text: "Unknown",
          variant: "outline" as const,
          className: "border-gray-300 text-gray-700 bg-gray-50",
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={cn(
        "text-xs font-medium px-2 py-1 flex items-center gap-1",
        config.className,
        className
      )}
    >
      <Icon className="w-3 h-3" />
      {config.text}
    </Badge>
  );
};
