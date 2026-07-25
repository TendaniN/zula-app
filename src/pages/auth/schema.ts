import * as z from "zod";

export const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(8, "Password must be at least 8 characters").max(50),
});

export const RegisterSchema = z
  .object({
    email: z.email(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(50),
    confirmPassword: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    username: z
      .string()
      .min(8, "Username must be at least 8 characters")
      .max(15, "Username cannot exceed 15 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
