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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { EnhancedCalendar } from "@/components/ui/enhanced-calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SignUpDetails = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  // const isMounted = useMountedState();
  const { signUp, loading } = useUserStore();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [remember, setRemember] = useState<string>("off");
  const [displayRouteMessage, setDisplayRouteMessage] = useState<boolean>(true);
  const [compLoader, setCompLoader] = useState<boolean>(false);

  const message = searchParams!.get("message");
  const next = searchParams!.get("next");

  const toggleDisplayRouteMessage = () => {
    setDisplayRouteMessage(!displayRouteMessage);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      relative: "",
      relationshipToRelative: "",
      password: "",
      confirmPassword: "",
    },
  });

  const isLoading = form.formState.isSubmitting || loading || compLoader;

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setCompLoader(true);
    try {
      form.clearErrors();

      const signUpResult = await signUp({
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
        phoneNumber: values.phoneNumber,
        dateOfBirth: values.dateOfBirth,
        relative: values.relative,
        relationshipToRelative: values.relationshipToRelative,
      });

      if (signUpResult) {
        // If signup was successful, redirect to verification page
        router.push(
          "/otp-verification?email=" + encodeURIComponent(values.email)
        );
      }
    } catch (error: any) {
      toast.error("Something went wrong during sign-up");
      console.error("Sign-up error:", error);
    } finally {
      setCompLoader(false);
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
              <h2 className="font-bold text-3xl space-y-2">Sign Up</h2>
              <div className="">Join the Family Network</div>
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
                className="space-y-3 w-full "
              >
                {/* INPUT FIELDS */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input
                            disabled={isLoading}
                            placeholder="John"
                            className="focus-visible:ring-0"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              form.clearErrors("firstName");
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input
                            disabled={isLoading}
                            placeholder="Doe"
                            className="focus-visible:ring-0"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              form.clearErrors("lastName");
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
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
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isLoading}
                          placeholder="+1234567890"
                          className="focus-visible:ring-0"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            form.clearErrors("phoneNumber");
                          }}
                        />
                      </FormControl>
                      {/* <FormDescription className="text-xs">
                        You can leave this field empty if you prefer not to
                        share your phone number.
                      </FormDescription> */}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date of Birth</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                              disabled={isLoading}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <EnhancedCalendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              field.onChange(date);
                              form.clearErrors("dateOfBirth");
                            }}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="relative"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Relative Name</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isLoading}
                          placeholder="e.g., John Doe"
                          className="focus-visible:ring-0"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            form.clearErrors("relative");
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="relationshipToRelative"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Relationship to Relative</FormLabel>
                      <Select
                        disabled={isLoading}
                        onValueChange={(value) => {
                          field.onChange(value);
                          form.clearErrors("relationshipToRelative");
                        }}
                        value={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger className="focus-visible:ring-0">
                            <SelectValue placeholder="Select relationship" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="parent">Parent</SelectItem>
                          <SelectItem value="child">Child</SelectItem>
                          <SelectItem value="sibling">Sibling</SelectItem>
                          <SelectItem value="spouse">Spouse</SelectItem>
                          <SelectItem value="grandparent">
                            Grandparent
                          </SelectItem>
                          <SelectItem value="grandchild">Grandchild</SelectItem>
                          <SelectItem value="aunt-uncle">Aunt/Uncle</SelectItem>
                          <SelectItem value="niece-nephew">
                            Niece/Nephew
                          </SelectItem>
                          <SelectItem value="cousin">Cousin</SelectItem>
                          <SelectItem value="in-law">In-law</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
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
                          disabled={isLoading}
                          showPassword={showPassword}
                          toggleVisibility={() => togglePasswordVisibility()}
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
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <PasswordInput
                          field={field}
                          showPassword={showConfirmPassword}
                          toggleVisibility={() =>
                            toggleConfirmPasswordVisibility()
                          }
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
                  className="w-full  !mt-8 bg-foreground text-background rounded-full hover:bg-foreground/80 transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading && (
                    <LoadingIcon className="mr-2 text-background" />
                  )}{" "}
                  Sign Up
                </Button>
              </form>
            </Form>
          </div>

          {/* OR WITH GOOGLE/FACEBOOK */}
          {/* <div className="w-full  py-4  text-center text-black/70 items-center flex space-x-4 md:space-x-0">
            <Separator className="w-1/3" />
            <div className="text-sm w-1/3">Or sign up with</div>
            <Separator className="w-1/3" />
          </div> */}

          {/* GOOGLE AND S */}
          {/* <div className="flex w-full flex-col items-center space-y-4 ">
            <Button
              // onClick={signInWithGoogle}
              variant="outline"
              size="lg"
              className="w-full rounded-full"
            >
              <Image
                src="/icons/google.svg"
                width={25}
                height={25}
                alt="google-button"
              />
              <span className="text-sm font-normal ">Continue with Google</span>
            </Button>
          </div> */}

          <p className="text-center text-xs font-medium mt-4">
            By signing up to create an account, I accept Company&apos;s Terms of
            Use and Privacy Policy
          </p>
        </div>
      </AuthWrapper>
    </>
  );
};

export default SignUpDetails;
