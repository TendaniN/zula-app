/**
 * Itinerary activities. Activities belong to a location (no direct trip_id), so
 * this is scoped per location. The itinerary page can fetch per location as it
 * renders each stop, or call fetchByLocations with the trip's location ids.
 */

import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { Activity, ActivityInsert, ActivityUpdate } from "@/types/models";

export type NewActivityInput = Omit<ActivityInsert, "location_id">;

interface ActivityState {
  activities: Activity[];
  loading: boolean;
  error: string | null;

  fetchByLocation: (locationId: string) => Promise<void>;
  fetchByLocations: (locationIds: string[]) => Promise<void>;
  byLocation: (locationId: string) => Activity[];
  createActivity: (
    locationId: string,
    input: NewActivityInput,
  ) => Promise<Activity | null>;
  updateActivity: (id: string, patch: ActivityUpdate) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
  clear: () => void;
}

export const useActivityStore = create<ActivityState>((set, get) => ({
  activities: [],
  loading: false,
  error: null,

  fetchByLocation: async (locationId) => {
    set({ loading: true, error: null });
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .eq("location_id", locationId)
      .order("activity_date", { ascending: true })
      .order("activity_time", { ascending: true });
    if (error) set({ error: error.message });
    else
      set((state) => ({
        // Replace this location's activities, keep the rest.
        activities: [
          ...state.activities.filter((a) => a.location_id !== locationId),
          ...(data ?? []),
        ],
      }));
    set({ loading: false });
  },

  fetchByLocations: async (locationIds) => {
    set({ loading: true, error: null });
    if (locationIds.length === 0) {
      set({ activities: [], loading: false });
      return;
    }
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .in("location_id", locationIds)
      .order("activity_date", { ascending: true })
      .order("activity_time", { ascending: true });
    if (error) set({ error: error.message });
    else set({ activities: data ?? [] });
    set({ loading: false });
  },

  byLocation: (locationId) =>
    get().activities.filter((a) => a.location_id === locationId),

  createActivity: async (locationId, input) => {
    const payload: ActivityInsert = { ...input, location_id: locationId };
    const { data, error } = await supabase
      .from("activities")
      .insert(payload)
      .select()
      .single();
    if (error) {
      set({ error: error.message });
      throw error;
    }
    set((state) => ({ activities: [...state.activities, data] }));
    return data;
  },

  updateActivity: async (id, patch) => {
    const { data, error } = await supabase
      .from("activities")
      .update(patch)
      .eq("id", id)
      .select()
      .single();
    if (error) {
      set({ error: error.message });
      throw error;
    }
    set((state) => ({
      activities: state.activities.map((a) => (a.id === id ? data : a)),
    }));
  },

  deleteActivity: async (id) => {
    const { error } = await supabase.from("activities").delete().eq("id", id);
    if (error) {
      set({ error: error.message });
      throw error;
    }
    set((state) => ({
      activities: state.activities.filter((a) => a.id !== id),
    }));
  },

  clear: () => set({ activities: [] }),
}));
