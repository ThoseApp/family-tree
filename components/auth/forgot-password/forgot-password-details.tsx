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
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { X, ArrowLeft, ChevronLeft } from "lucide-react";
import Logo from "@/components/logo";
import { useUserStore } from "@/stores/user-store";
import AuthWrapper from "@/components/wrappers/auth-wrapper";
import { LoadingIcon } from "@/components/loading-icon";

const ForgotPasswordDetails = () => {
  const router = useRouter();
  const { passwordReset, loading: storeLoading } = useUserStore();
  const [loading, setLoading] = useState<boolean>(false);
  const [displayRouteMessage, setDisplayRouteMessage] = useState<boolean>(true);

  const toggleDisplayRouteMessage = () => {
    setDisplayRouteMessage(!displayRouteMessage);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const isLoading = form.formState.isSubmitting || loading || storeLoading;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      form.clearErrors();

      const result = await passwordReset(values.email);

      if (result.success) {
        form.reset();
        // Optional: redirect to a confirmation page
        // router.push("/forgot-password/confirmation");
      } else {
        // We don't want to reveal if an email exists or not for security
        // So we still show a success message even if there was an error
      }
    } catch (error: any) {
      // For security reasons, we still show a success message

      console.error("Forgot password error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AuthWrapper imageSrc="/images/auth/auth.webp" imageStyle="object-cover">
        <div className="flex  flex-col h-full items-center justify-center w-full space-y-10">
          <Logo />
          <div className="space-y-5 md:space-y-8 flex-col items-center  w-full">
            <div className="space-y-2 items-center text-center">
              <h2 className="font-bold text-3xl space-y-2">Forgot Password?</h2>
              <div className="">
                No worries, enter your email and we&apos;ll send you a reset
                link.
              </div>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-3 w-full "
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isLoading}
                          placeholder="john.doe@gmail.com"
                          className="focus-visible:ring-0"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            form.clearErrors("email");
                          }}
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
                  disabled={isLoading}
                >
                  {isLoading && (
                    <LoadingIcon className="mr-2 text-background" />
                  )}{" "}
                  Send Reset Link
                </Button>
              </form>
            </Form>
            <div className="text-center">
              <Button
                onClick={() => router.push("/sign-in")}
                variant="outline"
                type="button"
                className="text-sm text-muted-foreground hover:text-foreground border-none rounded-full"
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

export default ForgotPasswordDetails;
