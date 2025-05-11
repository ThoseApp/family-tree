import * as z from "zod";

export const formSchema = z.object({
  finalCode: z.string().min(4, {
    message: "Your OTP must be 4 characters.",
  }),
});
