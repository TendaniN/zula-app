import * as z from "zod";
import { Constants } from "@/types/database.types";

export const TripSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Name must be at least 3 characters")
    .max(80, "Keep the name under 80 characters"),
  description: z
    .string()
    .trim()
    .min(3, "Description must be at least 3 characters")
    .max(500, "Keep the description under 500 characters")
    .optional()
    .or(z.literal("")),
  // Optional safety margin on top of planned costs. Coerce so an empty input
  // (which arrives as "") becomes 0 rather than NaN.
  buffer_cost: z.coerce.number().min(0, "Buffer can't be negative").default(0),
  // Derived straight from the generated DB enum — regenerating the Supabase
  // types (npm run gen:types) keeps this in sync automatically. Only surfaced
  // in the edit form; on create it defaults to "planning".
  status: z.enum(Constants.public.Enums.trip_status),
});

export type TripFormValues = z.infer<typeof TripSchema>;
