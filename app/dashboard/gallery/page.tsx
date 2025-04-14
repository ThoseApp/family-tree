import Header from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus } from "lucide-react"

export default function Gallery() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Gallery" />
      <div className="flex-1 p-4 md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Family Photos</h2>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Upload Photos
          </Button>
        </div>

        <Tabs defaultValue="albums">
          <TabsList className="mb-4">
            <TabsTrigger value="albums">Albums</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
          </TabsList>

          <TabsContent value="albums">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {["Family Reunion", "Summer Vacation", "Holiday Party", "Wedding", "Birthday", "Graduation"].map(
                (album, i) => (
                  <Card key={album}>
                    <CardContent className="p-4">
                      <div className="aspect-square bg-gray-100 rounded-md mb-2 flex items-center justify-center">
                        <p className="text-gray-400">Album Cover</p>
                      </div>
                      <p className="font-medium">{album}</p>
                      <p className="text-sm text-gray-500">{10 + i} photos</p>
                    </CardContent>
                  </Card>
                ),
              )}
            </div>
          </TabsContent>

          <TabsContent value="recent">
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="aspect-square bg-gray-100 rounded-md flex items-center justify-center">
                  <p className="text-gray-400">Photo {i + 1}</p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="favorites">
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-square bg-gray-100 rounded-md flex items-center justify-center">
                  <p className="text-gray-400">Favorite {i + 1}</p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
