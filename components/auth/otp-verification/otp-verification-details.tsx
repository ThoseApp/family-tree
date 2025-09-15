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
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { X, ChevronLeft } from "lucide-react";
import Logo from "@/components/logo";
import { useUserStore } from "@/stores/user-store";
import AuthWrapper from "@/components/wrappers/auth-wrapper";
import { LoadingIcon } from "@/components/loading-icon";
import { InputOTP } from "@/components/ui/input-otp";

const OtpVerificationDetails = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    emailVerification,
    verifyOtp,
    loading: storeLoading,
  } = useUserStore();
  const [loading, setLoading] = useState<boolean>(false);
  const [resendingOtp, setResendingOtp] = useState<boolean>(false);
  const [displayRouteMessage, setDisplayRouteMessage] = useState<boolean>(true);
  const [targetEmail, setTargetEmail] = useState<string>("");

  const message = searchParams!.get("message");
  const emailFromQuery = searchParams!.get("email");

  useEffect(() => {
    if (emailFromQuery) {
      setTargetEmail(emailFromQuery);
    } else {
      // toast.error("Email address is missing. Redirecting to sign up page.");
      // setTimeout(() => {
      //   router.push("/sign-up");
      // }, 2000);
    }
  }, [emailFromQuery, router]);

  const toggleDisplayRouteMessage = () => {
    setDisplayRouteMessage(!displayRouteMessage);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      finalCode: "",
    },
  });

  const isLoading = form.formState.isSubmitting || loading || storeLoading;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!targetEmail) {
      toast.error("Email address is missing. Please go back to sign up.");
      return;
    }

    setLoading(true);
    try {
      form.clearErrors();

      // Use the verifyOtp function from the user store
      const result = await verifyOtp(targetEmail, values.finalCode);

      if (result.error) {
        form.setError("finalCode", {
          message: result.error,
        });
        toast.error(result.error);
        return;
      }

      toast.success("Email verification successful!");
      // Redirect the user to their dashboard now that their account is verified.
      router.push("/dashboard");
    } catch (error: any) {
      toast.error("An unexpected error occurred. Please try again.");
      console.error("OTP verification error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!targetEmail) {
      toast.error("Email address is missing. Please go back to sign up.");
      return;
    }

    setResendingOtp(true);
    try {
      const result = await emailVerification(targetEmail);
      if (result) {
        toast.success(
          "A new verification email has been sent to your email address."
        );
      } else {
        toast.error("Failed to resend verification email. Please try again.");
      }
    } catch (error: any) {
      toast.error(
        "Failed to resend verification email. Please try again later."
      );
      console.error("Resend verification error:", error);
    } finally {
      setResendingOtp(false);
    }
  };

  return (
    <>
      <AuthWrapper imageSrc="/images/auth/auth.webp" imageStyle="object-cover">
        <div className="flex  flex-col h-full items-center justify-center w-full space-y-10">
          <Logo />
          <div className="space-y-5 md:space-y-8 flex-col items-center  w-full max-w-md mx-auto">
            <div className="space-y-2 items-center text-center">
              <h2 className="font-bold text-3xl space-y-2">
                Verify Your Email
              </h2>
              <div className="text-muted-foreground">
                {targetEmail
                  ? `We've sent a verification link to ${targetEmail}. Check your email and enter the code below.`
                  : "Check your email for a verification link and enter the code below."}
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
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="finalCode"
                  render={({ field }) => (
                    <FormItem className="flex flex-col items-center">
                      <FormLabel className="sr-only">
                        Verification Code
                      </FormLabel>
                      <FormControl>
                        <InputOTP
                          maxLength={6}
                          pattern={REGEXP_ONLY_DIGITS}
                          {...field}
                          disabled={isLoading}
                        >
                          <InputOTPGroup className="gap-4">
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                      <FormMessage className="text-center" />
                    </FormItem>
                  )}
                />
                <div className="text-center text-sm">
                  Didn&apos;t receive the code?{" "}
                  <Button
                    type="button"
                    variant="link"
                    onClick={handleResendOtp}
                    disabled={resendingOtp || isLoading}
                    className={` text-sm ease-in pl-0  cursor-pointer hover:scale-105 transition `}
                  >
                    {resendingOtp ? (
                      <LoadingIcon className="mr-1 size-4" />
                    ) : null}
                    Resend Code
                  </Button>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-foreground text-background rounded-full hover:bg-foreground/80 transition-all duration-300"
                  size="lg"
                  disabled={isLoading || resendingOtp}
                >
                  {isLoading && <LoadingIcon className="mr-2" />}Verify Code
                </Button>
              </form>
            </Form>

            <div className="text-center mt-4">
              <Button
                variant="outline"
                type="button"
                className="text-sm text-muted-foreground hover:text-foreground border-none rounded-full"
                onClick={() => router.push("/sign-in")}
              >
                <ChevronLeft className="size-4 mr-2" />
                Back to Login
              </Button>
            </div>
          </div>
        </div>
      </AuthWrapper>
    </>
  );
};

export default OtpVerificationDetails;
