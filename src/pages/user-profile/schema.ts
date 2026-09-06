import * as z from "zod";

export const ProfileSchema = z.object({
  email: z.email(),
  firstName: z.string(),
  lastName: z.string(),
  username: z
    .string()
    .min(8, "Username must be at least 8 characters")
    .max(15, "Username cannot exceed 15 characters"),
});

export type ProfileFormValues = z.infer<typeof ProfileSchema>;
