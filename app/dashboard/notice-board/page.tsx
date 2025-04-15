import Header from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, MessageSquare, Heart } from "lucide-react"

export default function NoticeBoard() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Notice Board" />
      <div className="flex-1 p-4 md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Announcements & Updates</h2>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </div>

        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src={`/placeholder.svg?height=40&width=40&text=${i}`} alt="User" />
                    <AvatarFallback>U{i}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">Family Member {i}</CardTitle>
                    <p className="text-sm text-gray-500">Posted 2 days ago</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Important announcement {i}: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas congue
                  srcu quis turpis is tintinduct, ur feugat saplen vairus.
                </p>
                {i % 2 === 0 && (
                  <div className="mt-4 aspect-video bg-gray-100 rounded-md flex items-center justify-center">
                    <p className="text-gray-400">Image {i}</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t pt-4 flex gap-4">
                <Button variant="ghost" size="sm">
                  <Heart className="h-4 w-4 mr-2" />
                  Like
                </Button>
                <Button variant="ghost" size="sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Comment
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
