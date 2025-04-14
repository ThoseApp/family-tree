import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import Header from "@/components/header"

export default function Profile() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Profile" />
      <div className="flex-1 p-4 md:p-6">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 md:h-20 md:w-20">
                  <AvatarImage src="/placeholder.svg?height=80&width=80" alt="John Smith" />
                  <AvatarFallback>JS</AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold">John Smith</h2>
              </div>
              <Button variant="outline">Edit Profile</Button>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Basic Information</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium">John Smith</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date of Birth</p>
                    <p className="font-medium">December 3, 1960</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Gender</p>
                    <p className="font-medium">Male</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="font-medium">
                      1234-567-8900 <span className="text-gray-400">(Optional)</span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Occupation</p>
                    <p className="font-medium">
                      Neurosurgeon <span className="text-gray-400">(Optional)</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Marital Status</p>
                    <p className="font-medium">Married</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t pt-8">
              <h3 className="text-xl font-semibold mb-4">Biography</h3>
              <p className="text-gray-700">
                Lorem ipsum dolor sit amet, conscettetetur adipiscing elit. Maecenas congue srcu quis turpis is
                tintinduct, ur feugat saplen vairus. Lorem ipsum dolor sit amet, conscettetetur adipiscing elit.
                Maecenas congue srcu quis turpis is tintinduct, ur feugat saplen vairus. Lorem ipsum dolor sit amet,
                conscettetetur adipiscing elit. Maecenas congue srcu quis turpis is tintinduct, ur feugat saplen vairus.
                Lorem ipsum dolor sit amet, conscettetetur adipiscing elit. Maecenas congue srcu quis turpis is
                tintinduct, ur feugat saplen vairus. Lorem ipsum dolor sit amet, conscettetetur adipiscing elit.
                Maecenas congue srcu quis turpis is tintinduct, ur feugat saplen vairus. Lorem ipsum dolor sit amet,
                conscettetetur adipiscing elit. Maecenas congue srcu quis turpis is tintinduct, ur feugat saplen vairus.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
