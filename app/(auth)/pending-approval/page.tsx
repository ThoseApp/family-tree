"use client";
export const dynamic = "force-dynamic";

import { Button } from "@/components/ui/button";
import { useUserStore } from "@/stores/user-store";
import { Clock, CheckCircle, Mail, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/components/logo";
import AuthWrapper from "@/components/wrappers/auth-wrapper";

const PendingApprovalPage = () => {
  const { logout } = useUserStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/sign-in");
  };

  return (
    <AuthWrapper
      imageSrc="/images/auth/auth.webp"
      imageStyle="object-cover"
      noActionButton
    >
      <div className="flex flex-col h-full items-center justify-center w-full space-y-10">
        <Logo />
        <div className="space-y-5 md:space-y-8 flex-col items-center w-full max-w-md mx-auto">
          <div className="space-y-2 items-center text-center">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
            <h2 className="font-bold text-3xl space-y-2">
              Account Pending Approval
            </h2>
            <div className="text-muted-foreground">
              Your account has been successfully created and is currently
              pending approval from our admin team.
            </div>
          </div>

          <div className="space-y-4 w-full">
            <div className="flex items-start text-left p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Mail className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900 mb-1">
                  What&apos;s next?
                </h3>
                <p className="text-sm text-blue-700">
                  You&apos;ll receive an email notification once your account is
                  approved.
                </p>
              </div>
            </div>

            <div className="flex items-start text-left p-4 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-green-900 mb-1">
                  After approval
                </h3>
                <p className="text-sm text-green-700">
                  You&apos;ll be able to log in and access all family features.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 w-full">
            <Button
              onClick={handleLogout}
              className="w-full bg-foreground text-background rounded-full hover:bg-foreground/80 transition-all duration-300"
              size="lg"
            >
              Sign Out
            </Button>

            <div className="text-center">
              <Button
                variant="outline"
                type="button"
                className="text-sm text-muted-foreground hover:text-foreground border-none rounded-full"
                onClick={() => router.push("/sign-in")}
              >
                <ChevronLeft className="size-4 mr-2" />
                Back to Sign In
              </Button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-6">
            Questions? Contact our support team for assistance.
          </p>
        </div>
      </div>
    </AuthWrapper>
  );
};

export default PendingApprovalPage;
