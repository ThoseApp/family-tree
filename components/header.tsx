"use client"

import { Bell, Heart, MessageSquare } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import MobileSidebar from "@/components/mobile-sidebar"
import { useUserRole } from "@/components/user-role-context"

interface HeaderProps {
  title: string
}

export default function Header({ title }: HeaderProps) {
  const { userRole } = useUserRole()

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="flex h-16 items-center px-4 md:px-6">
        <MobileSidebar />
        <h1 className="text-xl font-semibold md:text-2xl">{title}</h1>

        {userRole && (
          <div className="ml-4 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
            {userRole.toUpperCase()}
          </div>
        )}

        <div className="ml-auto flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-gray-700">
            <MessageSquare className="h-5 w-5" />
            <span className="sr-only">Messages</span>
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-700">
            <Heart className="h-5 w-5" />
            <span className="sr-only">Favorites</span>
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-700">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>
          <Avatar>
            <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User" />
            <AvatarFallback>US</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
