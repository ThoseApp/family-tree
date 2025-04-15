import type React from "react"
import Sidebar from "@/components/sidebar"
import { UserRoleProvider } from "@/components/user-role-context"

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <UserRoleProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1">{children}</main>
      </div>
    </UserRoleProvider>
  )
}
