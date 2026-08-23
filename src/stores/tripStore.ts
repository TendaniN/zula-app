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

/** Roles assignable via the share UI (owner is not assignable). */
export type AssignableRole = "editor" | "viewer";

/**
 * A pending (not-yet-redeemed) invite. Sourced from the pending_invites table
 * once it exists; kept in the store alongside members so the ShareModal reads
 * one place.
 */
export interface PendingInvite {
  email: string;
  role: AssignableRole;
}

interface TripState {
  trips: Trip[];
  tripSummaries: TripSummaryRow[];
  currentTrip: Trip | null;
  currentTripSummary: TripSummaryRow | null;
  currentMembers: TripMemberWithProfile[];
  currentInvites: PendingInvite[];
  loading: boolean;
  error: string | null;

  fetchTrips: () => Promise<void>;
  fetchTrip: (id: string) => Promise<void>;
  fetchMembers: (tripId: string) => Promise<void>;
  fetchInvites: (tripId: string) => Promise<void>;
  createTrip: (input: NewTripInput) => Promise<Trip | null>;
  updateTrip: (id: string, patch: TripUpdate) => Promise<void>;
  deleteTrip: (id: string) => Promise<void>;
  archiveTrip: (id: string) => Promise<void>;

  // Member / invite management. These call SECURITY DEFINER RPCs — direct
  // table writes to trip_members / pending_invites stay blocked by RLS so a
  // non-owner can't grant themselves access. All refresh from the server
  // after mutating, since the source of truth (roles, redeemed state) lives
  // in the DB.
  inviteMember: (
    tripId: string,
    email: string,
    role: AssignableRole,
  ) => Promise<void>;
  changeMemberRole: (
    tripId: string,
    userId: string,
    role: AssignableRole,
  ) => Promise<void>;
  removeMember: (tripId: string, userId: string) => Promise<void>;
  resendInvite: (tripId: string, email: string) => Promise<void>;
  revokeInvite: (tripId: string, email: string) => Promise<void>;

  clearCurrent: () => void;
}

export const useTripStore = create<TripState>((set, get) => ({
  trips: [],
  tripSummaries: [],
  currentTrip: null,
  currentTripSummary: null,
  currentMembers: [],
  currentInvites: [],
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
    // Members and pending invites both belong to the opened trip; fetch in
    // parallel.
    await Promise.all([get().fetchMembers(id), get().fetchInvites(id)]);
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

  fetchInvites: async (tripId) => {
    // pending_invites: unredeemed rows for this trip. RLS lets the owner/admin
    // read all rows for their trip. Guarded so that if the table doesn't exist
    // yet the app doesn't hard-crash — remove the guard once it's created.
    const { data, error } = await supabase
      .from("pending_invites")
      .select("email, role")
      .eq("trip_id", tripId)
      .is("redeemed_at", null);
    if (error) {
      // Table may not exist yet; don't clobber the whole trip view over it.
      set({ currentInvites: [] });
      return;
    }
    set({ currentInvites: (data as PendingInvite[]) ?? [] });
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

  // ── Member / invite management ─────────────────────────────────────────────

  inviteMember: async (tripId, email, role) => {
    // invite_traveller writes to pending_invites (always — see the invite
    // issue; existing users are redeemed on next sign-in, not added directly).
    const { error } = await supabase.rpc("invite_traveller", {
      p_trip_id: tripId,
      p_email: email,
      role,
    });
    if (error) {
      set({ error: error.message });
      throw error;
    }
    // Refresh pending invites so the new row shows immediately.
    await get().fetchInvites(tripId);
  },

  changeMemberRole: async (tripId, userId, role) => {
    // Optimistic: reflect the new role on the row right away, roll back on error.
    const previous = get().currentMembers;
    set({
      currentMembers: previous.map((m) =>
        m.user_id === userId ? { ...m, role } : m,
      ),
    });

    const { error } = await supabase.rpc("set_member_role", {
      p_trip_id: tripId,
      p_user_id: userId,
      p_role: role,
    });
    if (error) {
      set({ currentMembers: previous, error: error.message });
      throw error;
    }
  },

  removeMember: async (tripId, userId) => {
    const previous = get().currentMembers;
    // Optimistic removal.
    set({
      currentMembers: previous.filter((m) => m.user_id !== userId),
    });

    const { error } = await supabase.rpc("remove_member", {
      p_trip_id: tripId,
      p_user_id: userId,
    });
    if (error) {
      set({ currentMembers: previous, error: error.message });
      throw error;
    }
  },

  resendInvite: async (tripId, email) => {
    // No local state change — just re-triggers the invite email server-side.
    const { error } = await supabase.rpc("resend_invite", {
      p_trip_id: tripId,
      p_email: email,
    });
    if (error) {
      set({ error: error.message });
      throw error;
    }
  },

  revokeInvite: async (tripId, email) => {
    const previous = get().currentInvites;
    // Optimistic removal from the pending list.
    set({
      currentInvites: previous.filter((i) => i.email !== email),
    });

    const { error } = await supabase.rpc("revoke_invite", {
      p_trip_id: tripId,
      p_email: email,
    });
    if (error) {
      set({ currentInvites: previous, error: error.message });
      throw error;
    }
  },

  clearCurrent: () =>
    set({
      currentTrip: null,
      currentTripSummary: null,
      currentMembers: [],
      currentInvites: [],
    }),
}));
