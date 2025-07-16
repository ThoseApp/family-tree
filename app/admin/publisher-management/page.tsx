"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LoadingIcon } from "@/components/loading-icon";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { UserProfile } from "@/lib/types";
import { Search, UserPlus, UserMinus, Shield, Crown } from "lucide-react";
import { dummyProfileImage } from "@/lib/constants";

interface UserWithRole extends UserProfile {
  role: "admin" | "publisher" | "user";
}

const PublisherManagementPage = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [processingUsers, setProcessingUsers] = useState<Set<string>>(
    new Set()
  );
  const [actionDialog, setActionDialog] = useState<{
    isOpen: boolean;
    user: UserWithRole | null;
    action: "promote" | "demote" | null;
  }>({
    isOpen: false,
    user: null,
    action: null,
  });

  // Fetch all approved users
  const fetchUsers = async () => {
    try {
      setLoading(true);

      // Get current user token for auth
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("No valid session");
      }

      // Call our API route with authentication
      const response = await fetch("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const { users: fetchedUsers } = await response.json();
      setUsers(fetchedUsers);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast.error(error.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      `${user.first_name} ${user.last_name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle promoting user to publisher
  const handlePromoteToPublisher = (user: UserWithRole) => {
    setActionDialog({
      isOpen: true,
      user,
      action: "promote",
    });
  };

  // Handle demoting publisher to user
  const handleDemoteFromPublisher = (user: UserWithRole) => {
    setActionDialog({
      isOpen: true,
      user,
      action: "demote",
    });
  };

  // Execute the promotion/demotion
  const executeAction = async () => {
    const { user, action } = actionDialog;
    if (!user || !action) return;

    setProcessingUsers((prev) => new Set(prev).add(user.user_id));

    try {
      const isPromoting = action === "promote";

      // Get current user token for auth
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("No valid session");
      }

      // Call our API route to update user role
      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.user_id,
          isPublisher: isPromoting,
          isAdmin: user.role === "admin", // Preserve admin status
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      // Update local state
      setUsers((prev) =>
        prev.map((u) =>
          u.user_id === user.user_id
            ? { ...u, role: isPromoting ? "publisher" : "user" }
            : u
        )
      );

      // Create notification for the user
      try {
        const notificationData = {
          title: isPromoting
            ? "Publisher Role Granted"
            : "Publisher Role Removed",
          body: isPromoting
            ? "You have been granted publisher permissions and can now manage notice boards and events."
            : "Your publisher permissions have been removed. You now have regular user access.",
          type: "system",
          resource_id: null,
          user_id: user.user_id,
          read: false,
          image: null,
        };

        await supabase.from("notifications").insert(notificationData);
      } catch (notificationError) {
        console.warn("Failed to create notification:", notificationError);
      }

      toast.success(
        isPromoting
          ? `${user.first_name} ${user.last_name} has been promoted to publisher`
          : `${user.first_name} ${user.last_name} has been demoted from publisher`
      );
    } catch (error: any) {
      console.error("Error updating user role:", error);
      toast.error(error.message || "Failed to update user role");
    } finally {
      setProcessingUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(user.user_id);
        return newSet;
      });
      setActionDialog({ isOpen: false, user: null, action: null });
    }
  };

  const getRoleBadge = (role: "admin" | "publisher" | "user") => {
    switch (role) {
      case "admin":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <Crown className="h-3 w-3" />
            Admin
          </Badge>
        );
      case "publisher":
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Publisher
          </Badge>
        );
      case "user":
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <UserPlus className="h-3 w-3" />
            User
          </Badge>
        );
    }
  };

  const canPromote = (user: UserWithRole) => user.role === "user";
  const canDemote = (user: UserWithRole) => user.role === "publisher";

  // Calculate statistics
  const totalUsers = users.length;
  const publisherCount = users.filter(
    (user) => user.role === "publisher"
  ).length;
  const adminCount = users.filter((user) => user.role === "admin").length;
  const regularUserCount = users.filter((user) => user.role === "user").length;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingIcon className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-8 lg:gap-y-12">
      {/* HEADER SECTION */}
      <div className="flex md:items-center md:flex-row flex-col md:justify-between gap-y-4">
        <div>
          <h1 className="text-2xl font-semibold">Publisher Management</h1>
          <p className="text-gray-600 text-sm">
            Promote users to publishers or demote publishers to regular users
          </p>
        </div>
      </div>

      {/* STATISTICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Admins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{adminCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Publishers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {publisherCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Regular Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {regularUserCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SEARCH */}
      <Card>
        <CardHeader>
          <CardTitle>Search Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* USERS TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>All Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No users found matching your search.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.user_id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.image || dummyProfileImage} />
                          <AvatarFallback>
                            {user.first_name[0]}
                            {user.last_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {user.first_name} {user.last_name}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {canPromote(user) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePromoteToPublisher(user)}
                            disabled={processingUsers.has(user.user_id)}
                            className="flex items-center gap-1"
                          >
                            {processingUsers.has(user.user_id) ? (
                              <LoadingIcon className="h-3 w-3" />
                            ) : (
                              <UserPlus className="h-3 w-3" />
                            )}
                            Promote
                          </Button>
                        )}
                        {canDemote(user) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDemoteFromPublisher(user)}
                            disabled={processingUsers.has(user.user_id)}
                            className="flex items-center gap-1"
                          >
                            {processingUsers.has(user.user_id) ? (
                              <LoadingIcon className="h-3 w-3" />
                            ) : (
                              <UserMinus className="h-3 w-3" />
                            )}
                            Demote
                          </Button>
                        )}
                        {user.role === "admin" && (
                          <span className="text-sm text-muted-foreground px-3 py-1">
                            Admin
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* CONFIRMATION DIALOG */}
      <AlertDialog
        open={actionDialog.isOpen}
        onOpenChange={(open) =>
          !open && setActionDialog({ isOpen: false, user: null, action: null })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionDialog.action === "promote"
                ? "Promote User"
                : "Demote Publisher"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionDialog.action === "promote"
                ? `Are you sure you want to promote ${actionDialog.user?.first_name} ${actionDialog.user?.last_name} to publisher? They will be able to approve content and create public events.`
                : `Are you sure you want to demote ${actionDialog.user?.first_name} ${actionDialog.user?.last_name} from publisher? They will lose their content management permissions.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeAction}>
              {actionDialog.action === "promote" ? "Promote" : "Demote"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PublisherManagementPage;
