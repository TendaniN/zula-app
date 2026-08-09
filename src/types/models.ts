/**
 *
 * Friendly aliases over the generated Supabase types (src/types/database.types.ts).
 * Everything here is derived — never hand-edit the shapes; regenerate the base
 * types with `npm run gen:types` and these follow automatically.
 */

import type {
  Tables,
  TablesInsert,
  TablesUpdate,
  Enums,
} from "./database.types";

// ── Table row aliases ──────────────────────────────────────────────────────
export type Profile = Tables<"profiles">;
export type Trip = Tables<"trips">;
export type TripMember = Tables<"trip_members">;
export type Location = Tables<"locations">;
export type Accommodation = Tables<"accommodations">;
export type Activity = Tables<"activities">;
export type Transport = Tables<"transports">;
export type Todo = Tables<"todos">;

// ── View row aliases (read-only; all columns nullable per PostgREST) ─────────
export type LocationCostSummary = Tables<"location_cost_summary">;
export type TripCostSummary = Tables<"trip_cost_summary">;
export type TripBudgetSummary = Tables<"trip_budget_summary">;
export type TripMonthlyBudget = Tables<"trip_monthly_budget">;
export type TripSummaryRow = Tables<"trip_summary">;

// ── Insert / Update payload aliases (for forms + mutations) ──────────────────
export type TripInsert = TablesInsert<"trips">;
export type TripUpdate = TablesUpdate<"trips">;
export type LocationInsert = TablesInsert<"locations">;
export type LocationUpdate = TablesUpdate<"locations">;
export type AccommodationInsert = TablesInsert<"accommodations">;
export type AccommodationUpdate = TablesUpdate<"accommodations">;
export type ActivityInsert = TablesInsert<"activities">;
export type ActivityUpdate = TablesUpdate<"activities">;
export type TransportInsert = TablesInsert<"transports">;
export type TransportUpdate = TablesUpdate<"transports">;
export type TodoInsert = TablesInsert<"todos">;
export type TodoUpdate = TablesUpdate<"todos">;
export type ProfileUpdate = TablesUpdate<"profiles">;

// ── Enum aliases ─────────────────────────────────────────────────────────────
export type TripStatus = Enums<"trip_status">;
export type AccommodationType = Enums<"accommodation_type">;
export type ActivityType = Enums<"activity_type">;
export type TransportType = Enums<"transport_type">;
export type MemberRole = Enums<"member_role">;
export type AppRole = Enums<"app_role">;

// ── Common joined query shapes ───────────────────────────────────────────────
/** trip_members joined with the member's profile (the usual members query). */
export type TripMemberWithProfile = TripMember & {
  profile: Profile | null;
};
