"use client";

import { Button } from "@/components/ui/button";
import { useUserStore } from "@/stores/user-store";
import { Clock, CheckCircle, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const PendingApprovalPage = () => {
  const { logout } = useUserStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/sign-in");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Account Pending Approval
          </h1>
          <p className="text-gray-600">
            Your account has been successfully created and is currently pending
            approval from our admin team.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center text-left p-4 bg-blue-50 rounded-lg">
            <Mail className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-blue-900">Whats next?</h3>
              <p className="text-sm text-blue-700">
                You&apos;ll receive an email notification once your account is
                approved.
              </p>
            </div>
          </div>

          <div className="flex items-center text-left p-4 bg-green-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-green-900">After approval</h3>
              <p className="text-sm text-green-700">
                You&apos;ll be able to log in and access all family features.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button onClick={handleLogout} className="w-full">
            Sign Out
          </Button>
          <Link href="/sign-in">
            <Button variant="outline" className="w-full">
              Back to Sign In
            </Button>
          </Link>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          Questions? Contact our support team for assistance.
        </p>
      </div>
    </div>
  );
};

export default PendingApprovalPage;
