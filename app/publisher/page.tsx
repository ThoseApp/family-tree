"use client";

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
import { NoticeBoardStatusEnum, EventStatusEnum } from "@/lib/constants/enums";

const PublisherDashboard = () => {
  // State for dashboard statistics
  const [stats, setStats] = useState({
    pendingNotices: 0,
    pendingEvents: 0,
    publishedNoticesThisMonth: 0,
    publicEvents: 0,
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

      // Fetch pending events count
      const { count: pendingEventsCount, error: eventsError } = await supabase
        .from("events")
        .select("*", { count: "exact", head: true })
        .eq("status", EventStatusEnum.pending);

      if (eventsError) throw eventsError;

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

      // Fetch public events count
      const { count: publicEventsCount, error: publicEventsError } =
        await supabase
          .from("events")
          .select("*", { count: "exact", head: true })
          .eq("status", EventStatusEnum.approved)
          .eq("is_public", true);

      if (publicEventsError) throw publicEventsError;

      // Update state with fetched data
      setStats({
        pendingNotices: pendingNoticesCount || 0,
        pendingEvents: pendingEventsCount || 0,
        publishedNoticesThisMonth: publishedThisMonthCount || 0,
        publicEvents: publicEventsCount || 0,
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
          table: "events",
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
    <div className="flex flex-col gap-y-8 lg:gap-y-12">
      {/* HEADER SECTION */}
      <div className="flex md:items-center md:flex-row flex-col md:justify-between gap-y-4">
        <div>
          <h1 className="text-2xl font-semibold">Welcome back, Publisher</h1>
          <p className="text-gray-600 text-sm">
            Manage notice board posts and public events for the family
            community.
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
              Pending Events
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingEvents}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingEvents === 0 ? "No events" : "Events to review"}
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
            <CardTitle className="text-sm font-medium">Public Events</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.publicEvents}</div>
            <p className="text-xs text-muted-foreground">Active events</p>
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
              <Calendar className="h-5 w-5" />
              Event Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Create public events and review submissions from family members.
            </p>
            <div className="flex gap-2">
              <Button asChild>
                <Link href="/publisher/events">Manage Events</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/publisher/event-requests">
                  View Requests ({stats.pendingEvents})
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
              variant={stats.pendingEvents > 0 ? "default" : "outline"}
              className="h-auto p-4 flex flex-col items-start gap-2"
              asChild
            >
              <Link href="/publisher/event-requests">
                <div className="flex items-center gap-2 w-full">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">Review Events</span>
                  {stats.pendingEvents > 0 && (
                    <span className="ml-auto bg-primary-foreground text-primary px-2 py-1 rounded-full text-xs">
                      {stats.pendingEvents}
                    </span>
                  )}
                </div>
                <p className="text-sm text-left opacity-80">
                  {stats.pendingEvents === 0
                    ? "All events reviewed"
                    : `${stats.pendingEvents} event${
                        stats.pendingEvents !== 1 ? "s" : ""
                      } need review`}
                </p>
              </Link>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start gap-2"
              asChild
            >
              <Link href="/publisher/notice-board">
                <div className="flex items-center gap-2 w-full">
                  <FileText className="h-4 w-4" />
                  <span className="font-medium">Create Notice</span>
                </div>
                <p className="text-sm text-left opacity-80">
                  Post a new notice for the family
                </p>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PublisherDashboard;
