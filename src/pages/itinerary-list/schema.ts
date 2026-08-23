import { Constants } from "@/types/database.types";
import * as z from "zod";

export const ActivitySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Give the activity a name")
    .max(120, "Keep the name under 120 characters"),
  cost: z
    .number({ message: "Enter a number" })
    .min(0, "Cost can't be negative")
    .default(0),
  activity_date: z.string().min(1, "Pick a date").nullable(),
  activity_time: z.string().min(1, "Pick a time").nullable().optional(),
  duration_minutes: z
    .number({ message: "Enter a number" })
    .min(0, "Duration can't be negative")
    .nullable()
    .optional(),
  link: z
    .url("Enter a valid URL")
    .trim()
    .nullable()
    .optional()
    .or(z.literal("")),
  type: z.enum(Constants.public.Enums.activity_type),
});

export type ActivityFormValues = z.infer<typeof ActivitySchema>;
