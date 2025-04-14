import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function HistoryLoading() {
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
        <Skeleton className="h-10 w-64 mb-6" />

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="relative pl-8 border-l-2 border-gray-200 pb-8">
                    <div className="absolute left-[-9px] top-0 h-4 w-4 rounded-full bg-gray-200" />
                    <div>
                      <Skeleton className="h-6 w-16 mb-2" />
                      <Skeleton className="h-4 w-full max-w-md" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
