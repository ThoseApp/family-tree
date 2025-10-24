import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  GalleryStatusEnum,
  NoticeBoardStatusEnum,
  EventStatusEnum,
} from "@/lib/constants/enums";

interface PendingCounts {
  galleryRequests: number;
  noticeBoardRequests: number;
  eventRequests: number;
  memberRequests: number;
  familyMemberRequests: number;
}

/**
 * Hook to fetch counts of pending requests for admin/publisher sidebars
 */
export function usePendingCounts() {
  const [counts, setCounts] = useState<PendingCounts>({
    galleryRequests: 0,
    noticeBoardRequests: 0,
    eventRequests: 0,
    memberRequests: 0,
    familyMemberRequests: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced fetch function to prevent too many rapid updates
  const debouncedFetchCounts = useCallback(() => {
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new timeout
    debounceTimeoutRef.current = setTimeout(() => {
      fetchCounts();
    }, 300); // 300ms debounce
  }, []);

  const fetchCounts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all counts in parallel
      const [
        galleryResult,
        noticeBoardResult,
        eventResult,
        memberRequestResult,
        familyMemberRequestResult,
      ] = await Promise.all([
        // Gallery requests (pending status)
        supabase
          .from("galleries")
          .select("id", { count: "exact", head: true })
          .eq("status", GalleryStatusEnum.pending),

        // Notice board requests (pending status)
        supabase
          .from("notice_boards")
          .select("id", { count: "exact", head: true })
          .eq("status", NoticeBoardStatusEnum.pending),

        // Event requests (pending status)
        supabase
          .from("events")
          .select("id", { count: "exact", head: true })
          .eq("status", EventStatusEnum.pending),

        // Member requests (pending status from profiles table)
        supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),

        // Family member requests (pending status)
        supabase
          .from("family_member_requests")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),
      ]);

      // Check for errors
      if (galleryResult.error) throw galleryResult.error;
      if (noticeBoardResult.error) throw noticeBoardResult.error;
      if (eventResult.error) throw eventResult.error;
      if (memberRequestResult.error) throw memberRequestResult.error;
      if (familyMemberRequestResult.error)
        throw familyMemberRequestResult.error;

      // Update counts
      setCounts({
        galleryRequests: galleryResult.count || 0,
        noticeBoardRequests: noticeBoardResult.count || 0,
        eventRequests: eventResult.count || 0,
        memberRequests: memberRequestResult.count || 0,
        familyMemberRequests: familyMemberRequestResult.count || 0,
      });
    } catch (err: any) {
      console.error("Error fetching pending counts:", err);
      setError(err.message || "Failed to fetch pending counts");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCounts();

    // Set up real-time subscriptions for count updates
    // Listen to ALL changes on these tables, not just pending items
    // This ensures we catch status changes from pending to approved/declined
    const gallerySubscription = supabase
      .channel("gallery-counts")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "galleries",
        },
        (payload) => {
          console.log("Gallery change detected:", payload);
          debouncedFetchCounts();
        }
      )
      .subscribe();

    const noticeBoardSubscription = supabase
      .channel("notice-board-counts")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notice_boards",
        },
        (payload) => {
          console.log("Notice board change detected:", payload);
          debouncedFetchCounts();
        }
      )
      .subscribe();

    const eventSubscription = supabase
      .channel("event-counts")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "events",
        },
        (payload) => {
          console.log("Event change detected:", payload);
          debouncedFetchCounts();
        }
      )
      .subscribe();

    const memberRequestSubscription = supabase
      .channel("member-request-counts")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
        },
        (payload) => {
          console.log("Profile change detected:", payload);
          debouncedFetchCounts();
        }
      )
      .subscribe();

    const familyMemberRequestSubscription = supabase
      .channel("family-member-request-counts")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "family_member_requests",
        },
        (payload) => {
          console.log("Family member request change detected:", payload);
          debouncedFetchCounts();
        }
      )
      .subscribe();

    // Cleanup subscriptions and debounce timeout
    return () => {
      gallerySubscription.unsubscribe();
      noticeBoardSubscription.unsubscribe();
      eventSubscription.unsubscribe();
      memberRequestSubscription.unsubscribe();
      familyMemberRequestSubscription.unsubscribe();

      // Clear debounce timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return {
    counts,
    isLoading,
    error,
    refetch: fetchCounts,
  };
}

/**
 * Hook to get count for a specific request type by path
 */
export function useCountForPath(path: string) {
  const { counts, isLoading, error } = usePendingCounts();

  const getCountForPath = (pathname: string): number => {
    switch (pathname) {
      case "/admin/gallery-requests":
      case "/publisher/gallery-requests":
        return counts.galleryRequests;
      case "/admin/notice-board-requests":
      case "/publisher/notice-board-requests":
        return counts.noticeBoardRequests;
      case "/admin/events":
        return counts.eventRequests;
      case "/admin/family-member-requests":
        return counts.memberRequests;
      case "/admin/family-member-requests":
        return counts.familyMemberRequests;
      default:
        return 0;
    }
  };

  return {
    count: getCountForPath(path),
    isLoading,
    error,
  };
}
