"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CountBadge } from "@/components/ui/count-badge";
import { usePendingCounts } from "@/hooks/use-pending-counts";
import { Badge } from "@/components/ui/badge";
import {
  testGalleryCountUpdate,
  testRealtimeSubscription,
} from "@/lib/utils/test-realtime-counts";

export default function TestCountsPage() {
  const { counts, isLoading, error, refetch } = usePendingCounts();
  const [testCount, setTestCount] = useState(5);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="text-center">Loading counts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="text-center text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Count Badges Test</h1>

      <div className="grid gap-6">
        {/* Current Counts */}
        <Card>
          <CardHeader>
            <CardTitle>Current Pending Counts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Gallery Requests:</span>
              {/* <CountBadge count={counts.galleryRequests} /> */}
            </div>
            <div className="flex items-center justify-between">
              <span>Notice Board Requests:</span>
              {/* <CountBadge count={counts.noticeBoardRequests} /> */}
            </div>
            <div className="flex items-center justify-between">
              <span>Event Requests:</span>
              {/* <CountBadge count={counts.eventRequests} /> */}
            </div>
            <div className="flex items-center justify-between">
              <span>Member Requests:</span>
              {/* <CountBadge count={counts.memberRequests} /> */}
            </div>
            <div className="flex items-center justify-between">
              <span>Family Member Requests:</span>
              {/* <CountBadge count={counts.familyMemberRequests} /> */}
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={refetch} className="flex-1">
                Refresh Counts
              </Button>
              <Button
                onClick={testGalleryCountUpdate}
                variant="outline"
                className="flex-1"
              >
                Test Real-time
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Badge Variants */}
        <Card>
          <CardHeader>
            <CardTitle>Badge Variants & Sizes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Variants</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span>Default:</span>
                  {/* <CountBadge count={testCount} variant="default" /> */}
                </div>
                <div className="flex items-center gap-2">
                  <span>Secondary:</span>
                  {/* <CountBadge count={testCount} variant="secondary" /> */}
                </div>
                <div className="flex items-center gap-2">
                  <span>Outline:</span>
                  {/* <CountBadge count={testCount} variant="outline" /> */}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Sizes</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span>Small:</span>
                  {/* <CountBadge count={testCount} size="sm" /> */}
                </div>
                <div className="flex items-center gap-2">
                  <span>Medium:</span>
                  {/* <CountBadge count={testCount} size="md" /> */}
                </div>
                <div className="flex items-center gap-2">
                  <span>Large:</span>
                  {/* <CountBadge count={testCount} size="lg" /> */}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Edge Cases</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span>Zero (hidden):</span>
                  {/* <CountBadge count={0} /> */}
                  <span>← Should be hidden</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>Zero (shown):</span>
                  {/* <CountBadge count={0} showZero /> */}
                </div>
                <div className="flex items-center gap-2">
                  <span>High count:</span>
                  {/* <CountBadge count={150} /> */}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button
                onClick={() => setTestCount((prev) => Math.max(0, prev - 1))}
                variant="outline"
              >
                -
              </Button>
              <span>Test Count: {testCount}</span>
              <Button
                onClick={() => setTestCount((prev) => prev + 1)}
                variant="outline"
              >
                +
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Sidebar Menu Item Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-100">
                <div className="flex items-center">
                  <div className="w-5 h-5 bg-gray-400 rounded mr-3"></div>
                  <span>Gallery Requests</span>
                </div>
                {/* <CountBadge count={counts.galleryRequests} /> */}
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-100">
                <div className="flex items-center">
                  <div className="w-5 h-5 bg-gray-400 rounded mr-3"></div>
                  <span>Notice Board Requests</span>
                </div>
                {/* <CountBadge count={counts.noticeBoardRequests} /> */}
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-100">
                <div className="flex items-center">
                  <div className="w-5 h-5 bg-gray-400 rounded mr-3"></div>
                  <span>Event Requests</span>
                </div>
                {/* <CountBadge count={counts.eventRequests} /> */}
              </div>

              <div className="text-sm text-gray-600 mt-4 mb-2">
                Publisher Sidebar Preview:
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50">
                <div className="flex items-center">
                  <div className="w-5 h-5 bg-blue-400 rounded mr-3"></div>
                  <span>Gallery Requests (Publisher)</span>
                </div>
                {/* <CountBadge
                  count={counts.galleryRequests}
                  variant="secondary"
                /> */}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Raw Data */}
        <Card>
          <CardHeader>
            <CardTitle>Raw Count Data</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-lg text-sm">
              {JSON.stringify(counts, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
