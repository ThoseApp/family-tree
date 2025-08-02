import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { supabase } from "./supabase/client";

/**
 * Merges multiple class names using clsx and tailwind-merge
 * @param inputs - The class values to merge
 * @returns A merged class name string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date to a string with the format "Month Day, Year"
 * @param date - The date to format
 * @returns A string with the format "Month Day, Year"
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d
    .toLocaleDateString("en-NG", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .replace(/ /g, " ");
}

/**
 * Converts a date string to an object with month and day properties
 * @param dateInput - The date string to convert
 * @returns An object with month and day properties
 */

export const ensureDateAsObject = (
  dateInput: any
): { month: string; day: string } => {
  if (
    dateInput &&
    typeof dateInput.month === "string" &&
    typeof dateInput.day === "string"
  ) {
    return { month: dateInput.month, day: dateInput.day }; // Already the correct object type
  }
  if (typeof dateInput === "string") {
    // Attempt to parse string like "Month Day" or "Month Day, Year"
    const d = new Date(dateInput);
    if (!isNaN(d.getTime())) {
      // Successfully parsed the date string
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      return { month: monthNames[d.getMonth()], day: String(d.getDate()) };
    }
  }
  // Fallback if conversion fails or input is not recognized
  return { month: "Invalid", day: "Date" };
};

/**
 * Formats a file size to a string with the format "B", "KB", "MB", etc.
 * @param bytes - The file size in bytes
 * @returns A string with the format "B", "KB", "MB", etc.
 */
export const formatFileSize = (bytes: number) => {
  if (!bytes || bytes === 0) return "0 B";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

/**
 * Fetches a user profile by user ID
 * @param userId - The ID of the user to fetch
 * @returns A user profile object or null
 * */
export const getUserProfileById = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};
