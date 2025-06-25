"use client";

import React, { useState, useEffect } from "react";
import FamilyMembersTable from "@/components/tables/family-members";
import { Button } from "@/components/ui/button";
import { Plus, Users, Upload } from "lucide-react";
import { FamilyMemberModal } from "@/components/modals/family-member-modal";
import { useFamilyMembersStore } from "@/stores/family-members-store";
import { FamilyMember } from "@/lib/types";
import { toast } from "sonner";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const FamilyMembersPage = () => {
  const {
    familyMembers,
    isLoading,
    error,
    fetchFamilyMembers,
    addFamilyMember,
    updateFamilyMember,
    removeFamilyMember,
    clearError,
  } = useFamilyMembersStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [deletingMember, setDeletingMember] = useState<FamilyMember | null>(
    null
  );

  useEffect(() => {
    fetchFamilyMembers();
  }, [fetchFamilyMembers]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleAddFamilyMember = async (
    memberData: Omit<FamilyMember, "id">
  ) => {
    try {
      await addFamilyMember(memberData);
      toast.success("Family member added successfully!");
      setIsAddModalOpen(false);
    } catch (error) {
      toast.error("Failed to add family member");
    }
  };

  const handleEditFamilyMember = async (
    memberData: Omit<FamilyMember, "id">
  ) => {
    if (!editingMember) return;

    try {
      await updateFamilyMember(editingMember.id, memberData);
      toast.success("Family member updated successfully!");
      setIsEditModalOpen(false);
      setEditingMember(null);
    } catch (error) {
      toast.error("Failed to update family member");
    }
  };

  const handleDeleteFamilyMember = async () => {
    if (!deletingMember) return;

    try {
      await removeFamilyMember(deletingMember.id);
      toast.success("Family member removed successfully!");
      setDeletingMember(null);
    } catch (error) {
      toast.error("Failed to remove family member");
    }
  };

  const openEditModal = (member: FamilyMember) => {
    setEditingMember(member);
    setIsEditModalOpen(true);
  };

  const openDeleteDialog = (member: FamilyMember) => {
    setDeletingMember(member);
  };

  const handleMemberClick = (member: FamilyMember) => {
    // Handle member click - could navigate to detail page
    console.log("Member clicked:", member);
  };

  return (
    <div className="flex flex-col gap-y-8 lg:gap-y-12">
      {/* HEADER SECTION */}
      <div className="flex md:items-center md:flex-row flex-col md:justify-between gap-y-4">
        <div>
          <h1 className="text-2xl font-semibold">Family Members</h1>
          <p className="text-muted-foreground mt-1">
            Manage your family tree members and their information
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* <Button
            variant="outline"
            className="rounded-full"
            onClick={() => {
              // TODO: Implement bulk upload functionality
              toast.info("Bulk upload feature coming soon!");
            }}
          >
            <Upload className="size-4 mr-2" />
            Import Members
          </Button> */}

          <Button
            className="bg-foreground text-background rounded-full hover:bg-foreground/80"
            onClick={() => setIsAddModalOpen(true)}
            disabled={isLoading}
          >
            <Plus className="size-4 mr-2" />
            Add Family Member
          </Button>
        </div>
      </div>

      {/* STATS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{familyMembers.length}</div>
            <p className="text-xs text-muted-foreground">
              Active family members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Male Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {familyMembers.filter((m) => m.gender === "Male").length}
            </div>
            <p className="text-xs text-muted-foreground">Male family members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Female Members
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {familyMembers.filter((m) => m.gender === "Female").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Female family members
            </p>
          </CardContent>
        </Card>
      </div>

      {/* TABLE SECTION */}
      <Card>
        <CardHeader>
          <CardTitle>Family Members List</CardTitle>
          <CardDescription>
            View and manage all family members in your family tree
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && familyMembers.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <LoadingIcon className="mr-2" />
              Loading family members...
            </div>
          ) : (
            <FamilyMembersTable
              data={familyMembers}
              onEdit={openEditModal}
              onDelete={openDeleteDialog}
              onUserClick={handleMemberClick}
            />
          )}
        </CardContent>
      </Card>

      {/* ADD MODAL */}
      <FamilyMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onConfirm={handleAddFamilyMember}
        isLoading={isLoading}
        mode="add"
      />

      {/* EDIT MODAL */}
      <FamilyMemberModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingMember(null);
        }}
        onConfirm={handleEditFamilyMember}
        isLoading={isLoading}
        editData={editingMember}
        mode="edit"
      />

      {/* DELETE CONFIRMATION DIALOG */}
      <AlertDialog
        open={!!deletingMember}
        onOpenChange={() => setDeletingMember(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              <strong>{deletingMember?.name}</strong> from your family tree.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFamilyMember}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isLoading}
            >
              {isLoading && <LoadingIcon className="mr-2 h-4 w-4" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FamilyMembersPage;
