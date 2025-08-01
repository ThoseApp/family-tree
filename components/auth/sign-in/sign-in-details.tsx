"use client";
export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import * as z from "zod";

import { formSchema } from "./constant";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Eye, EyeOff, Info, X } from "lucide-react";
import Logo from "@/components/logo";
import { useUserStore } from "@/stores/user-store";
// import { useMountedState } from "react-use";
import { Checkbox } from "@/components/ui/checkbox";
import PasswordInput from "@/components/ui/password-input";
import AuthWrapper from "@/components/wrappers/auth-wrapper";
import { LoadingIcon } from "@/components/loading-icon";
import { Separator } from "@/components/ui/separator";

const SignInDetails = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  // const isMounted = useMountedState();
  const { login, loginWithGoogle, loading, user } = useUserStore();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [remember, setRemember] = useState<string>("off");
  const [displayRouteMessage, setDisplayRouteMessage] = useState<boolean>(true);
  const [compLoader, setCompLoader] = useState<boolean>(false);
  const [googleLoading, setGoogleLoading] = useState<boolean>(false);

  const message = searchParams!.get("message");
  const next = searchParams!.get("next"); // Don't set default here

  const toggleDisplayRouteMessage = () => {
    setDisplayRouteMessage(!displayRouteMessage);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const isLoading = form.formState.isSubmitting || loading || compLoader;

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setCompLoader(true);
    try {
      form.clearErrors();

      const loggedIn = await login(values.email, values.password, next || "");

      if (loggedIn && loggedIn.data) {
        // Successfully logged in, redirect user to home page
        router.push(loggedIn.path || "/");
      }
    } catch (error: any) {
      toast.error("Something went wrong");
      console.error("Login error:", error);
    } finally {
      setCompLoader(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      // Only pass next if it exists and is not empty
      // Let auth callback handle admin vs regular user routing
      const redirectTo = next && next.trim() ? next : undefined;
      await loginWithGoogle(redirectTo);
      // Note: No need to redirect here as the OAuth flow will handle it
    } catch (error: any) {
      toast.error("Google sign-in failed");
      console.error("Google sign-in error:", error);
    } finally {
      setGoogleLoading(false);
    }
  };

  // if (!isMounted) return;

  return (
    <>
      <AuthWrapper imageSrc="/images/auth/auth.webp" imageStyle="object-cover">
        <div className="flex  flex-col h-full items-center justify-center w-full">
          <Logo />
          <div className="space-y-5 md:space-y-8 flex-col items-center  w-full">
            <div className="space-y-2 items-center text-center">
              <h2 className="font-bold text-3xl space-y-2">Login</h2>
              <div className="">Join the Family Network</div>
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
                className="space-y-3 w-full "
              >
                {/* INPUT FIELDS */}
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
                            field.onChange(e); // Update the form value
                            form.clearErrors("email"); // Clear error for 'email'
                          }}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <PasswordInput
                          field={field}
                          showPassword={showPassword}
                          toggleVisibility={togglePasswordVisibility}
                          disabled={isLoading}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end items-center">
                  {/* REMEMBER ME */}
                  {/* <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      className="w-4 h-4 text-primary  rounded border-primary
       border focus:ring-primary data-[state=checked]:bg-primary"
                      onCheckedChange={(checked) =>
                        setRemember(checked ? "on" : "off")
                      }
                      value={remember}
                    />
                    <label
                      htmlFor="terms"
                      className="text-sm  leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Remember me
                    </label>
                  </div> */}

                  {/* FORGOTTEN PASSWORD LINK */}
                  <Button
                    onClick={() => router.push("/forgot-password")}
                    variant="link"
                    type="button"
                    className={` py-2 justify-end items-end flex text-sm ease-in  cursor-pointer hover:scale-105 transition `}
                  >
                    Forgot password?{" "}
                  </Button>
                </div>

                <Button
                  size="lg"
                  type="submit"
                  className="w-full !mt-8 bg-foreground text-background rounded-full hover:bg-foreground/80 transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading && (
                    <LoadingIcon className="mr-2 text-background" />
                  )}{" "}
                  Log in
                </Button>
              </form>
            </Form>
          </div>

          {/* OR WITH GOOGLE/FACEBOOK */}
          <div className="w-full  py-4  text-center text-black/70 items-center flex space-x-4 md:space-x-0">
            <Separator className="w-1/3" />
            <div className="text-sm w-1/3">Or continue with</div>
            <Separator className="w-1/3" />
          </div>

          {/* GOOGLE AND FACEBOOK BUTTONS */}
          <div className="flex w-full flex-col items-center space-y-4 ">
            <Button
              onClick={handleGoogleSignIn}
              variant="outline"
              size="lg"
              className="w-full rounded-full"
              disabled={isLoading || googleLoading}
            >
              {googleLoading ? (
                <LoadingIcon className="mr-2" />
              ) : (
                <Image
                  src="/icons/google.svg"
                  width={25}
                  height={25}
                  alt="google-button"
                />
              )}
              <span className="text-sm font-normal ">Continue with Google</span>
            </Button>
          </div>

          <div className="text-center mt-8">
            <p className="text-sm">
              Don&apos;t have an account?{" "}
              <Button
                variant="link"
                className="p-0 h-auto font-semibold"
                onClick={() => router.push("/sign-up")}
              >
                Sign up
              </Button>
            </p>
          </div>

          <p className="text-center text-xs font-medium mt-4">
            By signing in, I accept Company&apos;s Terms of Use and Privacy
            Policy
          </p>
        </div>
      </AuthWrapper>
    </>
  );
};

export default SignInDetails;
