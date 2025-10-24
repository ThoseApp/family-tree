"use client";

import { useState, useEffect } from "react";
import { X, RefreshCw, Download, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { resetMockData, exportMockData } from "@/lib/mock-data/initialize";
import { mockAuthService } from "@/lib/mock-data/mock-auth";
import { toast } from "sonner";

// Test user accounts
const TEST_USERS = [
  {
    email: "admin@test.com",
    password: "admin123",
    label: "Admin User",
    role: "admin",
  },
  {
    email: "publisher@test.com",
    password: "publisher123",
    label: "Publisher User",
    role: "publisher",
  },
  {
    email: "user@test.com",
    password: "user123",
    label: "Regular User",
    role: "user",
  },
  {
    email: "pending@test.com",
    password: "pending123",
    label: "Pending User",
    role: "pending",
  },
  {
    email: "rejected@test.com",
    password: "rejected123",
    label: "Rejected User",
    role: "rejected",
  },
];

export function MockDataBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    // Get current user
    const session = mockAuthService.getCurrentSession();
    setCurrentUser(session?.user?.email || null);
  }, []);

  const handleReset = async () => {
    if (isResetting) return;

    setIsResetting(true);
    try {
      await resetMockData();
      toast.success("Mock data reset successfully!");

      // Reload the page to reflect changes
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error("Failed to reset mock data:", error);
      toast.error("Failed to reset mock data");
    } finally {
      setIsResetting(false);
    }
  };

  const handleExport = () => {
    try {
      const data = exportMockData();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mock-data-export-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Mock data exported successfully!");
    } catch (error) {
      console.error("Failed to export mock data:", error);
      toast.error("Failed to export mock data");
    }
  };

  const handleSwitchUser = async (email: string) => {
    try {
      const success = await mockAuthService.switchUser(email);
      if (success) {
        toast.success(`Switching to ${email}...`);
        // Page will reload automatically
      } else {
        toast.error("Failed to switch user");
      }
    } catch (error) {
      console.error("Failed to switch user:", error);
      toast.error("Failed to switch user");
    }
  };

  if (!isVisible) return null;

  return (
    // <div className="fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg">
    //   <div className="container mx-auto px-4 py-2">
    //     <div className="flex items-center justify-between gap-4">
    //       <div className="flex items-center gap-2">
    //         <div className="flex items-center gap-2 text-sm font-semibold">
    //           <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
    //           <span>MOCK MODE</span>
    //         </div>
    //         <span className="text-xs opacity-90">
    //           Using test data • Perfect for demos • Password: Demo@123.
    //         </span>
    //         {currentUser && (
    //           <span className="text-xs opacity-90 ml-2">
    //             • Current: {currentUser}
    //           </span>
    //         )}
    //       </div>

    //       <div className="flex items-center gap-2">
    //         {/* Switch User */}
    //         <DropdownMenu>
    //           <DropdownMenuTrigger asChild>
    //             <Button
    //               size="sm"
    //               variant="secondary"
    //               className="h-7 text-xs bg-white/20 hover:bg-white/30 text-white border-white/30"
    //             >
    //               <Users className="h-3 w-3 mr-1" />
    //               Switch User
    //             </Button>
    //           </DropdownMenuTrigger>
    //           <DropdownMenuContent align="end" className="w-64">
    //             <DropdownMenuLabel>Test Accounts</DropdownMenuLabel>
    //             <div className="px-2 py-1 text-xs text-muted-foreground">
    //               Use password:{" "}
    //               <span className="font-mono font-semibold">Demo@123.</span> for
    //               any account
    //             </div>
    //             <DropdownMenuSeparator />
    //             {TEST_USERS.map((user) => (
    //               <DropdownMenuItem
    //                 key={user.email}
    //                 onClick={() => handleSwitchUser(user.email)}
    //                 className="cursor-pointer"
    //               >
    //                 <div className="flex flex-col gap-0.5">
    //                   <span className="text-sm font-medium">{user.label}</span>
    //                   <span className="text-xs text-muted-foreground">
    //                     {user.email}
    //                   </span>
    //                 </div>
    //               </DropdownMenuItem>
    //             ))}
    //           </DropdownMenuContent>
    //         </DropdownMenu>

    //         {/* Reset Data */}
    //         <Button
    //           size="sm"
    //           variant="secondary"
    //           onClick={handleReset}
    //           disabled={isResetting}
    //           className="h-7 text-xs bg-white/20 hover:bg-white/30 text-white border-white/30"
    //         >
    //           <RefreshCw
    //             className={`h-3 w-3 mr-1 ${isResetting ? "animate-spin" : ""}`}
    //           />
    //           Reset Data
    //         </Button>

    //         {/* Export Data */}
    //         <Button
    //           size="sm"
    //           variant="secondary"
    //           onClick={handleExport}
    //           className="h-7 text-xs bg-white/20 hover:bg-white/30 text-white border-white/30"
    //         >
    //           <Download className="h-3 w-3 mr-1" />
    //           Export
    //         </Button>

    //         {/* Close Banner */}
    //         <Button
    //           size="sm"
    //           variant="ghost"
    //           onClick={() => setIsVisible(false)}
    //           className="h-7 w-7 p-0 text-white hover:bg-white/20"
    //         >
    //           <X className="h-4 w-4" />
    //         </Button>
    //       </div>
    //     </div>
    //   </div>
    // </div>
    null
  );
}
