"use client"

import { useSearchParams } from "next/navigation"
import Header from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"

export default function FamilyMembers() {
  // Add useSearchParams hook to properly trigger the suspense boundary
  const searchParams = useSearchParams()
  const query = searchParams.get("query") || ""

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Family Members" />
      <div className="flex-1 p-4 md:p-6">
        <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input type="search" placeholder="Search family members..." className="pl-8" defaultValue={query} />
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={`/placeholder.svg?height=64&width=64&text=${i + 1}`}
                      alt={`Family Member ${i + 1}`}
                    />
                    <AvatarFallback>FM{i + 1}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">Family Member {i + 1}</p>
                    <p className="text-sm text-gray-500">
                      Relation: {i % 3 === 0 ? "Sibling" : i % 3 === 1 ? "Parent" : "Cousin"}
                    </p>
                    <p className="text-sm text-gray-500">Age: {30 + i}</p>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Profile
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
