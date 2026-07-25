import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";
import type {
  Trip,
  TripInsert,
  TripUpdate,
  TripMemberWithProfile,
  TripSummaryRow,
} from "@/types/models";

/** Fields a create form supplies; owner_id is injected from the session. */
export type NewTripInput = Omit<TripInsert, "owner_id">;

interface TripState {
  trips: Trip[];
  tripSummaries: TripSummaryRow[];
  currentTrip: Trip | null;
  currentTripSummary: TripSummaryRow | null;
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
  tripSummaries: [],
  currentTrip: null,
  currentTripSummary: null,
  currentMembers: [],
  loading: false,
  error: null,

  fetchTrips: async () => {
    set({ loading: true, error: null });

    // Fetch raw trips and their summaries in parallel. RLS on trips scopes
    // both queries to trips the user owns or is a member of.
    const [tripsResult, summariesResult] = await Promise.all([
      supabase
        .from("trips")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("trip_summary")
        .select("*")
        .order("created_at", { ascending: false }),
    ]);

    if (tripsResult.error) set({ error: tripsResult.error.message });
    else if (summariesResult.error)
      set({ error: summariesResult.error.message });
    else
      set({
        trips: tripsResult.data ?? [],
        tripSummaries: summariesResult.data ?? [],
      });

    set({ loading: false });
  },

  fetchTrip: async (id) => {
    set({ loading: true, error: null });

    // Fetch the raw trip row and its summary in parallel.
    const [tripResult, summaryResult] = await Promise.all([
      supabase.from("trips").select("*").eq("id", id).single(),
      supabase.from("trip_summary").select("*").eq("id", id).single(),
    ]);

    if (tripResult.error) set({ error: tripResult.error.message });
    else if (summaryResult.error) set({ error: summaryResult.error.message });
    else
      set({
        currentTrip: tripResult.data,
        currentTripSummary: summaryResult.data,
      });

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

    // Fetch the new summary so tripSummaries stays in sync.
    const { data: summary } = await supabase
      .from("trip_summary")
      .select("*")
      .eq("id", data.id)
      .single();

    set((state) => ({
      trips: [data, ...state.trips],
      tripSummaries: summary
        ? [summary, ...state.tripSummaries]
        : state.tripSummaries,
    }));

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

    // Re-fetch the summary so costs/countries/dates stay accurate.
    const { data: summary } = await supabase
      .from("trip_summary")
      .select("*")
      .eq("id", id)
      .single();

    set((state) => ({
      trips: state.trips.map((t) => (t.id === id ? data : t)),
      tripSummaries: summary
        ? state.tripSummaries.map((s) => (s.id === id ? summary : s))
        : state.tripSummaries,
      currentTrip: state.currentTrip?.id === id ? data : state.currentTrip,
      currentTripSummary:
        state.currentTripSummary?.id === id
          ? (summary ?? state.currentTripSummary)
          : state.currentTripSummary,
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
      tripSummaries: state.tripSummaries.filter((s) => s.id !== id),
      currentTrip: state.currentTrip?.id === id ? null : state.currentTrip,
      currentTripSummary:
        state.currentTripSummary?.id === id ? null : state.currentTripSummary,
    }));
  },

  archiveTrip: async (id) => {
    await get().updateTrip(id, { status: "archived" });
  },

  clearCurrent: () =>
    set({ currentTrip: null, currentTripSummary: null, currentMembers: [] }),
}));
