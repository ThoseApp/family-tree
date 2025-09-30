import { cn } from "@/lib/utils";

interface CountBadgeProps {
  count: number;
  className?: string;
  showZero?: boolean;
  variant?: "default" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
}

/**
 * Count badge component for showing notification/request counts
 */
export function CountBadge({
  count,
  className,
  showZero = false,
  variant = "default",
  size = "sm",
}: CountBadgeProps) {
  // Don't show badge if count is 0 and showZero is false
  if (count === 0 && !showZero) {
    return null;
  }

  const baseClasses =
    "inline-flex items-center justify-center font-bold leading-none rounded-full transition-colors";

  const variantClasses = {
    default: count === 0 ? "bg-gray-400 text-white" : "bg-red-500 text-white",
    secondary:
      count === 0 ? "bg-gray-200 text-gray-600" : "bg-blue-500 text-white",
    outline:
      count === 0
        ? "border border-gray-300 text-gray-600 bg-transparent"
        : "border border-red-500 text-red-500 bg-transparent",
  };

  const sizeClasses = {
    sm: "px-1.5 py-0.5 text-xs min-w-[18px] h-4",
    md: "px-2 py-1 text-xs min-w-[20px] h-5",
    lg: "px-2.5 py-1.5 text-sm min-w-[24px] h-6",
  };

  return (
    <span
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      title={`${count} pending ${count === 1 ? "request" : "requests"}`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
