/**
 * src/constants/status.ts
 *
 * Single source of trip-status display metadata (label, color, description).
 *
 * The list of statuses and their order come from the generated DB enum via
 * `Constants.public.Enums.trip_status`, so regenerating the Supabase types
 * (`npm run gen:types`) keeps this in sync. The `STATUS_CONFIG` record is typed
 * `Record<TripStatus, …>`, which means adding a status to the DB enum will
 * raise a compile error here until display metadata is provided for it.
 *
 * `color` is a plain Mantine color name (no shade suffix) so it composes
 * cleanly with `${color}.N` and with `<Badge color={color} />`.
 */

import { Constants } from "@/types/database.types";
import type { TripStatus } from "@/types/models";

export interface TripStatusConfig {
  id: TripStatus;
  label: string;
  color: string;
  description?: string;
}

// Per-status display metadata. Colors map to Mantine palette names — swap them
// freely; nothing else needs to change.
const STATUS_CONFIG: Record<TripStatus, Omit<TripStatusConfig, "id">> = {
  planning: {
    label: "Planning",
    color: "peach",
  },
  active: {
    label: "Active",
    color: "mint",
    description: "Auto on start date or start early",
  },
  completed: {
    label: "Completed",
    color: "lavender",
    description: "Auto on end date or mark done now",
  },
  archived: {
    label: "Archived",
    color: "gray",
    description: "Shelve it — can be restored anytime",
  },
};

/** Ordered list of statuses, driven by the DB enum order. */
export const STATUS_MAP: TripStatusConfig[] =
  Constants.public.Enums.trip_status.map((id) => ({
    id,
    ...STATUS_CONFIG[id],
  }));

/** id -> config, for O(1) lookups. */
export const STATUS_INFO = Object.fromEntries(
  STATUS_MAP.map((s) => [s.id, s]),
) as Record<TripStatus, TripStatusConfig>;

/**
 * Config for a status id, falling back to the first status (planning) if an
 * unrecognised value is passed. Never returns undefined.
 */
export const getStatusColor = (status: string): TripStatusConfig =>
  STATUS_INFO[status as TripStatus] ?? STATUS_MAP[0];

/** { value, label }[] for a Mantine <Select data={...} />. */
export const STATUS_SELECT_OPTIONS = STATUS_MAP.map(({ id, label }) => ({
  value: id,
  label,
}));

/** Filter list (adds a synthetic "all" entry ahead of the real statuses). */
export const TRIP_STATUS_FILTERS = [
  { id: "all" as const, label: "All", color: "lavender" },
  ...STATUS_MAP,
];

export type TripFilter = (typeof TRIP_STATUS_FILTERS)[number]["id"];
