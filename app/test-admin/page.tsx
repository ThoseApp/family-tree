"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  fetchAllAdminUsers,
  isCurrentUserAdmin,
  getCurrentUserRole,
  createNotificationForAllAdmins,
  getAdminUserIds,
} from "@/lib/utils/multi-admin-helpers";

export default function TestAdminPage() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notificationTitle, setNotificationTitle] =
    useState("Test Notification");
  const [notificationBody, setNotificationBody] = useState(
    "This is a test notification to verify the multi-admin system."
  );

  const addResult = (result: string) => {
    setTestResults((prev) => [...prev, result]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const runAllTests = async () => {
    setIsLoading(true);
    clearResults();

    try {
      addResult("🧪 Starting Multi-Admin Tests...");

      // Test 1: Check admin status
      addResult("\n1️⃣ Testing admin status...");
      const isAdmin = await isCurrentUserAdmin();
      addResult(`   Current user is admin: ${isAdmin ? "✅ Yes" : "❌ No"}`);

      // Test 2: Get user role
      addResult("\n2️⃣ Testing role detection...");
      const role = await getCurrentUserRole();
      addResult(`   Current user role: ${role}`);

      // Test 3: Fetch admin users
      addResult("\n3️⃣ Testing admin user fetching...");
      try {
        const adminUsers = await fetchAllAdminUsers();
        addResult(`   ✅ Found ${adminUsers.length} admin user(s):`);
        adminUsers.forEach((admin, index) => {
          addResult(
            `      ${index + 1}. ${admin.email} (ID: ${admin.id.substring(
              0,
              8
            )}...)`
          );
        });

        // Test admin IDs
        const adminIds = await getAdminUserIds();
        addResult(`   ✅ Admin IDs count: ${adminIds.length}`);
      } catch (error) {
        addResult(`   ❌ Failed to fetch admin users: ${error}`);
      }

      // Test 4: Test notification (only if admin)
      if (isAdmin) {
        addResult("\n4️⃣ Testing notification creation...");
        try {
          const success = await createNotificationForAllAdmins({
            title: "Multi-Admin Test",
            body: "This is a test notification from the admin test page.",
            type: "system",
          });

          if (success) {
            addResult("   ✅ Test notification sent successfully!");
            toast.success("Test notification sent to all admins!");
          } else {
            addResult("   ❌ Failed to send test notification");
            toast.error("Failed to send test notification");
          }
        } catch (error) {
          addResult(`   ❌ Error creating notification: ${error}`);
          toast.error("Error creating notification");
        }
      } else {
        addResult("\n4️⃣ Skipping notification test (user is not admin)");
      }

      addResult("\n🎉 Tests completed!");
    } catch (error) {
      addResult(`❌ Test suite failed: ${error}`);
      toast.error("Test suite failed");
    } finally {
      setIsLoading(false);
    }
  };

  const sendCustomNotification = async () => {
    if (!notificationTitle.trim() || !notificationBody.trim()) {
      toast.error("Please enter both title and body for the notification");
      return;
    }

    setIsLoading(true);
    try {
      const success = await createNotificationForAllAdmins({
        title: notificationTitle,
        body: notificationBody,
        type: "system",
      });

      if (success) {
        toast.success("Custom notification sent to all admins!");
        addResult(`\n📧 Custom notification sent: "${notificationTitle}"`);
      } else {
        toast.error("Failed to send custom notification");
        addResult(
          `\n❌ Failed to send custom notification: "${notificationTitle}"`
        );
      }
    } catch (error) {
      toast.error("Error sending custom notification");
      addResult(`\n❌ Error sending custom notification: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Multi-Admin System Test</h1>

      <div className="grid gap-6">
        {/* Test Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Test Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button
                onClick={runAllTests}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? "Running Tests..." : "Run All Tests"}
              </Button>
              <Button
                onClick={clearResults}
                variant="outline"
                disabled={isLoading}
              >
                Clear Results
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Custom Notification */}
        <Card>
          <CardHeader>
            <CardTitle>Send Custom Notification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Notification Title"
              value={notificationTitle}
              onChange={(e) => setNotificationTitle(e.target.value)}
            />
            <Textarea
              placeholder="Notification Body"
              value={notificationBody}
              onChange={(e) => setNotificationBody(e.target.value)}
              rows={3}
            />
            <Button
              onClick={sendCustomNotification}
              disabled={isLoading}
              className="w-full"
            >
              Send to All Admins
            </Button>
          </CardContent>
        </Card>

        {/* Test Results */}
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 p-4 rounded-lg min-h-[300px] font-mono text-sm whitespace-pre-wrap">
              {testResults.length > 0
                ? testResults.join("\n")
                : 'No test results yet. Click "Run All Tests" to start.'}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
