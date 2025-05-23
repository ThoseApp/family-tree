"use client";
export const dynamic = "force-dynamic";

import Link from "next/link";
import * as z from "zod";

import { formSchema } from "./constant";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { X, ChevronLeft } from "lucide-react"; // Eye, EyeOff might be used by PasswordInput
import Logo from "@/components/logo";
import { useUserStore } from "@/stores/user-store";
import PasswordInput from "@/components/ui/password-input";
import AuthWrapper from "@/components/wrappers/auth-wrapper";
import { LoadingIcon } from "@/components/loading-icon";

const ResetPasswordDetails = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetPasswordWithToken, loading: storeLoading } = useUserStore();
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [displayRouteMessage, setDisplayRouteMessage] = useState<boolean>(true);
  const [resetToken, setResetToken] = useState<string | null>(null);

  const message = searchParams!.get("message");

  useEffect(() => {
    const token = searchParams!.get("token");
    if (token) {
      setResetToken(token);
    } else {
      // If token is missing, show error and redirect after a delay
      toast.error("Password reset token is missing or invalid.");
      setTimeout(() => {
        router.push("/sign-in?message=Invalid or expired reset link");
      }, 3000);
    }
  }, [searchParams, router]);

  const toggleDisplayRouteMessage = () => {
    setDisplayRouteMessage(!displayRouteMessage);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const isLoading = form.formState.isSubmitting || loading || storeLoading;

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!resetToken) {
      toast.error(
        "Password reset token is missing. Please try again from the link in your email."
      );
      return;
    }
    setLoading(true);
    try {
      form.clearErrors();

      const result = await resetPasswordWithToken(resetToken, values.password);

      if (result.success) {
        toast.success(
          "Password reset successfully! You can now log in with your new password."
        );
        form.reset();
        router.push("/sign-in?message=Password reset successfully");
      } else {
        toast.error(
          result.error || "Failed to reset password. The link may have expired."
        );
      }
    } catch (error: any) {
      toast.error("An unexpected error occurred. Please try again.");
      console.error("Reset password error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AuthWrapper imageSrc="/images/auth/auth.webp" imageStyle="object-cover">
        <div className="flex  flex-col h-full items-center justify-center w-full">
          <Logo />
          <div className="space-y-5 md:space-y-8 flex-col items-center  w-full max-w-md mx-auto">
            <div className="space-y-2 items-center text-center">
              <h2 className="font-bold text-3xl space-y-2">
                Reset Your Password
              </h2>
              <div className="text-muted-foreground">
                Create a new, strong password for your account.
              </div>
            </div>

            {message && displayRouteMessage && (
              <div
                className={`py-3 px-3 flex items-center justify-between ${
                  message.includes("successful") ? "bg-green-500" : "bg-red-500"
                } text-background rounded-md`}
              >
                <div className="text-sm">{message}</div>
                <span
                  className="flex-shrink-0 cursor-pointer transition hover:scale-105 ease-in"
                  onClick={toggleDisplayRouteMessage}
                >
                  <X className="size-4 md:size-5" />
                </span>
              </div>
            )}

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6 w-full "
              >
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <PasswordInput
                          field={field}
                          showPassword={showPassword}
                          toggleVisibility={togglePasswordVisibility}
                          disabled={isLoading}
                          placeholder="••••••••"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <PasswordInput
                          field={field}
                          showPassword={showConfirmPassword}
                          toggleVisibility={toggleConfirmPasswordVisibility}
                          disabled={isLoading}
                          placeholder="••••••••"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  size="lg"
                  type="submit"
                  className="w-full !mt-8 bg-foreground text-background rounded-full hover:bg-foreground/80 transition-all duration-300"
                  disabled={isLoading || !resetToken}
                >
                  {isLoading && <LoadingIcon className="mr-2" />}Set New
                  Password
                </Button>
              </form>
            </Form>

            <div className="text-center text-sm">
              Already part of the family?{" "}
              <Button
                type="button"
                variant="link"
                onClick={() => router.push("/sign-in")}
                disabled={isLoading}
                className={` text-sm ease-in pl-0  cursor-pointer hover:scale-105 transition `}
              >
                Log in here
              </Button>
            </div>
          </div>
        </div>
      </AuthWrapper>
    </>
  );
};

export default ResetPasswordDetails;
