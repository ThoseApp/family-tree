import * as z from "zod";

const relationshipOptions = [
  "parent",
  "child",
  "sibling",
  "spouse",
  "grandparent",
  "grandchild",
  "aunt-uncle",
  "niece-nephew",
  "cousin",
  "in-law",
  "other",
] as const;

export const formSchema = z
  .object({
    firstName: z.string().min(2, {
      message: "First name must be at least 2 characters.",
    }),
    lastName: z.string().min(2, {
      message: "Last name must be at least 2 characters.",
    }),
    email: z
      .string()
      .min(2, {
        message: "You've entered an Incorrect email address",
      })
      .email({
        message: "Please enter a valid email address",
      }),
    phoneNumber: z
      .string()
      .refine((val) => val === "" || /^\+?[1-9]\d{1,14}$/.test(val), {
        message: "Invalid phone number format.",
      })
      .optional(),
    dateOfBirth: z.date({
      required_error: "Date of birth is required.",
      invalid_type_error: "That's not a valid date!",
    }),
    relative: z.string().min(2, {
      message: "Relative is required.",
    }),
    relationshipToRelative: z.string().min(1, {
      message: "Please select a relationship type.",
    }),
    password: z.string().min(1, {
      message: "Password is required",
    }),
    confirmPassword: z.string().min(1, {
      message: "Confirm password is required",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"], // path of error
  });
