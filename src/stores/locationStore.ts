/**
 * Locations for the active trip, plus each location's 0..1 accommodation
 * (a location has at most one) and its cost summary (location_cost_summary
 * view — accommodation_total, activities_total, location_total). Scoped by
 * trip: call fetchByTrip(tripId) when a trip opens. Accommodation helpers
 * use upsert since it's a 1:0..1 relationship.
 */

import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type {
  Location,
  LocationInsert,
  LocationUpdate,
  Accommodation,
  AccommodationInsert,
  AccommodationUpdate,
  LocationCostSummary,
} from "@/types/models";

export type NewLocationInput = Omit<LocationInsert, "trip_id">;

interface LocationState {
  locations: Location[];
  accommodations: Accommodation[];
  locationSummaries: LocationCostSummary[];
  loading: boolean;
  error: string | null;

  fetchByTrip: (tripId: string) => Promise<void>;
  createLocation: (
    tripId: string,
    input: NewLocationInput,
  ) => Promise<Location | null>;
  updateLocation: (id: string, patch: LocationUpdate) => Promise<void>;
  deleteLocation: (id: string) => Promise<void>;

  accommodationFor: (locationId: string) => Accommodation | undefined;
  summaryFor: (locationId: string) => LocationCostSummary | undefined;
  saveAccommodation: (
    input:
      | AccommodationInsert
      | (AccommodationUpdate & { id: string; location_id: string }),
  ) => Promise<void>;
  deleteAccommodation: (id: string) => Promise<void>;

  clear: () => void;
}

export const useLocationStore = create<LocationState>((set, get) => ({
  locations: [],
  accommodations: [],
  locationSummaries: [],
  loading: false,
  error: null,

  fetchByTrip: async (tripId) => {
    set({ loading: true, error: null });

    // Locations and the cost-summary view are both keyed by trip_id, so
    // they can be fetched in parallel. Accommodations depend on the
    // resulting location ids, so that fetch has to happen after.
    const [locResult, summaryResult] = await Promise.all([
      supabase
        .from("locations")
        .select("*")
        .eq("trip_id", tripId)
        .order("sort_order", { ascending: true }),
      supabase.from("location_cost_summary").select("*").eq("trip_id", tripId),
    ]);

    if (locResult.error) {
      set({ error: locResult.error.message, loading: false });
      return;
    }
    if (summaryResult.error) {
      set({ error: summaryResult.error.message, loading: false });
      return;
    }

    const locations = locResult.data ?? [];
    const locationSummaries = summaryResult.data ?? [];

    const locationIds = locations.map((l) => l.id);
    let accommodations: Accommodation[] = [];
    if (locationIds.length) {
      const { data, error } = await supabase
        .from("accommodations")
        .select("*")
        .in("location_id", locationIds);
      if (error) {
        set({ error: error.message, loading: false });
        return;
      }
      accommodations = data ?? [];
    }

    set({ locations, accommodations, locationSummaries, loading: false });
  },

  createLocation: async (tripId, input) => {
    const payload: LocationInsert = { ...input, trip_id: tripId };
    const { data, error } = await supabase
      .from("locations")
      .insert(payload)
      .select()
      .single();
    if (error) {
      set({ error: error.message });
      throw error;
    }
    set((state) => ({ locations: [...state.locations, data] }));
    return data;
  },

  updateLocation: async (id, patch) => {
    const { data, error } = await supabase
      .from("locations")
      .update(patch)
      .eq("id", id)
      .select()
      .single();
    if (error) {
      set({ error: error.message });
      throw error;
    }
    set((state) => ({
      locations: state.locations.map((l) => (l.id === id ? data : l)),
    }));
  },

  deleteLocation: async (id) => {
    const { error } = await supabase.from("locations").delete().eq("id", id);
    if (error) {
      set({ error: error.message });
      throw error;
    }
    set((state) => ({
      locations: state.locations.filter((l) => l.id !== id),
      // Cascade in the DB removes the accommodation; mirror that locally.
      accommodations: state.accommodations.filter((a) => a.location_id !== id),
      locationSummaries: state.locationSummaries.filter(
        (s) => s.location_id !== id,
      ),
    }));
  },

  accommodationFor: (locationId) =>
    get().accommodations.find((a) => a.location_id === locationId),

  summaryFor: (locationId) =>
    get().locationSummaries.find((s) => s.location_id === locationId),

  saveAccommodation: async (
    input:
      | AccommodationInsert
      | (AccommodationUpdate & { id: string; location_id: string }),
  ) => {
    // Upsert keeps the 1:0..1 invariant — insert on first save, update after.
    const { data, error } = await supabase
      .from("accommodations")
      .upsert(input as AccommodationInsert)
      .select()
      .single();
    if (error) {
      set({ error: error.message });
      throw error;
    }
    set((state) => {
      const exists = state.accommodations.some((a) => a.id === data.id);
      return {
        accommodations: exists
          ? state.accommodations.map((a) => (a.id === data.id ? data : a))
          : [...state.accommodations, data],
      };
    });
  },

  deleteAccommodation: async (id) => {
    const { error } = await supabase
      .from("accommodations")
      .delete()
      .eq("id", id);
    if (error) {
      set({ error: error.message });
      throw error;
    }
    set((state) => ({
      accommodations: state.accommodations.filter((a) => a.id !== id),
    }));
  },

  clear: () =>
    set({ locations: [], accommodations: [], locationSummaries: [] }),
}));
