"use client";

import ClientMetadata from "@/components/seo/client-metadata";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Calendar,
  Users,
  MessageSquare,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { LoadingIcon } from "@/components/loading-icon";
import { toast } from "sonner";
import {
  NoticeBoardStatusEnum,
  GalleryStatusEnum,
} from "@/lib/constants/enums";

const PublisherDashboard = () => {
  // State for dashboard statistics
  const [stats, setStats] = useState({
    pendingNotices: 0,
    pendingGallery: 0,
    publishedNoticesThisMonth: 0,
    approvedGallery: 0,
  });
  const [loading, setLoading] = useState(true);

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      // Fetch pending notice boards count
      const { count: pendingNoticesCount, error: noticesError } = await supabase
        .from("notice_boards")
        .select("*", { count: "exact", head: true })
        .eq("status", NoticeBoardStatusEnum.pending);

      if (noticesError) throw noticesError;

      // Fetch pending gallery count
      const { count: pendingGalleryCount, error: galleryError } = await supabase
        .from("galleries")
        .select("*", { count: "exact", head: true })
        .eq("status", GalleryStatusEnum.pending);

      if (galleryError) throw galleryError;

      // Fetch published notices this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: publishedThisMonthCount, error: publishedError } =
        await supabase
          .from("notice_boards")
          .select("*", { count: "exact", head: true })
          .eq("status", NoticeBoardStatusEnum.approved)
          .gte("created_at", startOfMonth.toISOString());

      if (publishedError) throw publishedError;

      // Fetch approved gallery count
      const { count: approvedGalleryCount, error: approvedGalleryError } =
        await supabase
          .from("galleries")
          .select("*", { count: "exact", head: true })
          .eq("status", GalleryStatusEnum.approved);

      if (approvedGalleryError) throw approvedGalleryError;

      // Update state with fetched data
      setStats({
        pendingNotices: pendingNoticesCount || 0,
        pendingGallery: pendingGalleryCount || 0,
        publishedNoticesThisMonth: publishedThisMonthCount || 0,
        approvedGallery: approvedGalleryCount || 0,
      });
    } catch (error: any) {
      console.error("Error fetching dashboard stats:", error);
      toast.error("Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();

    // Set up real-time subscription for updates
    const channel = supabase
      .channel("publisher-dashboard-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notice_boards",
        },
        () => {
          fetchDashboardStats();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "galleries",
        },
        () => {
          fetchDashboardStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingIcon className="h-8 w-8" />
      </div>
    );
  }

  return (
    <>
      <ClientMetadata
        title="Publisher Dashboard - Content Management"
        description="Publisher dashboard for managing Mosuro family content. Create and moderate notice board posts, manage photo galleries, and publish family updates."
        keywords={["publisher", "content management", "moderation"]}
        noIndex={true}
      />
      <div className="flex flex-col gap-y-8 lg:gap-y-12">
        {/* HEADER SECTION */}
        <div className="flex md:items-center md:flex-row flex-col md:justify-between gap-y-4">
          <div>
            <h1 className="text-2xl font-semibold">Welcome back, Publisher</h1>
            <p className="text-gray-600 text-sm">
              Manage notice board posts and family gallery for the community.
            </p>
          </div>
        </div>

        {/* QUICK STATS */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Notices
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingNotices}</div>
              <p className="text-xs text-muted-foreground">
                {stats.pendingNotices === 0
                  ? "No notices"
                  : "Awaiting your approval"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Gallery
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingGallery}</div>
              <p className="text-xs text-muted-foreground">
                {stats.pendingGallery === 0 ? "No photos" : "Photos to review"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Published Notices
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.publishedNoticesThisMonth}
              </div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Approved Gallery
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.approvedGallery}</div>
              <p className="text-xs text-muted-foreground">Published photos</p>
            </CardContent>
          </Card>
        </div>

        {/* MAIN ACTIONS */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Notice Board Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Create new notices and approve pending submissions from family
                members.
              </p>
              <div className="flex gap-2">
                <Button asChild>
                  <Link href="/publisher/notice-board">Manage Notices</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/publisher/notice-board-requests">
                    View Requests ({stats.pendingNotices})
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Gallery Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Manage family photos and review submissions from family members.
              </p>
              <div className="flex gap-2">
                <Button asChild>
                  <Link href="/publisher/gallery">Manage Gallery</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/publisher/gallery-requests">
                    View Requests ({stats.pendingGallery})
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RECENT ACTIVITY SUMMARY */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Button
                variant={stats.pendingNotices > 0 ? "default" : "outline"}
                className="h-auto p-4 flex flex-col items-start gap-2"
                asChild
              >
                <Link href="/publisher/notice-board-requests">
                  <div className="flex items-center gap-2 w-full">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">Review Notices</span>
                    {stats.pendingNotices > 0 && (
                      <span className="ml-auto bg-primary-foreground text-primary px-2 py-1 rounded-full text-xs">
                        {stats.pendingNotices}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-left opacity-80">
                    {stats.pendingNotices === 0
                      ? "All notices reviewed"
                      : `${stats.pendingNotices} notice${
                          stats.pendingNotices !== 1 ? "s" : ""
                        } awaiting approval`}
                  </p>
                </Link>
              </Button>

              <Button
                variant={stats.pendingGallery > 0 ? "default" : "outline"}
                className="h-auto p-4 flex flex-col items-start gap-2"
                asChild
              >
                <Link href="/publisher/gallery-requests">
                  <div className="flex items-center gap-2 w-full">
                    <MessageSquare className="h-4 w-4" />
                    <span className="font-medium">Review Gallery</span>
                    {stats.pendingGallery > 0 && (
                      <span className="ml-auto bg-primary-foreground text-primary px-2 py-1 rounded-full text-xs">
                        {stats.pendingGallery}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-left opacity-80">
                    {stats.pendingGallery === 0
                      ? "All photos reviewed"
                      : `${stats.pendingGallery} photo${
                          stats.pendingGallery !== 1 ? "s" : ""
                        } need review`}
                  </p>
                </Link>
              </Button>

              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-start gap-2"
                asChild
              >
                <Link href="/publisher/gallery">
                  <div className="flex items-center gap-2 w-full">
                    <MessageSquare className="h-4 w-4" />
                    <span className="font-medium">Manage Gallery</span>
                  </div>
                  <p className="text-sm text-left opacity-80">
                    Upload and organize family photos
                  </p>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default PublisherDashboard;
