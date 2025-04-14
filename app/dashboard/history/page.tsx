import Header from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function History() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header title="History" />
      <div className="flex-1 p-4 md:p-6">
        <Tabs defaultValue="timeline">
          <TabsList className="mb-4">
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="stories">Stories</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="timeline">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Family Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {[1960, 1985, 1992, 2005, 2018].map((year) => (
                      <div key={year} className="relative pl-8 border-l-2 border-gray-200 pb-8">
                        <div className="absolute left-[-9px] top-0 h-4 w-4 rounded-full bg-primary" />
                        <div>
                          <p className="text-lg font-bold">{year}</p>
                          <p className="text-gray-700">Important family event that happened in {year}.</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="stories">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <CardTitle>Family Story {i}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas congue srcu quis turpis is
                      tintinduct, ur feugat saplen vairus.
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="documents">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="aspect-[3/4] bg-gray-100 rounded-md mb-2 flex items-center justify-center">
                      <p className="text-gray-400">Document {i}</p>
                    </div>
                    <p className="font-medium">Historical Document {i}</p>
                    <p className="text-sm text-gray-500">Added on Jan 15, 2023</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
