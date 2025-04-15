"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutGrid,
  Clock,
  GitBranch,
  FileText,
  Users,
  Calendar,
  ImageIcon,
  Settings,
  LogIn,
  LogOut,
} from "lucide-react"
import { useUserRole } from "@/components/user-role-context"

export default function Sidebar() {
  const pathname = usePathname()
  const { userRole } = useUserRole()

  const menuItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutGrid },
    { name: "History", href: "/dashboard/history", icon: Clock },
    { name: "Family Tree", href: "/dashboard/family-tree", icon: GitBranch },
    { name: "Notice Board", href: "/dashboard/notice-board", icon: FileText },
    { name: "Family Members", href: "/dashboard/family-members", icon: Users },
    { name: "Events", href: "/dashboard/events", icon: Calendar },
    { name: "Gallery", href: "/dashboard/gallery", icon: ImageIcon },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ]

  // Admin-only menu items
  const adminItems =
    userRole === "admin" ? [{ name: "User Management", href: "/dashboard/admin/users", icon: Users }] : []

  // Editor-only menu items
  const editorItems =
    userRole === "admin" || userRole === "editor"
      ? [{ name: "Content Management", href: "/dashboard/editor/content", icon: FileText }]
      : []

  const allMenuItems = [...menuItems, ...adminItems, ...editorItems]

  return (
    <aside className="w-64 border-r border-gray-200 bg-white hidden md:block">
      <div className="h-full flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold">Kith & Kin</h1>
        </div>

        <nav className="flex-1">
          <p className="px-6 py-2 text-sm font-medium text-gray-500">MENU</p>
          <ul className="space-y-1 px-3">
            {allMenuItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md ${
                      isActive ? "bg-gray-100 text-gray-900" : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {userRole && (
          <div className="p-3 border-t border-gray-200">
            <div className="px-3 py-2 text-sm font-medium text-gray-500">
              ROLE: {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
            </div>
          </div>
        )}

        <div className="p-3 mt-auto border-t">
          <Link href="/login" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
            <LogIn className="h-5 w-5" />
            <span>Login</span>
          </Link>
          <Link href="/logout" className="flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-gray-100 rounded-md">
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </Link>
        </div>
      </div>
    </aside>
  )
}
