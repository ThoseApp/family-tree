"use client";
export const dynamic = "force-dynamic";

import { Button } from "@/components/ui/button";
import { useUserStore } from "@/stores/user-store";
import { XCircle, Mail, Phone, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/components/logo";
import AuthWrapper from "@/components/wrappers/auth-wrapper";

const AccountRejectedPage = () => {
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
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="font-bold text-3xl space-y-2">
              Account Not Approved
            </h2>
            <div className="text-muted-foreground">
              Unfortunately, your account application has not been approved at
              this time.
            </div>
          </div>

          <div className="space-y-4 w-full">
            <div className="flex items-start text-left p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Mail className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900 mb-1">
                  Need clarification?
                </h3>
                <p className="text-sm text-blue-700">
                  Contact our support team to understand the reason and discuss
                  next steps.
                </p>
              </div>
            </div>

            <div className="flex items-start text-left p-4 bg-orange-50 rounded-lg border border-orange-200">
              <Phone className="w-5 h-5 text-orange-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-orange-900 mb-1">
                  Appeal process
                </h3>
                <p className="text-sm text-orange-700">
                  You may be able to reapply or appeal this decision.
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
            For support, please contact: support@familytree.com
          </p>
        </div>
      </div>
    </AuthWrapper>
  );
};

export default AccountRejectedPage;
