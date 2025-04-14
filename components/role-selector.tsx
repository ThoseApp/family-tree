"use client"

import { useUserRole } from "@/components/user-role-context"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function RoleSelector() {
  const { userRole, setUserRole } = useUserRole()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          Change Role (Demo)
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setUserRole("admin")}>Admin {userRole === "admin" && "✓"}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setUserRole("editor")}>Editor {userRole === "editor" && "✓"}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setUserRole("user")}>User {userRole === "user" && "✓"}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
