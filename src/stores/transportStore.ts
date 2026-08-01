/**
 * Trip-level transport legs (flights, trains, etc.). Scoped by trip.
 * Optional start_location_id / end_location_id link legs to trip locations.
 */

import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type {
  Transport,
  TransportInsert,
  TransportUpdate,
} from "@/types/models";

export type NewTransportInput = Omit<TransportInsert, "trip_id">;

interface TransportState {
  transports: Transport[];
  loading: boolean;
  error: string | null;

  fetchByTrip: (tripId: string) => Promise<void>;
  createTransport: (
    tripId: string,
    input: NewTransportInput,
  ) => Promise<Transport | null>;
  updateTransport: (id: string, patch: TransportUpdate) => Promise<void>;
  deleteTransport: (id: string) => Promise<void>;
  clear: () => void;
}

export const useTransportStore = create<TransportState>((set) => ({
  transports: [],
  loading: false,
  error: null,

  fetchByTrip: async (tripId) => {
    set({ loading: true, error: null });
    const { data, error } = await supabase
      .from("transports")
      .select("*")
      .eq("trip_id", tripId)
      .order("start_date", { ascending: true });
    if (error) set({ error: error.message });
    else set({ transports: data ?? [] });
    set({ loading: false });
  },

  createTransport: async (tripId, input) => {
    const payload: TransportInsert = { ...input, trip_id: tripId };
    const { data, error } = await supabase
      .from("transports")
      .insert(payload)
      .select()
      .single();
    if (error) {
      set({ error: error.message });
      throw error;
    }
    set((state) => ({ transports: [...state.transports, data] }));
    return data;
  },

  updateTransport: async (id, patch) => {
    const { data, error } = await supabase
      .from("transports")
      .update(patch)
      .eq("id", id)
      .select()
      .single();
    if (error) {
      set({ error: error.message });
      throw error;
    }
    set((state) => ({
      transports: state.transports.map((t) => (t.id === id ? data : t)),
    }));
  },

  deleteTransport: async (id) => {
    const { error } = await supabase.from("transports").delete().eq("id", id);
    if (error) {
      set({ error: error.message });
      throw error;
    }
    set((state) => ({
      transports: state.transports.filter((t) => t.id !== id),
    }));
  },

  clear: () => set({ transports: [] }),
}));
