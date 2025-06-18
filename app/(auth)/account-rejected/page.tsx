"use client";

import { Button } from "@/components/ui/button";
import { useUserStore } from "@/stores/user-store";
import { XCircle, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const AccountRejectedPage = () => {
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
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Account Not Approved
          </h1>
          <p className="text-gray-600">
            Unfortunately, your account application has not been approved at
            this time.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center text-left p-4 bg-blue-50 rounded-lg">
            <Mail className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-blue-900">Need clarification?</h3>
              <p className="text-sm text-blue-700">
                Contact our support team to understand the reason and discuss
                next steps.
              </p>
            </div>
          </div>

          <div className="flex items-center text-left p-4 bg-orange-50 rounded-lg">
            <Phone className="w-5 h-5 text-orange-600 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-orange-900">Appeal process</h3>
              <p className="text-sm text-orange-700">
                You may be able to reapply or appeal this decision.
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
          For support, please contact: support@familytree.com
        </p>
      </div>
    </div>
  );
};

export default AccountRejectedPage;
