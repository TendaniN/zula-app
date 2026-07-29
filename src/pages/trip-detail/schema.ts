import * as z from "zod";
import { Constants } from "@/types/database.types";
import { ALL_CITIES_MAP, COUNTRY_MAP } from "@/constants/city";

/**
 * Accommodation sub-schema. Every field is optional at the top level because
 * accommodation itself is optional — but once `name` is provided (the user
 * started filling it in) then `name` + `cost_per_night` become required so we
 * don't end up with a half-empty row.
 */
const AccommodationSchema = z
  .object({
    name: z
      .string()
      .trim()
      .max(120, "Keep the name under 120 characters")
      .optional()
      .or(z.literal("")),
    type: z
      .enum(
        Constants.public.Enums.accommodation_type as readonly [
          string,
          ...string[],
        ],
      )
      .optional(),
    cost_per_night: z.number().min(0, "Cost can't be negative").optional(),
    rating: z
      .number()
      .min(0)
      .max(5, "Rating is out of 5")
      .nullable()
      .optional(),
    link: z
      .string()
      .url("Enter a valid URL")
      .nullable()
      .optional()
      .or(z.literal("")),
    room: z.string().trim().max(120).nullable().optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      // If the user typed a name, cost_per_night is also required.
      if (data.name && data.name.length > 0 && data.cost_per_night == null) {
        return false;
      }
      return true;
    },
    {
      message: "Add a nightly cost for the accommodation",
      path: ["cost_per_night"],
    },
  );

export const LocationSchema = z
  .object({
    city: z.enum(ALL_CITIES_MAP, { message: "Pick a city from the list" }),
    country: z.string().nullable().optional(),
    start_date: z.string().min(1, "Start date is required").nullable(),
    end_date: z.string().min(1, "End date is required").nullable(),
    accommodation: AccommodationSchema.optional(),
  })
  .refine(
    (data) => {
      // Both nullable — skip the comparison if either is missing.
      if (!data.start_date || !data.end_date) return true;
      return data.end_date >= data.start_date;
    },
    {
      message: "End date must be on or after the start date",
      path: ["end_date"],
    },
  );

export type LocationFormValues = z.infer<typeof LocationSchema>;
export type AccommodationFormValues = z.infer<typeof AccommodationSchema>;

/**
 * Helper: resolve a city to its country. Call this in the modal's city onChange
 * to keep the country field in sync.
 */
export const countryForCity = (city: string): string | null => {
  const entry = COUNTRY_MAP.find((item) =>
    (item.cities as readonly string[]).includes(city),
  );
  return entry?.country ?? null;
};
