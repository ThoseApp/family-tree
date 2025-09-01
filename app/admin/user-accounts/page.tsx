"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { LoadingIcon } from "@/components/loading-icon";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { UserProfile, FamilyMember } from "@/lib/types";
import {
  Search,
  UserPlus,
  Mail,
  Users,
  CheckCircle,
  XCircle,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react";
import { dummyProfileImage } from "@/lib/constants";
import { CreateAccountModal } from "@/components/modals/create-account-modal";
import { BulkCreateAccountsModal } from "@/components/modals/bulk-create-accounts-modal";
import { processedMemberToFamilyMember } from "@/lib/utils/family-tree-helpers";

interface UserAccountWithFamily extends UserProfile {
  hasAccount: boolean;
  accountCreatedAt?: string;
  life_status?: "Alive" | "Deceased";
}

const UserAccountsPage = () => {
  const [familyMembers, setFamilyMembers] = useState<UserAccountWithFamily[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPasswordColumn, setShowPasswordColumn] = useState(false);

  // Create Account Modal state
  const [isCreateAccountModalOpen, setIsCreateAccountModalOpen] =
    useState(false);
  const [creatingAccountFor, setCreatingAccountFor] =
    useState<FamilyMember | null>(null);

  // Bulk Create Accounts Modal state
  const [isBulkCreateModalOpen, setIsBulkCreateModalOpen] = useState(false);

  // Fetch family members and their account status
  const fetchFamilyMembersWithAccounts = async () => {
    try {
      setLoading(true);

      // Get all family members from family-tree table
      const { data: familyTreeData, error: familyTreeError } = await supabase
        .from("family-tree")
        .select("*")
        .order("first_name");

      if (familyTreeError) throw familyTreeError;

      // Get all user profiles linked to family tree
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .not("family_tree_uid", "is", null)
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Combine data to show which family members have accounts
      const combinedData: UserAccountWithFamily[] = [];

      // Add family members with accounts
      profilesData?.forEach((profile) => {
        const familyMember = familyTreeData?.find(
          (fm) => fm.unique_id === profile.family_tree_uid
        );

        if (familyMember) {
          combinedData.push({
            ...profile,
            hasAccount: true,
            accountCreatedAt: profile.created_at,
            life_status: familyMember.life_status || "Alive",
          });
        }
      });

      // Add family members without accounts
      familyTreeData?.forEach((familyMember) => {
        const hasProfile = profilesData?.some(
          (profile) => profile.family_tree_uid === familyMember.unique_id
        );

        if (!hasProfile) {
          combinedData.push({
            id: familyMember.unique_id,
            user_id: "",
            first_name: familyMember.first_name,
            last_name: familyMember.last_name,
            email: familyMember.email_address || "",
            phone_number: "",
            relative: "",
            relationship_to_relative: "",
            date_of_birth: familyMember.date_of_birth || "",
            image: familyMember.picture_link || "",
            bio: "",
            status: "pending",
            family_tree_uid: familyMember.unique_id,
            created_at: "",
            updated_at: "",
            hasAccount: false,
            life_status: familyMember.life_status || "Alive",
          });
        }
      });

      setFamilyMembers(combinedData);
    } catch (error: any) {
      console.error("Error fetching family members:", error);
      toast.error("Failed to fetch family members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFamilyMembersWithAccounts();
  }, []);

  // Filter family members based on search term
  const filteredMembers = familyMembers.filter((member) => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${member.first_name} ${member.last_name}`.toLowerCase();
    return (
      fullName.includes(searchLower) ||
      member.email?.toLowerCase().includes(searchLower) ||
      member.family_tree_uid?.toLowerCase().includes(searchLower)
    );
  });

  // Statistics
  const totalFamilyMembers = familyMembers.length;
  const membersWithAccounts = familyMembers.filter((m) => m.hasAccount).length;
  const membersWithoutAccounts = totalFamilyMembers - membersWithAccounts;
  const aliveMembers = familyMembers.filter(
    (m) => m.life_status === "Alive"
  ).length;
  const deceasedMembers = totalFamilyMembers - aliveMembers;
  const eligibleForAccounts = familyMembers.filter(
    (m) => !m.hasAccount && m.life_status === "Alive"
  ).length;

  const getAccountStatusBadge = (member: UserAccountWithFamily) => {
    if (!member.hasAccount) {
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          No Account
        </Badge>
      );
    }

    return (
      <Badge variant="default" className="flex items-center gap-1">
        <CheckCircle className="h-3 w-3" />
        Account Active
      </Badge>
    );
  };

  // Handle creating user account for family member
  const handleCreateAccount = (member: UserAccountWithFamily) => {
    // Check if member is deceased
    if (member.life_status === "Deceased") {
      toast.error("Cannot create account for deceased family member", {
        description: `${member.first_name} ${member.last_name} is marked as deceased.`,
      });
      return;
    }

    // Convert UserAccountWithFamily to FamilyMember format for the modal
    const familyMember: FamilyMember = {
      id: member.family_tree_uid || member.id,
      name: `${member.first_name} ${member.last_name}`.trim(),
      gender: member.gender || "",
      description: "Family member",
      imageSrc: member.image || "",
      birthDate: member.date_of_birth || "",
      lifeStatus: member.life_status || "Alive",
      emailAddress: member.email || "",
    };

    setCreatingAccountFor(familyMember);
    setIsCreateAccountModalOpen(true);
  };

  const handleCreateAccountSuccess = () => {
    // Refresh the data to show the new account
    fetchFamilyMembersWithAccounts();
    toast.success("User account created successfully!");
  };

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
          <h1 className="text-2xl font-semibold">User Account Management</h1>
          <p className="text-gray-600 text-sm">
            Manage user accounts for family members
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* <Button
            variant="outline"
            onClick={() => setShowPasswordColumn(!showPasswordColumn)}
            className="flex items-center gap-2"
          >
            {showPasswordColumn ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            {showPasswordColumn ? "Hide Passwords" : "Show Passwords"}
          </Button> */}
          <Button
            variant="outline"
            onClick={() => setIsBulkCreateModalOpen(true)}
            disabled={eligibleForAccounts === 0}
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            Bulk Create ({eligibleForAccounts})
          </Button>
          <Button
            variant="outline"
            onClick={fetchFamilyMembersWithAccounts}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* STATISTICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Family Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFamilyMembers}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {aliveMembers} alive, {deceasedMembers} deceased
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              With Accounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {membersWithAccounts}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Active user accounts
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Eligible for Accounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {eligibleForAccounts}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Alive members without accounts
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Deceased Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {deceasedMembers}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Cannot create accounts
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SEARCH */}
      <Card>
        <CardHeader>
          <CardTitle>Search Family Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or family ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* FAMILY MEMBERS TABLE */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Family Members ({filteredMembers.length})
          </CardTitle>
          <CardDescription>
            Manage user accounts for family members. Use the family members page
            to create accounts for specific individuals.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredMembers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No family members found matching your search.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Unique ID</TableHead>
                    <TableHead>Life Status</TableHead>
                    <TableHead>Account Status</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Account Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => (
                    <TableRow key={member.id || member.family_tree_uid}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={member.image || dummyProfileImage}
                            />
                            <AvatarFallback>
                              {member.first_name[0]}
                              {member.last_name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {member.first_name} {member.last_name}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {member.family_tree_uid}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            member.life_status === "Alive"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {member.life_status || "Alive"}
                        </Badge>
                      </TableCell>
                      <TableCell>{getAccountStatusBadge(member)}</TableCell>
                      <TableCell>
                        {member.hasAccount ? (
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3 text-gray-400" />
                            {member.email}
                          </div>
                        ) : (
                          <span className="text-gray-400">No account</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {member.hasAccount && member.accountCreatedAt ? (
                          new Date(member.accountCreatedAt).toLocaleDateString()
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {member.hasAccount ? (
                          <span className="text-sm text-green-600">
                            Account exists
                          </span>
                        ) : member.life_status === "Deceased" ? (
                          <div className="flex flex-col items-start">
                            <Badge variant="secondary" className="text-xs">
                              Deceased
                            </Badge>
                            <span className="text-xs text-muted-foreground mt-1">
                              Cannot create account
                            </span>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCreateAccount(member)}
                            className="flex items-center gap-2"
                          >
                            <UserPlus className="h-3 w-3" />
                            Create Account
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* INFO CARD */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            How to Create Accounts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">
                Individual Account Creation
              </h4>
              <p className="text-sm text-blue-700">
                Find the family member you want to create an account for and
                click the &quot;Create Account&quot; button. You&apos;ll be
                prompted to enter their email address and the account will be
                created instantly.
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">
                Automatic Email Sending
              </h4>
              <p className="text-sm text-green-700">
                When you create an account, a secure password is automatically
                generated and sent to the family member&apos;s email along with
                login instructions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CREATE ACCOUNT MODAL */}
      <CreateAccountModal
        isOpen={isCreateAccountModalOpen}
        onClose={() => {
          setIsCreateAccountModalOpen(false);
          setCreatingAccountFor(null);
        }}
        familyMember={creatingAccountFor}
        onSuccess={handleCreateAccountSuccess}
      />

      {/* BULK CREATE ACCOUNTS MODAL */}
      <BulkCreateAccountsModal
        isOpen={isBulkCreateModalOpen}
        onClose={() => setIsBulkCreateModalOpen(false)}
        familyMembersWithoutAccounts={familyMembers.filter(
          (member) => !member.hasAccount && member.life_status === "Alive"
        )}
        onSuccess={handleCreateAccountSuccess}
      />
    </div>
  );
};

export default UserAccountsPage;
