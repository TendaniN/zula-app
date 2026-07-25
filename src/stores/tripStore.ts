import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";
import type {
  Trip,
  TripInsert,
  TripUpdate,
  TripMemberWithProfile,
} from "@/types/models";

/** Fields a create form supplies; owner_id is injected from the session. */
export type NewTripInput = Omit<TripInsert, "owner_id">;

interface TripState {
  trips: Trip[];
  currentTrip: Trip | null;
  currentMembers: TripMemberWithProfile[];
  loading: boolean;
  error: string | null;

  fetchTrips: () => Promise<void>;
  fetchTrip: (id: string) => Promise<void>;
  fetchMembers: (tripId: string) => Promise<void>;
  createTrip: (input: NewTripInput) => Promise<Trip | null>;
  updateTrip: (id: string, patch: TripUpdate) => Promise<void>;
  deleteTrip: (id: string) => Promise<void>;
  archiveTrip: (id: string) => Promise<void>;
  clearCurrent: () => void;
}

export const useTripStore = create<TripState>((set, get) => ({
  trips: [],
  currentTrip: null,
  currentMembers: [],
  loading: false,
  error: null,

  fetchTrips: async () => {
    set({ loading: true, error: null });
    // RLS scopes results to trips the user owns or is a member of.
    // Swap to `.from("trip_summary")` if you want precomputed costs/countries.
    const { data, error } = await supabase
      .from("trips")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) set({ error: error.message });
    else set({ trips: data ?? [] });
    set({ loading: false });
  },

  fetchTrip: async (id) => {
    set({ loading: true, error: null });
    const { data, error } = await supabase
      .from("trips")
      .select("*")
      .eq("id", id)
      .single();
    if (error) set({ error: error.message });
    else set({ currentTrip: data });
    set({ loading: false });
    await get().fetchMembers(id);
  },

  fetchMembers: async (tripId) => {
    const { data, error } = await supabase
      .from("trip_members")
      .select("*, profile:profiles(*)")
      .eq("trip_id", tripId);
    if (error) {
      set({ error: error.message });
      return;
    }
    set({ currentMembers: (data as TripMemberWithProfile[]) ?? [] });
  },

  createTrip: async (input) => {
    const ownerId = useAuthStore.getState().user?.id;
    if (!ownerId) throw new Error("Not authenticated");

    const payload: TripInsert = { ...input, owner_id: ownerId };
    const { data, error } = await supabase
      .from("trips")
      .insert(payload)
      .select()
      .single();
    if (error) {
      set({ error: error.message });
      throw error;
    }

    set((state) => ({ trips: [data, ...state.trips] }));
    return data;
  },

  updateTrip: async (id, patch) => {
    const { data, error } = await supabase
      .from("trips")
      .update(patch)
      .eq("id", id)
      .select()
      .single();
    if (error) {
      set({ error: error.message });
      throw error;
    }
    set((state) => ({
      trips: state.trips.map((t) => (t.id === id ? data : t)),
      currentTrip: state.currentTrip?.id === id ? data : state.currentTrip,
    }));
  },

  deleteTrip: async (id) => {
    const { error } = await supabase.from("trips").delete().eq("id", id);
    if (error) {
      set({ error: error.message });
      throw error;
    }
    set((state) => ({
      trips: state.trips.filter((t) => t.id !== id),
      currentTrip: state.currentTrip?.id === id ? null : state.currentTrip,
    }));
  },

  archiveTrip: async (id) => {
    await get().updateTrip(id, { status: "archived" });
  },

  clearCurrent: () => set({ currentTrip: null, currentMembers: [] }),
}));
