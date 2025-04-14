import Header from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import RoleSelector from "@/components/role-selector"

export default function Dashboard() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Overview" />
      <div className="flex-1 p-4 md:p-6">
        <div className="flex justify-end mb-4">
          <RoleSelector />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Family Members</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">24</p>
              <p className="text-sm text-gray-500">Active members in your family</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">3</p>
              <p className="text-sm text-gray-500">Events in the next 30 days</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>New Photos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">17</p>
              <p className="text-sm text-gray-500">Photos added this month</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Sarah Johnson added new photos to the Family Reunion album</p>
                      <p className="text-sm text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
