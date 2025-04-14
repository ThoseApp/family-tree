import Header from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, Plus, Download } from "lucide-react"

export default function FamilyTree() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Family Tree" />
      <div className="flex-1 p-4 md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon">
              <ZoomIn className="h-4 w-4" />
              <span className="sr-only">Zoom In</span>
            </Button>
            <Button variant="outline" size="icon">
              <ZoomOut className="h-4 w-4" />
              <span className="sr-only">Zoom Out</span>
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="h-[calc(100vh-200px)] min-h-[400px] bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 bg-white rounded-full border-2 border-primary flex items-center justify-center mb-2">
                    <p className="font-bold">John Smith</p>
                  </div>
                  <div className="w-0.5 h-8 bg-gray-300"></div>
                </div>

                <div className="flex justify-center gap-16 mt-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div className="w-24 h-24 bg-white rounded-full border border-gray-300 flex items-center justify-center mb-2">
                        <p className="font-medium text-sm">
                          Family
                          <br />
                          Member {i}
                        </p>
                      </div>
                      <div className="w-0.5 h-8 bg-gray-300"></div>

                      <div className="flex justify-center gap-8 mt-2">
                        {[1, 2].map((j) => (
                          <div key={j} className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-white rounded-full border border-gray-300 flex items-center justify-center">
                              <p className="font-medium text-xs">
                                Member
                                <br />
                                {i}.{j}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
