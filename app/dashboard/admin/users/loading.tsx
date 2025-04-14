import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function UserManagementLoading() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b border-gray-200 bg-white">
        <div className="flex h-16 items-center px-4 md:px-6">
          <Skeleton className="h-8 w-40" />
          <div className="ml-auto flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>
      </header>
      <div className="flex-1 p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-9 w-32" />
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">
                      <Skeleton className="h-5 w-16" />
                    </th>
                    <th className="text-left py-3 px-4">
                      <Skeleton className="h-5 w-16" />
                    </th>
                    <th className="text-left py-3 px-4">
                      <Skeleton className="h-5 w-16" />
                    </th>
                    <th className="text-left py-3 px-4">
                      <Skeleton className="h-5 w-16" />
                    </th>
                    <th className="text-right py-3 px-4">
                      <Skeleton className="h-5 w-16 ml-auto" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <Skeleton className="h-5 w-24" />
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Skeleton className="h-5 w-32" />
                      </td>
                      <td className="py-3 px-4">
                        <Skeleton className="h-5 w-16" />
                      </td>
                      <td className="py-3 px-4">
                        <Skeleton className="h-5 w-16" />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Skeleton className="h-8 w-8" />
                          <Skeleton className="h-8 w-8" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
