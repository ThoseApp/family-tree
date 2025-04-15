import Header from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Settings() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Settings" />
      <div className="flex-1 p-4 md:p-6">
        <Tabs defaultValue="account">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-64">
              <TabsList className="flex flex-col items-start h-auto p-0 bg-transparent">
                <TabsTrigger
                  value="account"
                  className="w-full justify-start px-3 py-2 data-[state=active]:bg-gray-100 rounded-md"
                >
                  Account
                </TabsTrigger>
                <TabsTrigger
                  value="notifications"
                  className="w-full justify-start px-3 py-2 data-[state=active]:bg-gray-100 rounded-md"
                >
                  Notifications
                </TabsTrigger>
                <TabsTrigger
                  value="privacy"
                  className="w-full justify-start px-3 py-2 data-[state=active]:bg-gray-100 rounded-md"
                >
                  Privacy
                </TabsTrigger>
                <TabsTrigger
                  value="appearance"
                  className="w-full justify-start px-3 py-2 data-[state=active]:bg-gray-100 rounded-md"
                >
                  Appearance
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1">
              <TabsContent value="account">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>Manage your account information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" defaultValue="John Smith" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" defaultValue="john.smith@example.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input id="password" type="password" defaultValue="********" />
                    </div>
                    <Button>Save Changes</Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Settings</CardTitle>
                    <CardDescription>Manage how you receive notifications</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      "Email Notifications",
                      "Push Notifications",
                      "Event Reminders",
                      "New Member Alerts",
                      "Comment Notifications",
                    ].map((item) => (
                      <div key={item} className="flex items-center justify-between">
                        <Label htmlFor={item.toLowerCase().replace(/\s+/g, "-")}>{item}</Label>
                        <Switch id={item.toLowerCase().replace(/\s+/g, "-")} defaultChecked={true} />
                      </div>
                    ))}
                    <Button>Save Preferences</Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="privacy">
                <Card>
                  <CardHeader>
                    <CardTitle>Privacy Settings</CardTitle>
                    <CardDescription>Control your privacy preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      "Profile Visibility",
                      "Show Birthday",
                      "Show Contact Information",
                      "Allow Tagging",
                      "Share Activity",
                    ].map((item) => (
                      <div key={item} className="flex items-center justify-between">
                        <Label htmlFor={item.toLowerCase().replace(/\s+/g, "-")}>{item}</Label>
                        <Switch
                          id={item.toLowerCase().replace(/\s+/g, "-")}
                          defaultChecked={item === "Profile Visibility"}
                        />
                      </div>
                    ))}
                    <Button>Update Privacy</Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="appearance">
                <Card>
                  <CardHeader>
                    <CardTitle>Appearance Settings</CardTitle>
                    <CardDescription>Customize how the app looks</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Theme</Label>
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1">
                          Light
                        </Button>
                        <Button variant="outline" className="flex-1">
                          Dark
                        </Button>
                        <Button variant="outline" className="flex-1">
                          System
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Font Size</Label>
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1">
                          Small
                        </Button>
                        <Button variant="outline" className="flex-1">
                          Medium
                        </Button>
                        <Button variant="outline" className="flex-1">
                          Large
                        </Button>
                      </div>
                    </div>
                    <Button>Save Preferences</Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
