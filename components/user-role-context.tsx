"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type UserRole = "admin" | "editor" | "user" | null

interface UserRoleContextType {
  userRole: UserRole
  setUserRole: (role: UserRole) => void
}

const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined)

export function UserRoleProvider({ children }: { children: ReactNode }) {
  // Default to "user" role, but this would normally come from authentication
  const [userRole, setUserRole] = useState<UserRole>("user")

  return <UserRoleContext.Provider value={{ userRole, setUserRole }}>{children}</UserRoleContext.Provider>
}

export function useUserRole() {
  const context = useContext(UserRoleContext)
  if (context === undefined) {
    throw new Error("useUserRole must be used within a UserRoleProvider")
  }
  return context
}
