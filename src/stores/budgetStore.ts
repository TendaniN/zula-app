/**
 * Per-trip savings-plan config (the timespan-in-months for each budget
 * category). Costs are NOT stored here — they come from trip_summary — so
 * this store only owns the four editable month values.
 *
 * Edits are optimistic: local state updates immediately so the +/- steppers
 * feel instant, then the change is persisted via upsert. Falls back to
 * DEFAULT_BUDGET_MONTHS when a trip has no saved config yet.
 */

import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { DEFAULT_BUDGET_MONTHS, type BudgetMonths } from "@/constants/budget";

const MIN_MONTHS = 1;
const MAX_MONTHS = 24;

/** DB row (snake_case, per-category *_months) → BudgetMonths (app-facing). */
const rowToMonths = (row: {
  accommodation_months: number;
  activities_months: number;
  transport_months: number;
  buffer_months: number;
}): BudgetMonths => ({
  accommodation: row.accommodation_months,
  activities: row.activities_months,
  transport: row.transport_months,
  buffer: row.buffer_months,
});

/** BudgetMonths → DB columns, including the trip_id for upsert. */
const monthsToRow = (tripId: string, months: BudgetMonths) => ({
  trip_id: tripId,
  accommodation_months: months.accommodation,
  activities_months: months.activities,
  transport_months: months.transport,
  buffer_months: months.buffer,
});

interface BudgetState {
  /** Which trip the current `months` belong to (null before first fetch). */
  tripId: string | null;
  months: BudgetMonths;
  loading: boolean;
  error: string | null;

  fetchByTrip: (tripId: string) => Promise<void>;
  setMonths: (tripId: string, months: BudgetMonths) => Promise<void>;
  adjustMonth: (
    tripId: string,
    key: keyof BudgetMonths,
    delta: number,
  ) => Promise<void>;
  clear: () => void;
}

export const useBudgetStore = create<BudgetState>((set, get) => ({
  tripId: null,
  months: DEFAULT_BUDGET_MONTHS,
  loading: false,
  error: null,

  fetchByTrip: async (tripId) => {
    set({ loading: true, error: null });

    // maybeSingle() — a trip may not have a config row yet; that's not an
    // error, we just fall back to defaults.
    const { data, error } = await supabase
      .from("budget_configs")
      .select("*")
      .eq("trip_id", tripId)
      .maybeSingle();

    if (error) {
      set({ error: error.message, loading: false });
      return;
    }

    set({
      tripId,
      months: data ? rowToMonths(data) : DEFAULT_BUDGET_MONTHS,
      loading: false,
    });
  },

  setMonths: async (tripId, months) => {
    // Optimistic: reflect the new value immediately.
    const previous = get().months;
    set({ tripId, months });

    const { error } = await supabase
      .from("budget_configs")
      .upsert(monthsToRow(tripId, months), { onConflict: "trip_id" });

    if (error) {
      // Roll back on failure so the UI doesn't show an unsaved value.
      set({ months: previous, error: error.message });
    }
  },

  adjustMonth: async (tripId, key, delta) => {
    const current = get().months;
    const next: BudgetMonths = {
      ...current,
      [key]: Math.min(MAX_MONTHS, Math.max(MIN_MONTHS, current[key] + delta)),
    };
    await get().setMonths(tripId, next);
  },

  clear: () =>
    set({ tripId: null, months: DEFAULT_BUDGET_MONTHS, error: null }),
}));
