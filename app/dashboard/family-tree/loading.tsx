import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export default function FamilyTreeLoading() {
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
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-9 w-9" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="h-[calc(100vh-200px)] min-h-[400px] bg-gray-50 flex items-center justify-center">
              <Skeleton className="h-64 w-64 rounded-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
