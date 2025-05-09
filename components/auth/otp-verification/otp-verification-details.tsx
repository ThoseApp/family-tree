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
// TODO: Import your actual OTP verification and resend functions/store actions
// import { useAuthStore } from "@/stores/auth-store";
import AuthWrapper from "@/components/wrappers/auth-wrapper";
import { LoadingIcon } from "@/components/loading-icon";
import { InputOTP } from "@/components/ui/input-otp";

const OtpVerificationDetails = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  // const { verifyOtp, resendOtp, isLoadingOtp } = useAuthStore(); // Example usage
  const [loading, setLoading] = useState<boolean>(false); // For form submission
  const [resendingOtp, setResendingOtp] = useState<boolean>(false); // For resend OTP action
  const [displayRouteMessage, setDisplayRouteMessage] = useState<boolean>(true);
  const [targetEmail, setTargetEmail] = useState<string>(""); // To display in messages

  const message = searchParams!.get("message");
  const emailFromQuery = searchParams!.get("email"); // Assuming email is passed in query

  useEffect(() => {
    if (emailFromQuery) {
      setTargetEmail(emailFromQuery);
    }
    // You might also fetch the email from a store if it's sensitive or not in query
  }, [emailFromQuery]);

  const toggleDisplayRouteMessage = () => {
    setDisplayRouteMessage(!displayRouteMessage);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      finalCode: "",
    },
  });

  const isLoading = form.formState.isSubmitting || loading;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      form.clearErrors();
      console.log("Verifying OTP:", values.finalCode);
      // TODO: Implement actual OTP verification logic
      // For example:
      // const verificationResult = await verifyOtp(values.finalCode, targetEmail);
      // if (verificationResult.success) {
      //   toast.success("OTP Verified successfully!");
      //   // Navigate to the next step, e.g., dashboard or set new password page
      //   // router.push(verificationResult.redirectPath || "/dashboard");
      // } else {
      //   form.setError("finalCode", { message: verificationResult.message || "Invalid OTP. Please try again." });
      //   toast.error(verificationResult.message || "Invalid OTP. Please try again.");
      // }

      // Placeholder logic:
      if (values.finalCode === "123456") {
        // Example success OTP
        toast.success("OTP Verified successfully! (Placeholder)");
        router.push("/dashboard"); // Placeholder redirect
      } else {
        form.setError("finalCode", {
          message: "Invalid OTP. Please try again.",
        });
        toast.error("Invalid OTP. Please try again. (Placeholder)");
      }
    } catch (error: any) {
      toast.error("An unexpected error occurred. Please try again.");
      console.error("OTP verification error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendingOtp(true);
    try {
      console.log("Resending OTP to:", targetEmail);
      // TODO: Implement actual resend OTP logic
      // For example:
      // await resendOtp(targetEmail);
      toast.success("A new OTP has been sent to your email address.");
    } catch (error: any) {
      toast.error("Failed to resend OTP. Please try again later.");
      console.error("Resend OTP error:", error);
    } finally {
      setResendingOtp(false);
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
                Verify Your Email
              </h2>
              <div className="text-muted-foreground">
                {targetEmail
                  ? `Enter the 4-digit code sent to ${targetEmail}.`
                  : "Enter the 4-digit code sent to your email address."}
              </div>
            </div>

            {message && displayRouteMessage && (
              <div className="py-3 px-3 flex items-center justify-between bg-red-500 text-background rounded-md">
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
                      <FormLabel className="sr-only">OTP Code</FormLabel>
                      <FormControl>
                        <InputOTP
                          maxLength={6}
                          pattern={REGEXP_ONLY_DIGITS} // Ensures only digits can be entered
                          {...field}
                          disabled={isLoading}
                        >
                          <InputOTPGroup className="gap-4">
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
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
                asChild
              >
                <Link href="/login">
                  <ChevronLeft className="size-4 mr-2" />
                  Back to Login
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </AuthWrapper>
    </>
  );
};

export default OtpVerificationDetails;
