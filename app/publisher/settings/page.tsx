"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Shield, FileText, Calendar } from "lucide-react";

const PublisherSettingsPage = () => {
  return (
    <div className="flex flex-col gap-y-8 lg:gap-y-12">
      {/* HEADER SECTION */}
      <div>
        <h1 className="text-2xl font-semibold">Publisher Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your publisher preferences and view your permissions.
        </p>
      </div>

      {/* ROLE INFORMATION */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Your Publisher Role
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Publisher
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              You have publisher permissions and can manage content for the
              family community.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* PERMISSIONS */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Your Permissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium">Notice Board Management</h4>
                <p className="text-sm text-muted-foreground">
                  Create notices that are automatically approved and manage
                  pending submissions from family members.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium">Events Management</h4>
                <p className="text-sm text-muted-foreground">
                  Create public events and approve event submissions from family
                  members.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PUBLISHER GUIDELINES */}
      <Card>
        <CardHeader>
          <CardTitle>Publisher Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Content Standards</h4>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>
                • Ensure all content is appropriate for all family members
              </li>
              <li>
                • Verify information accuracy before approving submissions
              </li>
              <li>• Maintain respectful and inclusive communication</li>
              <li>• Follow family community guidelines</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2">Approval Process</h4>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Review submissions promptly</li>
              <li>• Provide clear feedback for rejections</li>
              <li>• Contact administrators for technical issues</li>
              <li>• Report inappropriate content immediately</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PublisherSettingsPage;
