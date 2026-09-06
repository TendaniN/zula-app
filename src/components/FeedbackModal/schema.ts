import * as z from "zod";
import { Constants } from "@/types/database.types";

export const FeedbackSchema = z.object({
  category: z.enum(Constants.public.Enums.feedback_category, {
    message: "Pick a category",
  }),
  message: z
    .string()
    .trim()
    .min(4, "Tell us a little more")
    .max(2000, "Keep it under 2000 characters"),
  // Optional — nullable so "no sentiment" is a real state, not an empty string.
  sentiment: z
    .enum(Constants.public.Enums.feedback_sentiment)
    .nullable()
    .optional(),
  // Optional reply address for anonymous submissions (hidden when signed in).
  contact_email: z
    .string()
    .trim()
    .email("Enter a valid email")
    .optional()
    .or(z.literal("")),
});

export type FeedbackFormValues = z.infer<typeof FeedbackSchema>;
