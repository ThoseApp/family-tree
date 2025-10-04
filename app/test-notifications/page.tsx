"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  testAdminNotificationSystem,
  quickAdminNotificationTest,
} from "@/lib/utils/test-admin-notifications";
import {
  debugNotificationFlow,
  testAdminNotification,
  checkAdminCount,
} from "@/lib/utils/debug-notifications";
import {
  debugCurrentUserMetadata,
  debugAllUsersAdminStatus,
  setCurrentUserAsAdmin,
} from "@/lib/utils/admin-metadata-debug";

interface TestResults {
  currentUserIsAdmin: boolean;
  sessionValid: boolean;
  adminUsersFound: number;
  apiRouteWorking: boolean;
  notificationCreated: boolean;
  notificationInDatabase: boolean;
  errors: string[];
}

export default function TestNotificationsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<TestResults | null>(null);
  const [adminCount, setAdminCount] = useState<number | null>(null);

  const runComprehensiveTest = async () => {
    setIsLoading(true);
    try {
      const results = await testAdminNotificationSystem();
      setTestResults(results);
    } catch (error) {
      console.error("Test failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const runQuickTest = async () => {
    setIsLoading(true);
    try {
      await quickAdminNotificationTest();
    } catch (error) {
      console.error("Quick test failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const runDebugFlow = async () => {
    setIsLoading(true);
    try {
      await debugNotificationFlow();
    } catch (error) {
      console.error("Debug flow failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkAdmins = async () => {
    setIsLoading(true);
    try {
      const count = await checkAdminCount();
      setAdminCount(count);
    } catch (error) {
      console.error("Admin count check failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestNotification = async () => {
    setIsLoading(true);
    try {
      await testAdminNotification(
        "Manual Test Notification",
        "This notification was sent manually from the test page."
      );
    } catch (error) {
      console.error("Manual test notification failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const debugUserMetadata = async () => {
    setIsLoading(true);
    try {
      await debugCurrentUserMetadata();
    } catch (error) {
      console.error("Debug user metadata failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const debugAllUsers = async () => {
    setIsLoading(true);
    try {
      await debugAllUsersAdminStatus();
    } catch (error) {
      console.error("Debug all users failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fixCurrentUserAdmin = async () => {
    setIsLoading(true);
    try {
      const success = await setCurrentUserAsAdmin();
      if (success) {
        alert(
          "User set as admin! Please refresh the page and try the test again."
        );
      }
    } catch (error) {
      console.error("Fix current user admin failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">
          Admin Notification System Test
        </h1>
        <p className="text-muted-foreground">
          Use this page to test and debug the multi-admin notification system.
          Check the browser console for detailed logs.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Test Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Test Controls</CardTitle>
            <CardDescription>
              Run various tests to verify the notification system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={runComprehensiveTest}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Running..." : "Run Comprehensive Test"}
            </Button>

            <Button
              onClick={runQuickTest}
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              {isLoading ? "Running..." : "Quick Test"}
            </Button>

            <Button
              onClick={runDebugFlow}
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              {isLoading ? "Running..." : "Debug Flow"}
            </Button>

            <Button
              onClick={checkAdmins}
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              {isLoading ? "Checking..." : "Check Admin Count"}
            </Button>

            <Button
              onClick={sendTestNotification}
              disabled={isLoading}
              variant="secondary"
              className="w-full"
            >
              {isLoading ? "Sending..." : "Send Test Notification"}
            </Button>
          </CardContent>
        </Card>

        {/* Debug Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Debug Controls</CardTitle>
            <CardDescription>
              Debug user metadata and admin status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={debugUserMetadata}
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              {isLoading ? "Checking..." : "Debug Current User"}
            </Button>

            <Button
              onClick={debugAllUsers}
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              {isLoading ? "Checking..." : "Debug All Users"}
            </Button>

            <Button
              onClick={fixCurrentUserAdmin}
              disabled={isLoading}
              variant="destructive"
              className="w-full"
            >
              {isLoading ? "Fixing..." : "Set Current User as Admin"}
            </Button>
          </CardContent>
        </Card>

        {/* Quick Status */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Status</CardTitle>
            <CardDescription>Current system status at a glance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {adminCount !== null && (
              <div className="flex items-center justify-between">
                <span>Admin Users Found:</span>
                <Badge variant={adminCount > 0 ? "default" : "destructive"}>
                  {adminCount}
                </Badge>
              </div>
            )}

            <div className="text-sm text-muted-foreground">
              Open browser console (F12) to see detailed logs and test results.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Results */}
      {testResults && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Comprehensive Test Results</CardTitle>
            <CardDescription>
              Detailed results from the last comprehensive test
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Current User is Admin:</span>
                  <Badge
                    variant={
                      testResults.currentUserIsAdmin ? "default" : "secondary"
                    }
                  >
                    {testResults.currentUserIsAdmin ? "Yes" : "No"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span>Session Valid:</span>
                  <Badge
                    variant={
                      testResults.sessionValid ? "default" : "destructive"
                    }
                  >
                    {testResults.sessionValid ? "Yes" : "No"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span>Admin Users Found:</span>
                  <Badge
                    variant={
                      testResults.adminUsersFound > 0
                        ? "default"
                        : "destructive"
                    }
                  >
                    {testResults.adminUsersFound}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>API Route Working:</span>
                  <Badge
                    variant={
                      testResults.apiRouteWorking ? "default" : "destructive"
                    }
                  >
                    {testResults.apiRouteWorking ? "Yes" : "No"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span>Notification Created:</span>
                  <Badge
                    variant={
                      testResults.notificationCreated
                        ? "default"
                        : "destructive"
                    }
                  >
                    {testResults.notificationCreated ? "Yes" : "No"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span>Notification in DB:</span>
                  <Badge
                    variant={
                      testResults.notificationInDatabase
                        ? "default"
                        : "destructive"
                    }
                  >
                    {testResults.notificationInDatabase ? "Yes" : "No"}
                  </Badge>
                </div>
              </div>
            </div>

            {testResults.errors.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold text-destructive mb-2">
                  Errors Found:
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {testResults.errors.map((error, index) => (
                    <li key={index} className="text-destructive">
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">How to use this test page:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Open the browser console (F12) to see detailed logs</li>
              <li>
                Click &quot; Debug Current User&quot; to check your user
                metadata
              </li>
              <li>
                If you&apos;re not an admin, click &quot;Set Current User as
                Admin&quot;
              </li>
              <li>
                Click &quot;Debug All Users&quot; to see all users and their
                admin status
              </li>
              <li>
                Click &quot;Run Comprehensive Test&quot; to test the entire
                system
              </li>
              <li>Check the results and console logs for any issues</li>
            </ol>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Common issues and solutions:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>
                <strong>API route not working:</strong> Check authentication and
                server logs
              </li>
              <li>
                <strong>Session invalid:</strong> Try logging out and back in
              </li>
              <li>
                <strong>Notifications not created:</strong> Check database
                permissions and RPC functions
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
