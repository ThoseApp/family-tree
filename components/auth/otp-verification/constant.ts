import * as z from "zod";

export const formSchema = z.object({
  finalCode: z
    .string()
    .min(6, {
      message: "Your verification code must be 6 digits.",
    })
    .max(6, {
      message: "Your verification code must be 6 digits.",
    })
    .refine((val) => /^\d{6}$/.test(val), {
      message: "Please enter a valid 6-digit verification code.",
    }),
});
