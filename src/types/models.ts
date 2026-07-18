import type { Database } from "./database.types";

type Tables = Database["public"]["Tables"];
type Views = Database["public"]["Views"];

export type Profile = Tables["profiles"]["Row"];
export type Trip = Tables["trips"]["Row"];
export type Location = Tables["locations"]["Row"];
export type Accommodation = Tables["accommodations"]["Row"];
export type Activity = Tables["activities"]["Row"];
export type Transport = Tables["transports"]["Row"];
export type Todo = Tables["todos"]["Row"];
export type TripMember = Tables["trip_members"]["Row"];

export type NewTrip = Tables["trips"]["Insert"];
export type TripUpdate = Tables["trips"]["Update"];

export type TripStatus = Database["public"]["Enums"]["trip_status"];
export type MemberRole = Database["public"]["Enums"]["member_role"];
export type AppRole = Database["public"]["Enums"]["app_role"];

export type LocationCostSummary = Views["location_cost_summary"]["Row"];
export type TripCostSummary = Views["trip_cost_summary"]["Row"];
export type TripBudgetSummary = Views["trip_budget_summary"]["Row"];

// A location with its optional accommodation joined in.
export type LocationWithStay = Location & {
  accommodation: Accommodation | null;
};
